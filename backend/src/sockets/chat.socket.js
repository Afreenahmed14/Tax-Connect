module.exports = (io, socket) => {
  socket.on('chat:join', (conversationId) => socket.join(`conv:${conversationId}`));
  socket.on('chat:message', ({ conversationId, content }) => {
    // TODO: persist Message via chat service, then broadcast
    io.to(`conv:${conversationId}`).emit('chat:message', { conversationId, content, sender: socket.user.id, createdAt: new Date() });
  });
};
