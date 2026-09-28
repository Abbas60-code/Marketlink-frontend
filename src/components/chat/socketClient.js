import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:9000';
let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem('techwiz_token');
  if (!token) return null;

  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log(' Connected to Live Chat Server');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
