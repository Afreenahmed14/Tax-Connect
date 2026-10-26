
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Keep synchronized with the Payment model enum.
const ALLOWED_PAYMENT_MODES = [
  'cash',
  'upi',
  'bank_transfer',
  'cheque',
  'razorpay',
];

const canManagePayments = (role) =>
  ['admin', 'consultant'].includes(role);

// Password is excluded by the User schema's select: false setting.
const RECORDED_BY_FIELDS = 'name email role';

const getClientAccess = async (user) => {
  if (user.role === 'admin') return null;

  if (user.role === 'consultant') {
    const clients = await Client.find({
      assignedConsultant: user._id,
    }).distinct('_id');

    return { $in: clients };
  }

  return { $in: [] };
};

// GET /api/v1/payments
exports.getPayments = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 20)
  );

  const filter = {};

  if (req.user.role === 'admin') {
    // Admin can view all payments.
  } else if (req.user.role === 'consultant') {
    filter.client = await getClientAccess(req.user);
  } else {
    throw new ApiError(403, 'You are not authorized to view payments');
  }

  if (req.query.invoice) {
    if (!mongoose.isValidObjectId(req.query.invoice)) {
      throw new ApiError(400, 'Invalid invoice ID format');
    }

    filter.invoice = req.query.invoice;
  }

  if (req.query.client) {
    if (!mongoose.isValidObjectId(req.query.client)) {
      throw new ApiError(400, 'Invalid client ID format');
    }

    if (req.user.role === 'consultant') {
      const access = filter.client;
      const allowed = access.$in.some(
        (id) => id.toString() === req.query.client
      );

      if (!allowed) {
        throw new ApiError(
          403,
          'You are not authorized to access payments for this client'
        );
      }
    }

    filter.client = req.query.client;
  }

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate('invoice', 'invoiceNumber totalAmount paidAmount status')
      .populate('client', 'name email businessName')
      .populate('recordedBy', RECORDED_BY_FIELDS)
      .sort({ paidAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Payment.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Payments retrieved successfully',
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// GET /api/v1/payments/:id
exports.getPaymentById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid payment ID format');
  }

  if (!canManagePayments(req.user.role)) {
    throw new ApiError(403, 'You are not authorized to view payments');
  }

  const filter = { _id: req.params.id };

  if (req.user.role === 'consultant') {
    filter.client = await getClientAccess(req.user);
  }

  const payment = await Payment.findOne(filter)
    .populate('invoice', 'invoiceNumber totalAmount paidAmount status')
    .populate('client', 'name email businessName')
    .populate('recordedBy', RECORDED_BY_FIELDS)
    .lean();

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  res.status(200).json({
    success: true,
    message: 'Payment retrieved successfully',
    data: payment,
  });
});

// POST /api/v1/payments
exports.createPayment = asyncHandler(async (req, res) => {
  if (!canManagePayments(req.user.role)) {
    throw new ApiError(403, 'You are not authorized to record payments');
  }

  const {
    invoice: invoiceId,
    amount,
    mode,
    reference,
    receiptNumber,
    paidAt,
  } = req.body;

  if (
    !invoiceId ||
    amount === undefined ||
    amount === null ||
    amount === ''
  ) {
    throw new ApiError(
      400,
      'Invoice ID and payment amount are required'
    );
  }

  if (!mongoose.isValidObjectId(invoiceId)) {
    throw new ApiError(400, 'Invalid invoice ID format');
  }

  if (mode !== undefined && !ALLOWED_PAYMENT_MODES.includes(mode)) {
    throw new ApiError(
      400,
      `Invalid payment mode. Allowed values: ${ALLOWED_PAYMENT_MODES.join(', ')}`
    );
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new ApiError(
      400,
      'Payment amount must be a positive number'
    );
  }

  if (
    paidAt !== undefined &&
    (typeof paidAt !== 'string' || Number.isNaN(Date.parse(paidAt)))
  ) {
    throw new ApiError(
      400,
      'Invalid payment date. Provide a valid date string'
    );
  }

  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  if (req.user.role === 'consultant') {
    const client = await Client.findOne({
      _id: invoice.client,
      assignedConsultant: req.user._id,
    });

    if (!client) {
      throw new ApiError(
        403,
        'You are not authorized to record payments for this client'
      );
    }
  }

  if (invoice.paidAmount + numericAmount > invoice.totalAmount) {
    throw new ApiError(
      400,
      'Payment exceeds the remaining invoice balance'
    );
  }

  const session = await mongoose.startSession();

  try {
    let createdPayment;

    await session.withTransaction(async () => {
      // Atomically check the balance and update the invoice.
      const updatedInvoice = await Invoice.findOneAndUpdate(
        {
          _id: invoiceId,
          $expr: {
            $lte: [
              { $add: ['$paidAmount', numericAmount] },
              '$totalAmount',
            ],
          },
        },
        [
          {
            $set: {
              paidAmount: {
                $add: ['$paidAmount', numericAmount],
              },
            },
          },
          {
            $set: {
              status: {
                $cond: [
                  { $gte: ['$paidAmount', '$totalAmount'] },
                  'paid',
                  'partially_paid',
                ],
              },
            },
          },
        ],
        {
          new: true,
          session,
        }
      );

      if (!updatedInvoice) {
        throw new ApiError(
          400,
          'Payment exceeds the remaining invoice balance or the invoice balance has changed'
        );
      }

      const [payment] = await Payment.create(
        [
          {
            invoice: updatedInvoice._id,
            client: updatedInvoice.client,
            amount: numericAmount,
            mode: mode || 'cash',
            reference,
            receiptNumber,
            paidAt,
            recordedBy: req.user._id,
          },
        ],
        { session }
      );

      createdPayment = payment;
    });

    // Return only the fields needed by the API.
    const safePayment = await Payment.findById(createdPayment._id)
      .select('-__v')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: safePayment,
    });
  } finally {
    await session.endSession();
  }
});

// GET /api/v1/payments/invoice/:invoiceId
exports.getPaymentsByInvoice = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  if (!mongoose.isValidObjectId(invoiceId)) {
    throw new ApiError(400, 'Invalid invoice ID format');
  }

  if (!canManagePayments(req.user.role)) {
    throw new ApiError(
      403,
      'You are not authorized to view invoice payments'
    );
  }

  const invoice = await Invoice.findById(invoiceId).select('client');

  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  if (req.user.role === 'consultant') {
    const assigned = await Client.exists({
      _id: invoice.client,
      assignedConsultant: req.user._id,
    });

    if (!assigned) {
      throw new ApiError(
        403,
        'You are not authorized to access payments for this invoice'
      );
    }
  }

  const items = await Payment.find({ invoice: invoiceId })
    .select('-__v')
    .populate('recordedBy', RECORDED_BY_FIELDS)
    .sort({ paidAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    message: 'Invoice payments retrieved successfully',
    data: items,
  });
});
