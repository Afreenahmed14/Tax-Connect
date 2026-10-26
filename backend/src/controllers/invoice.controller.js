// // TODO

// const mongoose = require('mongoose');
// const Invoice = require('../models/Invoice');
// const Client = require('../models/Client');
// const ApiError = require('../utils/ApiError');
// const asyncHandler = require('../utils/asyncHandler');

// const getInvoices = asyncHandler(async (req, res) => {
//   if (!['admin', 'consultant'].includes(req.user.role)) {
//     throw new ApiError(403, 'You are not allowed to view invoices');
//   }

//   const page = Math.max(1, parseInt(req.query.page, 10) || 1);
//   const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
//   const filter = {};

//   if (req.user.role === 'consultant') {
//     const clients = await Client.find({
//       assignedConsultant: req.user._id,
//     }).distinct('_id');

//     filter.client = { $in: clients };
//   }

//   if (req.query.client) {
//     if (!mongoose.isValidObjectId(req.query.client)) {
//       throw new ApiError(400, 'Invalid client ID');
//     }

//     if (req.user.role === 'consultant') {
//       const allowed = await Client.exists({
//         _id: req.query.client,
//         assignedConsultant: req.user._id,
//       });

//       if (!allowed) {
//         throw new ApiError(403, 'You cannot access this client');
//       }
//     }

//     filter.client = req.query.client;
//   }

//   if (req.query.status) {
//     if (!['pending', 'partially_paid', 'paid'].includes(req.query.status)) {
//       throw new ApiError(400, 'Invalid invoice status');
//     }
//     filter.status = req.query.status;
//   }

//   const [items, total] = await Promise.all([
//     Invoice.find(filter)
//       .populate('client', 'name email businessName')
//       .populate('clientService')
//       .sort({ issuedAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit),
//     Invoice.countDocuments(filter),
//   ]);

//   res.status(200).json({
//     success: true,
//     message: 'Invoices retrieved successfully',
//     data: {
//       items,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     },
//   });
// });

// const getInvoiceById = asyncHandler(async (req, res) => {
//   if (!mongoose.isValidObjectId(req.params.id)) {
//     throw new ApiError(400, 'Invalid invoice ID');
//   }

//   if (!['admin', 'consultant'].includes(req.user.role)) {
//     throw new ApiError(403, 'You are not allowed to view invoices');
//   }

//   const invoice = await Invoice.findById(req.params.id)
//     .populate('client', 'name email businessName assignedConsultant')
//     .populate('clientService');

//   if (!invoice) throw new ApiError(404, 'Invoice not found');

//   if (
//     req.user.role === 'consultant' &&
//     invoice.client.assignedConsultant?.toString() !== req.user._id.toString()
//   ) {
//     throw new ApiError(403, 'You cannot access this invoice');
//   }

//   res.status(200).json({
//     success: true,
//     message: 'Invoice retrieved successfully',
//     data: invoice,
//   });
// });

// module.exports = { getInvoices, getInvoiceById };

const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const ClientService = require('../models/ClientService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getInvoices = asyncHandler(async (req, res) => {
  if (!['admin', 'consultant'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to view invoices');
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};

  if (req.user.role === 'consultant') {
    const clients = await Client.find({
      assignedConsultant: req.user._id,
    }).distinct('_id');

    filter.client = { $in: clients };
  }

  if (req.query.client) {
    if (!mongoose.isValidObjectId(req.query.client)) {
      throw new ApiError(400, 'Invalid client ID');
    }

    if (req.user.role === 'consultant') {
      const allowed = await Client.exists({
        _id: req.query.client,
        assignedConsultant: req.user._id,
      });

      if (!allowed) {
        throw new ApiError(403, 'You cannot access this client');
      }
    }

    filter.client = req.query.client;
  }

  if (req.query.status) {
    if (!['pending', 'partially_paid', 'paid'].includes(req.query.status)) {
      throw new ApiError(400, 'Invalid invoice status');
    }
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    Invoice.find(filter)
      .populate('client', 'name email businessName')
      .populate('clientService')
      .sort({ issuedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Invoice.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Invoices retrieved successfully',
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

const getInvoiceById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid invoice ID');
  }

  if (!['admin', 'consultant'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to view invoices');
  }

  const invoice = await Invoice.findById(req.params.id)
    .populate('client', 'name email businessName assignedConsultant')
    .populate('clientService');

  if (!invoice) throw new ApiError(404, 'Invoice not found');

  if (
    req.user.role === 'consultant' &&
    invoice.client.assignedConsultant?.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'You cannot access this invoice');
  }

  res.status(200).json({
    success: true,
    message: 'Invoice retrieved successfully',
    data: invoice,
  });
});

const createInvoice = asyncHandler(async (req, res) => {
  if (!['admin', 'consultant'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to create invoices');
  }

  const { invoiceNumber, client, clientService, totalAmount } = req.body;

  if (!invoiceNumber || !client || !clientService || totalAmount === undefined) {
    throw new ApiError(
      400,
      'invoiceNumber, client, clientService and totalAmount are required'
    );
  }

  if (
    typeof invoiceNumber !== 'string' ||
    !invoiceNumber.trim() ||
    invoiceNumber.trim().length > 50
  ) {
    throw new ApiError(400, 'Invalid invoice number');
  }

  if (
    !mongoose.isValidObjectId(client) ||
    !mongoose.isValidObjectId(clientService)
  ) {
    throw new ApiError(400, 'Invalid client or client service ID');
  }

  const amount = Number(totalAmount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'totalAmount must be greater than zero');
  }

  const [clientDoc, clientServiceDoc] = await Promise.all([
    Client.findById(client),
    ClientService.findById(clientService),
  ]);

  if (!clientDoc) {
    throw new ApiError(404, 'Client not found');
  }

  if (!clientServiceDoc) {
    throw new ApiError(404, 'Client service not found');
  }

  if (clientServiceDoc.client.toString() !== clientDoc._id.toString()) {
    throw new ApiError(400, 'Client service does not belong to this client');
  }

  if (req.user.role === 'consultant') {
    if (
      !clientDoc.assignedConsultant ||
      clientDoc.assignedConsultant.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(403, 'You cannot create an invoice for this client');
    }
  }

  if (clientServiceDoc.status === 'completed') {
    throw new ApiError(400, 'Cannot invoice a completed client service');
  }

  const existingInvoice = await Invoice.exists({
    invoiceNumber: invoiceNumber.trim(),
  });

  if (existingInvoice) {
    throw new ApiError(409, 'Invoice number already exists');
  }

  try {
    const invoice = await Invoice.create({
      invoiceNumber: invoiceNumber.trim(),
      client: clientDoc._id,
      clientService: clientServiceDoc._id,
      totalAmount: amount,
      paidAmount: 0,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'Invoice number already exists');
    }
    throw error;
  }
});

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
};
