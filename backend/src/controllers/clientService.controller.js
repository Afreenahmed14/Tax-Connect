
const mongoose = require('mongoose');
const ClientService = require('../models/ClientService');
const Client = require('../models/Client');
const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.createClientService = asyncHandler(async (req, res) => {
  if (!['admin', 'consultant'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to assign services');
  }

  const { client, service, fee, financialYear, consultant } = req.body;

  if (!client || !service || fee === undefined) {
    throw new ApiError(400, 'Client, service and fee are required');
  }

  if (
    !mongoose.isValidObjectId(client) ||
    !mongoose.isValidObjectId(service)
  ) {
    throw new ApiError(400, 'Invalid client or service ID');
  }

  if (!Number.isFinite(fee) || fee < 0) {
    throw new ApiError(400, 'Fee must be a non-negative number');
  }

  const clientRecord = await Client.findById(client);
  if (!clientRecord || clientRecord.status !== 'active') {
    throw new ApiError(404, 'Active client not found');
  }

  if (
    req.user.role === 'consultant' &&
    clientRecord.assignedConsultant?.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'You cannot assign services to this client');
  }

  const serviceRecord = await Service.findOne({
    _id: service,
    isActive: true,
  });

  if (!serviceRecord) {
    throw new ApiError(404, 'Active service not found');
  }

  const assignment = await ClientService.create({
    client,
    service,
    fee,
    financialYear,
    consultant: consultant || clientRecord.assignedConsultant || undefined,
  });

  res.status(201).json({
    success: true,
    message: 'Client service assigned successfully',
    data: assignment,
  });
});
