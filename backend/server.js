require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');
const { initSockets } = require('./src/sockets');
const { startJobs } = require('./src/jobs');
const logger = require('./src/utils/logger');

(async () => {
  await connectDB();
  const server = http.createServer(app);
  initSockets(server);
  startJobs();
  server.listen(env.PORT, () => logger.info(`Server running on port ${env.PORT}`));
})();
