const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { hash, compare } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const otpService = require('./otp.service');

const sanitize = (u) => { const o = u.toObject(); delete o.password; return o; };

exports.register = async ({ name, phone, email, password }) => {
  const exists = await User.findOne({ $or: [{ phone }, { email }].filter((c) => Object.values(c)[0]) });
  if (exists) throw new ApiError(409, 'User already exists');
  const user = await User.create({ name, phone, email, password: await hash(password) });
  await otpService.generate(phone || email, 'register');
  return sanitize(user);
};

exports.verifyOtp = async ({ identifier, code }) => {
  await otpService.verify(identifier, code, 'register');
  const user = await User.findOneAndUpdate(
    { $or: [{ phone: identifier }, { email: identifier }] }, { isVerified: true }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  return { user: sanitize(user), token: signToken({ id: user._id, role: user.role }) };
};

// exports.login = async ({ identifier, password }) => {
//   // const user = await User.findOne({ $or: [{ phone: identifier }, { email: identifier }] });
//   const user = await User.findOne({
//   $or: [{ phone: identifier }, { email: identifier }]
// }).select('+password');
//   if (!user || !(await compare(password, user.password))) throw new ApiError(401, 'Invalid credentials');
//   if (!user.isVerified) throw new ApiError(403, 'Account not verified');
//   return { user: sanitize(user), token: signToken({ id: user._id, role: user.role }) };
// };


exports.login = async ({ identifier, password }) => {
  const normalized = String(identifier || '').trim();
  const isEmail = normalized.includes('@');

  const query = isEmail
    ? { email: normalized.toLowerCase() }
    : { phone: normalized };

  const user = await User.findOne(query).select('+password');

  if (!user) {
    console.log('[LOGIN DEBUG] User not found');
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.password) {
    console.log('[LOGIN DEBUG] Password field missing');
    throw new ApiError(401, 'Invalid credentials');
  }

  const passwordMatches = await compare(password, user.password);

  console.log('[LOGIN DEBUG]', {
    userFound: true,
    passwordFieldPresent: Boolean(user.password),
    passwordMatches,
    isVerified: user.isVerified,
    role: user.role,
  });

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'Account not verified');
  }

  return {
    user: sanitize(user),
    token: signToken({ id: user._id, role: user.role }),
  };
};



exports.forgotPassword = async ({ identifier }) => otpService.generate(identifier, 'reset');

exports.resetPassword = async ({ identifier, code, newPassword }) => {
  await otpService.verify(identifier, code, 'reset');
  await User.findOneAndUpdate({ $or: [{ phone: identifier }, { email: identifier }] }, { password: await hash(newPassword) });
  return true;
};


exports.resendOtp = async ({ identifier }) => {
  identifier = String(identifier || '').trim();

  if (!identifier) {
    throw new ApiError(400, 'Phone or email is required');
  }

  const normalized = identifier.includes('@')
    ? identifier.toLowerCase()
    : identifier;

  const user = await User.findOne({
    $or: [
      { phone: normalized },
      { email: normalized },
    ],
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isVerified) {
    throw new ApiError(409, 'Account is already verified');
  }

  await otpService.generate(normalized, 'register');

  return { message: 'A new OTP has been generated' };
};
