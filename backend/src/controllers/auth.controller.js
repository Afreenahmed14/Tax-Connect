const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json(new ApiResponse(201, user, 'Registered. OTP sent.'));
});
exports.verifyOtp = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, await authService.verifyOtp(req.body), 'Verified'));
});
exports.login = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, await authService.login(req.body), 'Login successful'));
});
exports.forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  res.json(new ApiResponse(200, null, 'OTP sent'));
});
exports.resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.json(new ApiResponse(200, null, 'Password reset successful'));
});
exports.me = asyncHandler(async (req, res) => res.json(new ApiResponse(200, req.user)));


exports.resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendOtp(req.body);
  res.json(new ApiResponse(200, result, 'OTP resent successfully'));
});

