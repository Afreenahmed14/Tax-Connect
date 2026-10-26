const crypto = require('crypto');
const Otp = require('../models/Otp');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const hashCode = (code) => crypto.createHash('sha256').update(code).digest('hex');

exports.generate = async (identifier, purpose = 'register') => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await Otp.deleteMany({ identifier, purpose });
  await Otp.create({
    identifier, purpose, codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000),
  });
  // TODO: send via SMS / email provider. Logged only in development.
  if (env.NODE_ENV === 'development') console.log(`[DEV] OTP for ${identifier}: ${code}`);
  return true;
};

exports.verify = async (identifier, code, purpose = 'register') => {
  const record = await Otp.findOne({ identifier, purpose });
  if (!record) throw new ApiError(400, 'OTP expired or not found');
  if (record.attempts >= 5) throw new ApiError(429, 'Too many attempts');
  if (record.codeHash !== hashCode(code)) {
    record.attempts += 1; await record.save();
    throw new ApiError(400, 'Invalid OTP');
  }
  await record.deleteOne();
  return true;
};
