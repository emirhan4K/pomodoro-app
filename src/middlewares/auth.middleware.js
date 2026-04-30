const { verifyToken } = require('../utils/jwt.util');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Erişim reddedildi. Token bulunamadı." });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        
        req.user = decoded; // req.user.userId
        next();
    } catch (error) {
        return res.status(401).json({ message: "Geçersiz veya süresi dolmuş token." });
    }
};

module.exports = authMiddleware;