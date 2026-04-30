require('dotenv').config(); 
const app = require('./app');
const connectDB = require('./config/db');

require('./config/redis');
require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`✅ Sunucu ${PORT} Portunda Başarıyla Ayağa Kalktı!`);
    });
};

startServer();