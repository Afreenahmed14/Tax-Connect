
const mongoose = require('mongoose');
const Deadline = require('../models/Deadline');
const Client = require('../models/Client');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const allowedRoles = ['admin', 'consultant', 'staff'];

const getDeadlines = asyncHandler(async (req, res) => {
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to view deadlines');
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};

  if (req.query.client) {
    if (!mongoose.isValidObjectId(req.query.client)) {
      throw new ApiError(400, 'Invalid client ID');
    }
    filter.client = req.query.client;
  }

  if (req.query.status) {
    if (!['upcoming', 'completed', 'overdue'].includes(req.query.status)) {
      throw new ApiError(400, 'Invalid deadline status');
    }
    filter.status = req.query.status;
  }

  // Staff can view only deadlines assigned to them.
  if (req.user.role === 'staff') {
    filter.assignedTo = req.user._id;
  }

  const [items, total] = await Promise.all([
    Deadline.find(filter)
      .populate('client', 'name email businessName')
      .populate('assignedTo', 'name email role')
      // .populate('createdBy', 'name email role')
      .populate('createdBy', 'name email role -password')
      .sort({ dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Deadline.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Deadlines retrieved successfully',
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

const getDeadlineById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid deadline ID');
  }

  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to view deadlines');
  }

  const filter = { _id: req.params.id };

  if (req.user.role === 'staff') {
    filter.assignedTo = req.user._id;
  }

  const deadline = await Deadline.findOne(filter)
    .populate('client', 'name email businessName')
    .populate('assignedTo', 'name email role')
    //.populate('createdBy', 'name email role');
    .populate('createdBy', 'name email role -password');

  if (!deadline) {
    throw new ApiError(404, 'Deadline not found');
  }

  res.status(200).json({
    success: true,
    message: 'Deadline retrieved successfully',
    data: deadline,
  });
});

const createDeadline = asyncHandler(async (req, res) => {
  if (!['admin', 'consultant'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to create deadlines');
  }

  const {
    title,
    client,
    deadlineType,
    dueDate,
    status,
    assignedTo,
    remarks,
  } = req.body;

  if (!title || !client || !dueDate) {
    throw new ApiError(400, 'Title, client and dueDate are required');
  }

  if (!mongoose.isValidObjectId(client)) {
    throw new ApiError(400, 'Invalid client ID');
  }

  if (!(await Client.exists({ _id: client }))) {
    throw new ApiError(404, 'Client not found');
  }

  if (Number.isNaN(Date.parse(dueDate))) {
    throw new ApiError(400, 'Invalid dueDate');
  }

  if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
    throw new ApiError(400, 'Invalid assignedTo user ID');
  }

  const deadline = await Deadline.create({
    title,
    client,
    deadlineType,
    dueDate,
    status,
    assignedTo,
    remarks,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Deadline created successfully',
    data: deadline,
  });
});

const updateDeadline = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid deadline ID');
  }

  if (!['admin', 'consultant'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to update deadlines');
  }

  const deadline = await Deadline.findById(req.params.id);

  if (!deadline) {
    throw new ApiError(404, 'Deadline not found');
  }

  const allowedFields = [
    'title',
    'client',
    'deadlineType',
    'dueDate',
    'status',
    'assignedTo',
    'remarks',
  ];

  if (req.body.client !== undefined) {
    if (!mongoose.isValidObjectId(req.body.client)) {
      throw new ApiError(400, 'Invalid client ID');
    }

    if (!(await Client.exists({ _id: req.body.client }))) {
      throw new ApiError(404, 'Client not found');
    }
  }

  if (
    req.body.dueDate !== undefined &&
    (typeof req.body.dueDate !== 'string' ||
      Number.isNaN(Date.parse(req.body.dueDate)))
  ) {
    throw new ApiError(400, 'Invalid dueDate');
  }

  if (req.body.status !== undefined &&
      !['upcoming', 'completed', 'overdue'].includes(req.body.status)) {
    throw new ApiError(400, 'Invalid deadline status');
  }

  if (req.body.assignedTo !== undefined && req.body.assignedTo !== '') {
    if (!mongoose.isValidObjectId(req.body.assignedTo)) {
      throw new ApiError(400, 'Invalid assignedTo user ID');
    }
  }

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      deadline[field] = req.body[field];
    }
  }

  await deadline.save();

  res.status(200).json({
    success: true,
    message: 'Deadline updated successfully',
    data: deadline,
  });
});

module.exports = {
  getDeadlines,
  getDeadlineById,
  createDeadline,
  updateDeadline,
};
