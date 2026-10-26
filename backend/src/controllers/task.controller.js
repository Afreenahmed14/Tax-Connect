// TODO

const mongoose = require('mongoose');
const Task = require('../models/Task');
const Client = require('../models/Client');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getTasks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const filter = {};

  if (req.query.client) {
    if (!mongoose.isValidObjectId(req.query.client)) {
      throw new ApiError(400, 'Invalid client ID');
    }
    filter.client = req.query.client;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

  // Staff can only view tasks assigned to them.
  if (req.user.role === 'staff') {
    filter.assignedTo = req.user._id;
  } else if (!['admin', 'consultant'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to view tasks');
  }

  const [items, total] = await Promise.all([
    Task.find(filter)
      .populate('client', 'name email businessName')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
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

const getTaskById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid task ID');
  }

  const task = await Task.findById(req.params.id)
    .populate('client', 'name email businessName')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');

  if (!task) throw new ApiError(404, 'Task not found');

  if (
    req.user.role === 'staff' &&
    String(task.assignedTo?._id) !== String(req.user._id)
  ) {
    throw new ApiError(404, 'Task not found');
  }

  if (!['admin', 'consultant', 'staff'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to view this task');
  }

  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: task,
  });
});

const createTask = asyncHandler(async (req, res) => {
  if (!['admin', 'consultant'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to create tasks');
  }

  const { title, client, clientService, taskType, dueDate, priority, assignedTo, status, remarks } = req.body;

  if (!title || !client || !dueDate) {
    throw new ApiError(400, 'Title, client and dueDate are required');
  }

  if (!mongoose.isValidObjectId(client)) {
    throw new ApiError(400, 'Invalid client ID');
  }

  const clientExists = await Client.findById(client);
  if (!clientExists) throw new ApiError(404, 'Client not found');

  if (clientService && !mongoose.isValidObjectId(clientService)) {
    throw new ApiError(400, 'Invalid clientService ID');
  }

  if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
    throw new ApiError(400, 'Invalid assignedTo user ID');
  }

  if (Number.isNaN(Date.parse(dueDate))) {
    throw new ApiError(400, 'Invalid dueDate');
  }

  const task = await Task.create({
    title,
    client,
    clientService,
    taskType,
    dueDate,
    priority,
    assignedTo,
    status,
    remarks,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid task ID');
  }

  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  const isAdminOrConsultant = ['admin', 'consultant'].includes(req.user.role);
  const isAssignedStaff =
    req.user.role === 'staff' &&
    String(task.assignedTo) === String(req.user._id);

  if (!isAdminOrConsultant && !isAssignedStaff) {
    throw new ApiError(403, 'You are not allowed to update this task');
  }

  const allowedFields = isAssignedStaff
    ? ['status', 'remarks']
    : [
        'title',
        'client',
        'clientService',
        'taskType',
        'dueDate',
        'priority',
        'assignedTo',
        'status',
        'remarks',
      ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  }

  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can delete tasks');
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid task ID');
  }

  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
