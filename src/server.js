require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initializeSocket } = require('./sockets'); 

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initializeSocket(server);

const startServer = async () => {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Sunucu ${PORT} Portunda Başarıyla Ayağa Kalktı!`);
        console.log(`🔌 WebSocket Tüneli Aktif!...`);
    });
};

startServer();