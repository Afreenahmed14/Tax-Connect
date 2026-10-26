// TODO

const mongoose = require('mongoose');
const Document = require('../models/Document');
const Client = require('../models/Client');

const upload = require('../middleware/upload.middleware');
const storageService = require('../services/storage.service');

const getDocuments = async (req, res, next) => {
  try {
    const { client, status, type, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (client) {
      if (!mongoose.isValidObjectId(client)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid client ID',
        });
      }
      filter.client = client;
    }

    if (status) filter.status = status;
    if (type) filter.type = type;

    // Clients can only access their own documents.
    if (req.user.role === 'client') {
      const ownClient = await Client.findOne({ user: req.user._id });

      if (!ownClient) {
        return res.status(200).json({
          success: true,
          message: 'Documents fetched successfully',
          data: { documents: [], pagination: {
            page: Number(page), limit: Number(limit),
            total: 0, pages: 0,
          }},
        });
      }

      filter.client = ownClient._id;
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

    const [documents, total] = await Promise.all([
      Document.find(filter)
        .populate('client')
        .populate('clientService')
        .populate('reviewer', 'name email role')
        // .populate('uploadedBy', 'name email role')
        .populate('uploadedBy', 'name email role -password')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Document.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: 'Documents fetched successfully',
      data: {
        documents,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID',
      });
    }

    const document = await Document.findById(req.params.id)
      .populate('client')
      .populate('clientService')
      .populate('reviewer', 'name email role')
    //   .populate('uploadedBy', 'name email role');
    .populate('uploadedBy', 'name email role -password')

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (req.user.role === 'client') {
      const ownClient = await Client.findOne({ user: req.user._id });

      if (
        !ownClient ||
        document.client._id.toString() !== ownClient._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You cannot access this document',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Document fetched successfully',
      data: { document },
    });
  } catch (error) {
    next(error);
  }
};

const createDocument = async (req, res, next) => {
  try {
    const { client, clientService, type, fileKey, fileName,
      mimeType, size, version, status, remarks } = req.body;

    if (!client || !type || !fileKey) {
      return res.status(400).json({
        success: false,
        message: 'client, type and fileKey are required',
      });
    }

    if (!mongoose.isValidObjectId(client)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID',
      });
    }

    const clientExists = await Client.findById(client);

    if (!clientExists) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Clients must not create records for another client.
    if (req.user.role === 'client') {
      const ownClient = await Client.findOne({ user: req.user._id });

      if (
        !ownClient ||
        ownClient._id.toString() !== clientExists._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You cannot upload documents for this client',
        });
      }
    }

    const document = await Document.create({
      client,
      clientService,
      type,
      fileKey,
      fileName,
      mimeType,
      size,
      version,
      status,
      remarks,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Document record created successfully',
      data: { document },
    });
  } catch (error) {
    next(error);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID',
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Only staff roles can review or update document metadata.
    if (['client', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update documents',
      });
    }

    const allowedFields = [
      'type',
      'status',
      'reviewer',
      'remarks',
      'rejectionReason',
      'version',
      'clientService',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        document[field] = req.body[field];
      }
    }

    await document.save();

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: { document },
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID',
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (['client', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete documents',
      });
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const uploadDocumentFile = async (req, res, next) => {
  let uploadedFile;

  try {
    const { client, type } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a file to upload',
      });
    }

    if (!client || !type) {
      return res.status(400).json({
        success: false,
        message: 'Client ID and document type are required',
      });
    }

    if (!mongoose.isValidObjectId(client)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID',
      });
    }

    const clientExists = await Client.findById(client);

    if (!clientExists) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // A client can upload only to their own client profile.
    if (req.user.role === 'client') {
      const ownClient = await Client.findOne({ user: req.user._id });

      if (
        !ownClient ||
        ownClient._id.toString() !== clientExists._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You cannot upload documents for this client',
        });
      }
    }

    uploadedFile = await storageService.uploadDocument(req.file.buffer, {
      public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
    });

    const document = await Document.create({
      client: clientExists._id,
      type,
      fileKey: uploadedFile.public_id,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
    });

    // return res.status(201).json({
    //   success: true,
    //   message: 'File uploaded successfully',
    //   data: {
    //     document,
    //     fileUrl: uploadedFile.secure_url,
    //   },
    // });

    return res.status(201).json({
  success: true,
  message: 'File uploaded successfully',
  data: {
    document,
  },
});
  } catch (error) {
    // Avoid leaving an orphaned Cloudinary file if DB creation fails.
    if (uploadedFile?.public_id) {
      try {
        await storageService.deleteDocument(uploadedFile.public_id);
      } catch (cleanupError) {
        console.error('Cloudinary cleanup failed:', cleanupError.message);
      }
    }

    next(error);
  }
};



const downloadDocument = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID',
      });
    }

    const document = await Document.findById(req.params.id).select(
      'client fileKey fileName mimeType status'
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Clients may access only documents belonging to their own profile.
    if (req.user.role === 'client') {
      const ownClient = await Client.findOne({ user: req.user._id }).select('_id');

      if (
        !ownClient ||
        document.client.toString() !== ownClient._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You cannot download this document',
        });
      }
    }

    const downloadUrl = storageService.getDownloadUrl(
      document.fileKey,
      300
    );

    return res.status(200).json({
      success: true,
      message: 'Temporary download URL generated',
      data: {
        fileName: document.fileName,
        downloadUrl,
        expiresInSeconds: 300,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
  downloadDocument,
};


// module.exports = {
//   getDocuments,
//   getDocumentById,
//   createDocument,
//   updateDocument,
//   deleteDocument,
//   uploadDocumentFile,
// };
