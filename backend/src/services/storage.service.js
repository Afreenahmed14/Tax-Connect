
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDocument = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'tax-pro-connect/documents',
        resource_type: 'raw',
        type: 'authenticated',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const getDownloadUrl = (publicId, expiresInSeconds = 300) => {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  return cloudinary.utils.private_download_url(publicId, 'pdf', {
    resource_type: 'raw',
    type: 'authenticated',
    expires_at: expiresAt,
    attachment: true,
  });
};

const deleteDocument = (publicId) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
    type: 'authenticated',
  });
};

module.exports = {
  uploadDocument,
  getDownloadUrl,
  deleteDocument,
};
