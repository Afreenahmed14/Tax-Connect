const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');

let io;
exports.initSockets = (server) => {
  io = new Server(server, { cors: { origin: '*' } });
  io.use((socket, next) => {
    try {
      socket.user = verifyToken(socket.handshake.auth?.token);
      next();
    } catch { next(new Error('Unauthorized')); }
  });
  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);
    require('./chat.socket')(io, socket);
    require('./notification.socket')(io, socket);
  });
};
exports.getIO = () => io;
