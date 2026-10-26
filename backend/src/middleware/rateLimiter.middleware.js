const rateLimit = require('express-rate-limit');
exports.otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, message: { success: false, message: 'Too many OTP requests' } });
exports.loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'Too many login attempts' } });
