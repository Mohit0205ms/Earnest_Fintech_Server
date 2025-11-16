"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // Log error
    console.error(err);
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Something went wrong' : message
        });
    }
    else {
        res.status(statusCode).json({
            success: false,
            message,
            ...(err.isOperational && { stack: err.stack })
        });
    }
};
exports.errorHandler = errorHandler;
