const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png'];
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => (ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(new ApiError(400, 'Only PDF, JPG or PNG allowed'))),
});
