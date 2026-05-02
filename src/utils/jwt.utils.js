const jwt = require('jsonwebtoken');

const generateToken = (payload) => { //JWT oluşturma fonksiyonu
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};
 
const verifyToken = (token) => { //JWT doğrulama fonksiyonu
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };

