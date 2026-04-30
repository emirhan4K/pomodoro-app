const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: err.message,
        error: err.name || "ServerError" 
    });
};

module.exports = errorMiddleware;