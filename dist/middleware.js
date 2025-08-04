"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasKoaSupport = exports.errorHandler = void 0;
exports.createErrorHandler = createErrorHandler;
exports.browserErrorHandler = createErrorHandler;
const errors_1 = require("./errors");
const logger_1 = require("./logger");
const config_1 = require("./config");
// Browser-compatible error handler
function createErrorHandler(options = {}) {
    return async function errorHandler(error, context) {
        logger_1.logger.error('Error caught in middleware', { error: error.message, stack: error.stack });
        let status = 500;
        let errorResponse = { error: 'Internal Server Error', message: 'An unexpected error occurred' };
        if (error instanceof errors_1.ValidationError) {
            status = 400;
            errorResponse = { error: 'Validation Error', message: error.message };
        }
        else if (error instanceof errors_1.NotFoundError) {
            status = 404;
            errorResponse = { error: 'Not Found', message: error.message };
        }
        else if (error instanceof errors_1.ConflictError) {
            status = 409;
            errorResponse = { error: 'Conflict', message: error.message };
        }
        else if (error instanceof errors_1.DatabaseError) {
            status = 500;
            errorResponse = { error: 'Database Error', message: 'An unexpected database error occurred' };
        }
        if (options.includeStack && error.stack) {
            errorResponse.stack = error.stack;
        }
        const result = {
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
let koaErrorHandler = null;
if (!config_1.IS_BROWSER) {
    try {
        // Only load Koa types in Node.js environment
        koaErrorHandler = async function errorHandler(ctx, next) {
            try {
                await next();
            }
            catch (err) {
                logger_1.logger.error('Error caught in Koa middleware', { error: err });
                if (err instanceof errors_1.ValidationError) {
                    ctx.status = 400;
                    ctx.body = { error: 'Validation Error', message: err.message };
                }
                else if (err instanceof errors_1.NotFoundError) {
                    ctx.status = 404;
                    ctx.body = { error: 'Not Found', message: err.message };
                }
                else if (err instanceof errors_1.ConflictError) {
                    ctx.status = 409;
                    ctx.body = { error: 'Conflict', message: err.message };
                }
                else if (err instanceof errors_1.DatabaseError) {
                    ctx.status = 500;
                    ctx.body = { error: 'Database Error', message: 'An unexpected database error occurred' };
                }
                else {
                    ctx.status = 500;
                    ctx.body = { error: 'Internal Server Error', message: 'An unexpected error occurred' };
                }
                ctx.app.emit('error', err, ctx);
            }
        };
    }
    catch (e) {
        logger_1.logger.warn('Koa not available, Koa middleware will not be exported');
    }
}
// Export appropriate error handler based on environment
exports.errorHandler = koaErrorHandler || createErrorHandler();
// Helper to check if Koa middleware is available
exports.hasKoaSupport = !config_1.IS_BROWSER && koaErrorHandler !== null;
