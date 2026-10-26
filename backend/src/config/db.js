
const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

module.exports = async () => {
  try {
    if (!env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from environment configuration');
    }

    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    logger.info('MongoDB connected');
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    logger.error(`Error name: ${err.name}`);

    if (err.reason?.servers) {
      for (const [address, server] of err.reason.servers) {
        logger.error(
          `Server ${address}: ${server.error?.message || server.type || 'No detailed error'}`
        );
      }
    }

    if (err.cause?.message) {
      logger.error(`Cause: ${err.cause.message}`);
    }

    process.exit(1);
  }
};
