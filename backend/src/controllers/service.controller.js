// // TODO

// const Service = require('../models/Service');

// const listServices = async (req, res, next) => {
//   try {
//     const { search, active, page = 1, limit = 10 } = req.query;

//     const filter = {};

//     if (search) {
//       filter.name = { $regex: search, $options: 'i' };
//     }

//     if (active !== undefined) {
//       if (!['true', 'false'].includes(active)) {
//         return res.status(400).json({
//           success: false,
//           message: 'active must be true or false',
//         });
//       }

//       filter.isActive = active === 'true';
//     }

//     const pageNumber = Math.max(1, parseInt(page, 10) || 1);
//     const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

//     const [services, total] = await Promise.all([
//       Service.find(filter)
//         .sort({ createdAt: -1 })
//         .skip((pageNumber - 1) * pageSize)
//         .limit(pageSize)
//         .lean(),
//       Service.countDocuments(filter),
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: 'Services retrieved successfully',
//       data: services,
//       pagination: {
//         total,
//         page: pageNumber,
//         limit: pageSize,
//         totalPages: Math.ceil(total / pageSize),
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getService = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!/^[a-f\d]{24}$/i.test(id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid service ID',
//       });
//     }

//     const service = await Service.findById(id).lean();

//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service not found',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: service,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const createService = async (req, res, next) => {
//   try {
//     const { name, description, requiredDocuments, defaultFee, isActive } =
//       req.body;

//     if (typeof name !== 'string' || !name.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Service name is required',
//       });
//     }

//     if (
//       description !== undefined &&
//       typeof description !== 'string'
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'description must be a string',
//       });
//     }

//     if (
//       requiredDocuments !== undefined &&
//       (!Array.isArray(requiredDocuments) ||
//         !requiredDocuments.every(
//           (document) => typeof document === 'string'
//         ))
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'requiredDocuments must be an array of strings',
//       });
//     }

//     if (
//       defaultFee !== undefined &&
//       (!Number.isFinite(defaultFee) || defaultFee < 0)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'defaultFee must be a non-negative number',
//       });
//     }

//     if (
//       isActive !== undefined &&
//       typeof isActive !== 'boolean'
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'isActive must be a boolean',
//       });
//     }

//     const service = await Service.create({
//       name: name.trim(),
//       description,
//       requiredDocuments,
//       defaultFee,
//       isActive,
//     });

//     return res.status(201).json({
//       success: true,
//       message: 'Service created successfully',
//       data: service,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: 'A service with this name already exists',
//       });
//     }

//     next(error);
//   }
// };

// const updateService = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!/^[a-f\d]{24}$/i.test(id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid service ID',
//       });
//     }

//     const allowedFields = [
//       'name',
//       'description',
//       'requiredDocuments',
//       'defaultFee',
//       'isActive',
//     ];

//     const updates = {};

//     for (const field of allowedFields) {
//       if (Object.prototype.hasOwnProperty.call(req.body, field)) {
//         updates[field] = req.body[field];
//       }
//     }

//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Provide at least one valid field to update',
//       });
//     }

//     if ('name' in updates) {
//       if (typeof updates.name !== 'string' || !updates.name.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: 'name must be a non-empty string',
//         });
//       }
//       updates.name = updates.name.trim();
//     }

//     if (
//       'description' in updates &&
//       typeof updates.description !== 'string'
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'description must be a string',
//       });
//     }

//     if (
//       'requiredDocuments' in updates &&
//       (!Array.isArray(updates.requiredDocuments) ||
//         !updates.requiredDocuments.every(
//           (document) => typeof document === 'string'
//         ))
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'requiredDocuments must be an array of strings',
//       });
//     }

//     if (
//       'defaultFee' in updates &&
//       (!Number.isFinite(updates.defaultFee) ||
//         updates.defaultFee < 0)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'defaultFee must be a non-negative number',
//       });
//     }

//     if ('isActive' in updates && typeof updates.isActive !== 'boolean') {
//       return res.status(400).json({
//         success: false,
//         message: 'isActive must be a boolean',
//       });
//     }

//     const service = await Service.findByIdAndUpdate(
//       id,
//       { $set: updates },
//       { new: true, runValidators: true }
//     );

//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service not found',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Service updated successfully',
//       data: service,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: 'A service with this name already exists',
//       });
//     }

//     next(error);
//   }
// };

// const deleteService = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!/^[a-f\d]{24}$/i.test(id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid service ID',
//       });
//     }

//     // Deactivate rather than permanently delete a service that
//     // might already be referenced by client assignments.
//     const service = await Service.findByIdAndUpdate(
//       id,
//       { $set: { isActive: false } },
//       { new: true, runValidators: true }
//     );

//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service not found',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Service deactivated successfully',
//       data: service,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   listServices,
//   getService,
//   createService,
//   updateService,
//   deleteService,
// };

const mongoose = require('mongoose');
const Service = require('../models/Service');

// GET /api/v1/services
const listServices = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const filter = {};

    if (req.query.active !== undefined) {
      if (!['true', 'false'].includes(req.query.active)) {
        return res.status(400).json({
          success: false,
          message: 'active must be true or false',
        });
      }
      filter.isActive = req.query.active === 'true';
    }

    if (req.query.search) {
      filter.name = {
        $regex: req.query.search,
        $options: 'i',
      };
    }

    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Service.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/services/:id
const getService = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/services
const createService = async (req, res, next) => {
  try {
    const {
      name,
      description,
      requiredDocuments,
      defaultFee,
      isActive,
    } = req.body;

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Service name is required',
      });
    }

    if (
      defaultFee !== undefined &&
      (typeof defaultFee !== 'number' ||
        !Number.isFinite(defaultFee) ||
        defaultFee < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'defaultFee must be a non-negative number',
      });
    }

    if (
      requiredDocuments !== undefined &&
      (!Array.isArray(requiredDocuments) ||
        !requiredDocuments.every((item) => typeof item === 'string'))
    ) {
      return res.status(400).json({
        success: false,
        message: 'requiredDocuments must be an array of strings',
      });
    }

    const service = await Service.create({
      name: name.trim(),
      description,
      requiredDocuments,
      defaultFee,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A service with this name already exists',
      });
    }
    next(error);
  }
};

// PATCH /api/v1/services/:id
const updateService = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }

    const allowedFields = [
      'name',
      'description',
      'requiredDocuments',
      'defaultFee',
      'isActive',
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one valid field to update',
      });
    }

    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || !updates.name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'name must be a non-empty string',
        });
      }
      updates.name = updates.name.trim();
    }

    if (
      updates.defaultFee !== undefined &&
      (typeof updates.defaultFee !== 'number' ||
        !Number.isFinite(updates.defaultFee) ||
        updates.defaultFee < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'defaultFee must be a non-negative number',
      });
    }

    if (
      updates.requiredDocuments !== undefined &&
      (!Array.isArray(updates.requiredDocuments) ||
        !updates.requiredDocuments.every((item) => typeof item === 'string'))
    ) {
      return res.status(400).json({
        success: false,
        message: 'requiredDocuments must be an array of strings',
      });
    }

    if (
      updates.isActive !== undefined &&
      typeof updates.isActive !== 'boolean'
    ) {
      return res.status(400).json({
        success: false,
        message: 'isActive must be true or false',
      });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A service with this name already exists',
      });
    }
    next(error);
  }
};

// DELETE /api/v1/services/:id
// Soft delete: mark the service inactive instead of removing its record.
const deleteService = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deactivated successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
};
