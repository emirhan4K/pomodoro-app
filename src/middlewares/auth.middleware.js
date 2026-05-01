const UnauthorizedException = require("../exceptions/UnauthorizedException");
const { verifyToken } = require('../utils/jwt.utils'); 

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new UnauthorizedException("Erişim reddedildi. Token bulunamadı."));
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        
        req.user = decoded; 
        next();
    } catch (error) {
        return next(new UnauthorizedException("Geçersiz veya süresi dolmuş token."));
    }
};

module.exports = authMiddleware;