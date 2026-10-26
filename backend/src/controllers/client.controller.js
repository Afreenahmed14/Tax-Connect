// TODO

const mongoose = require('mongoose');
const Client = require('../models/Client');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/v1/clients
exports.getClients = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 10)
  );

  const filter = {};

  // Clients can only see their own client record.
  if (req.user.role === 'client') {
    filter.user = req.user._id;
  } else if (req.user.role === 'consultant') {
    filter.assignedConsultant = req.user._id;
  }

  if (req.query.status) {
    if (!['active', 'inactive'].includes(req.query.status)) {
      throw new ApiError(400, 'Status must be active or inactive');
    }
    filter.status = req.query.status;
  }

  const [clients, total] = await Promise.all([
    Client.find(filter)
      .populate('user', 'name email phone')
      .populate('assignedConsultant', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Client.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, {
    clients,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }, 'Clients fetched successfully'));
});

// GET /api/v1/clients/:id
exports.getClientById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid client ID');
  }

  const filter = { _id: req.params.id };

  if (req.user.role === 'client') {
    filter.user = req.user._id;
  } else if (req.user.role === 'consultant') {
    filter.assignedConsultant = req.user._id;
  }

  const client = await Client.findOne(filter)
    .populate('user', 'name email phone')
    .populate('assignedConsultant', 'name email');

  if (!client) throw new ApiError(404, 'Client not found');

  res.status(200).json(
    new ApiResponse(200, client, 'Client fetched successfully')
  );
});

// POST /api/v1/clients
exports.createClient = asyncHandler(async (req, res) => {
  if (req.user.role === 'client' || req.user.role === 'staff') {
    throw new ApiError(403, 'You are not allowed to create clients');
  }

  const {
    name,
    mobile,
    email,
    pan,
    gstin,
    businessName,
    businessType,
    address,
    financialYear,
    assignedConsultant,
  } = req.body;

  if (!name || !String(name).trim()) {
    throw new ApiError(400, 'Name is required');
  }

  if (!mobile || !String(mobile).trim()) {
    throw new ApiError(400, 'Mobile is required');
  }

  if (
    assignedConsultant &&
    !mongoose.isValidObjectId(assignedConsultant)
  ) {
    throw new ApiError(400, 'Invalid assignedConsultant ID');
  }

  const client = await Client.create({
    name: String(name).trim(),
    mobile: String(mobile).trim(),
    email,
    pan,
    gstin,
    businessName,
    businessType,
    address,
    financialYear,
    assignedConsultant: assignedConsultant || undefined,
  });

  res.status(201).json(
    new ApiResponse(201, client, 'Client created successfully')
  );
});

// PATCH /api/v1/clients/:id
exports.updateClient = asyncHandler(async (req, res) => {
  if (req.user.role === 'client' || req.user.role === 'staff') {
    throw new ApiError(403, 'You are not allowed to update clients');
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid client ID');
  }

  const allowedFields = [
    'name',
    'mobile',
    'email',
    'pan',
    'gstin',
    'businessName',
    'businessType',
    'address',
    'financialYear',
    'assignedConsultant',
    'status',
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (updates.assignedConsultant &&
      !mongoose.isValidObjectId(updates.assignedConsultant)) {
    throw new ApiError(400, 'Invalid assignedConsultant ID');
  }

  if (updates.status &&
      !['active', 'inactive'].includes(updates.status)) {
    throw new ApiError(400, 'Status must be active or inactive');
  }

  if (updates.name !== undefined && !String(updates.name).trim()) {
    throw new ApiError(400, 'Name cannot be empty');
  }

  if (updates.mobile !== undefined && !String(updates.mobile).trim()) {
    throw new ApiError(400, 'Mobile cannot be empty');
  }

  if (updates.name !== undefined) {
    updates.name = String(updates.name).trim();
  }

  if (updates.mobile !== undefined) {
    updates.mobile = String(updates.mobile).trim();
  }

  const filter = { _id: req.params.id };

  if (req.user.role === 'consultant') {
    filter.assignedConsultant = req.user._id;
  }

  const client = await Client.findOneAndUpdate(
    filter,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!client) throw new ApiError(404, 'Client not found');

  res.status(200).json(
    new ApiResponse(200, client, 'Client updated successfully')
  );
});

// DELETE /api/v1/clients/:id — soft delete
exports.deleteClient = asyncHandler(async (req, res) => {
  if (req.user.role === 'client' || req.user.role === 'staff') {
    throw new ApiError(403, 'You are not allowed to deactivate clients');
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid client ID');
  }

  const filter = { _id: req.params.id };

  if (req.user.role === 'consultant') {
    filter.assignedConsultant = req.user._id;
  }

  const client = await Client.findOneAndUpdate(
    filter,
    { $set: { status: 'inactive' } },
    { new: true, runValidators: true }
  );

  if (!client) throw new ApiError(404, 'Client not found');

  res.status(200).json(
    new ApiResponse(200, client, 'Client deactivated successfully')
  );
});
