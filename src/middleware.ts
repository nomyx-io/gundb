import { ValidationError, DatabaseError, NotFoundError, ConflictError } from './errors';
import { logger } from './logger';
import { IS_BROWSER } from './config';

// Type definitions that work in both environments
export interface RequestContext {
  status?: number;
  body?: any;
  headers?: Record<string, string>;
}

export interface ErrorHandlerOptions {
  onError?: (error: Error, context?: RequestContext) => void;
  includeStack?: boolean;
}

// Browser-compatible error handler
export function createErrorHandler(options: ErrorHandlerOptions = {}) {
  return async function errorHandler(error: Error, context?: RequestContext): Promise<RequestContext> {
    logger.error('Error caught in middleware', { error: error.message, stack: error.stack });

    let status = 500;
    let errorResponse: any = { error: 'Internal Server Error', message: 'An unexpected error occurred' };

    if (error instanceof ValidationError) {
      status = 400;
      errorResponse = { error: 'Validation Error', message: error.message };
    } else if (error instanceof NotFoundError) {
      status = 404;
      errorResponse = { error: 'Not Found', message: error.message };
    } else if (error instanceof ConflictError) {
      status = 409;
      errorResponse = { error: 'Conflict', message: error.message };
    } else if (error instanceof DatabaseError) {
      status = 500;
      errorResponse = { error: 'Database Error', message: 'An unexpected database error occurred' };
    }

    if (options.includeStack && error.stack) {
      errorResponse.stack = error.stack;
    }

    const result: RequestContext = {
      status,
      body: errorResponse,
    };

    // Call custom error handler if provided
    if (options.onError) {
      options.onError(error, result);
    }

    return result;
  };
}

// Koa-specific middleware (only available in Node.js)
let koaErrorHandler: any = null;

if (!IS_BROWSER) {
  try {
    // Only load Koa types in Node.js environment
    koaErrorHandler = async function errorHandler(ctx: any, next: any) {
      try {
        await next();
      } catch (err: any) {
        logger.error('Error caught in Koa middleware', { error: err });

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
    };
  } catch (e) {
    logger.warn('Koa not available, Koa middleware will not be exported');
  }
}

// Export appropriate error handler based on environment
export const errorHandler = koaErrorHandler || createErrorHandler();

// Export browser-compatible error handler explicitly
export { createErrorHandler as browserErrorHandler };

// Helper to check if Koa middleware is available
export const hasKoaSupport = !IS_BROWSER && koaErrorHandler !== null;