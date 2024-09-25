import { Context, Next } from 'koa';
import { ValidationError, DatabaseError, NotFoundError, ConflictError } from './errors';
import { logger } from './logger';

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    logger.error('Error caught in middleware', { error: err });

    if (err instanceof ValidationError) {
      ctx.status = 400;
      ctx.body = { error: 'Validation Error', message: err.message };
    } else if (err instanceof NotFoundError) {
      ctx.status = 404;
      ctx.body = { error: 'Not Found', message: err.message };
    } else if (err instanceof ConflictError) {
      ctx.status = 409;
      ctx.body = { error: 'Conflict', message: err.message };
    } else if (err instanceof DatabaseError) {
      ctx.status = 500;
      ctx.body = { error: 'Database Error', message: 'An unexpected database error occurred' };
    } else {
      ctx.status = 500;
      ctx.body = { error: 'Internal Server Error', message: 'An unexpected error occurred' };
    }

    ctx.app.emit('error', err, ctx);
  }
}