export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

import { ErrorRequestHandler } from 'express';
import { QueryFailedError } from 'typeorm';

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';
  let message = err.message || 'Internal Server Error';
  let detail = err.detail;

  if (err instanceof QueryFailedError) {
    const pgError = err as any;

    if (pgError.code === '23502') {
      statusCode = 422;
      status = 'failed';
      message = `${pgError.column} is required`;
      detail = pgError.detail;
    }

    if (pgError.code === '23505') {
      statusCode = 409;
      status = 'failed';
      message = 'Duplicate value violates unique constraint';
      detail = pgError.detail;
    }
  }

  res.status(statusCode).json({
    code: statusCode,
    status,
    message,
    detail,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
