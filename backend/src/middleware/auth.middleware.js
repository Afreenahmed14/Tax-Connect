const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) throw new ApiError(401, 'Authentication required');
  let decoded;
  try { decoded = verifyToken(token); } catch { throw new ApiError(401, 'Invalid or expired token'); }
  const user = await User.findById(decoded.id).select('-password');
  if (!user || user.status !== 'active') throw new ApiError(401, 'User not found or inactive');
  req.user = user;
  next();
});


// afreenahmedaffu123_db_user
// 0FDlyhIdKWR300pR

// mongodb+srv://<db_username>:<db_password>@cluster0.lqicmli.mongodb.net/?appName=Cluster0