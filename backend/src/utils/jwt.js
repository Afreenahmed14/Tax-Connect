const jwt = require('jsonwebtoken');
const env = require('../config/env');

exports.signToken = (payload) => jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
exports.verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);


exports.signToken = (payload) => {
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  console.log('[JWT DEBUG]', {
    secretConfigured: Boolean(env.JWT_SECRET),
    tokenGenerated: typeof token === 'string' && token.length > 0,
  });

  return token;
};