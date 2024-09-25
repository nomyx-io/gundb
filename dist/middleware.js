"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("./errors");
const logger_1 = require("./logger");
async function errorHandler(ctx, next) {
    try {
        await next();
    }
    catch (err) {
        logger_1.logger.error('Error caught in middleware', { error: err });
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
}
