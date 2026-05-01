class UnauthorizedException extends Error { //(401 "Geçersiz şifre", "Token yok" vs.)
    constructor(message) {
        super(message);
        this.statusCode = 401;
        this.name = "UnauthorizedException";
    }
}

module.exports = UnauthorizedException;