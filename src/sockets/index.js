const { Server } = require("socket.io");
const registerRoomHandlers = require("./room.socket");
const registerNotificationHandlers = require("./notification.socket");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'https://odaklan-app.vercel.app',
        'https://pomodoro-app-nu-blush.vercel.app'
      ],
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true
    }
  });

  // Tünele biri girdiğinde çalışacak ana alan
  io.on("connection", (socket) => {
    console.log(`⚡ Tünele bağlanıldı! ID: ${socket.id}`);
    registerRoomHandlers(io, socket);
    registerNotificationHandlers(io, socket);
    socket.on("disconnect", () => {
      console.log(`❌ Tünel koptu: ${socket.id}`);
    });
  });

  return io;
};
const getIo = () => {
  if (!io) throw new Error("Socket.io henüz başlatılmadı!");
  return io;
};

module.exports = { initializeSocket, getIo };