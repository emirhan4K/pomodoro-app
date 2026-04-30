const Redis = require('ioredis');

const redisConnection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // BullMQ'nun düzgün çalışması ve çökmemesi için bu ayar şart
});

redisConnection.on('connect', () => {
    console.log('✅ Bulut Redis Veritabanına Başarıyla Bağlanıldı!');
});

redisConnection.on('error', (err) => {
    console.error('❌ Redis Bağlantı Hatası:', err);
});

module.exports = redisConnection;