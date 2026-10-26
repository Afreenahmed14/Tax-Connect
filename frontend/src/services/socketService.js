import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';

let socket;
export const connectSocket = (token) => {
  socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
  return socket;
};
export const getSocket = () => socket;
export const disconnectSocket = () => socket && socket.disconnect();
