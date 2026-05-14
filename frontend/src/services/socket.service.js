import { io } from 'socket.io-client';

// Senin backend linkin (Render adresi)
const BACKEND_URL = "https://pomodoro-app-omxg.onrender.com"; 

const socket = io(BACKEND_URL, {
  withCredentials: true,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("🔌 Socket.io aktif! ID:", socket.id);
});

export default socket;