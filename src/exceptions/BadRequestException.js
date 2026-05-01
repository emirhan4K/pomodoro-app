class BadRequestException extends Error { //(400"Şifreler uyuşmuyor", "Email zaten var" vs.)
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.name = "BadRequestException";
    }
}

module.exports = BadRequestException;