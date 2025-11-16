import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  } else {
    res.status(statusCode).json({
      success: false,
      message,
      ...(err.isOperational && { stack: err.stack })
    });
  }
};
