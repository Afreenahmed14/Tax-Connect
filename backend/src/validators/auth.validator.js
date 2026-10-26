const Joi = require('joi');

exports.register = Joi.object({
  name: Joi.string().min(2).required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/),
  email: Joi.string().email(),
  password: Joi.string().min(8).required(),
}).or('phone', 'email');

exports.verifyOtp = Joi.object({ identifier: Joi.string().required(), code: Joi.string().length(6).required() });
exports.login = Joi.object({ identifier: Joi.string().required(), password: Joi.string().required() });
exports.forgot = Joi.object({ identifier: Joi.string().required() });
exports.reset = Joi.object({ identifier: Joi.string().required(), code: Joi.string().length(6).required(), newPassword: Joi.string().min(8).required() });
