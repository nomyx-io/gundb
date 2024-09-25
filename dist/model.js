"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const joi_1 = __importDefault(require("joi"));
const sift_1 = __importDefault(require("sift"));
const async_mutex_1 = require("async-mutex");
const uuid_1 = require("uuid");
const errors_1 = require("./errors");
const logger_1 = require("./logger");
class Model {
    constructor(gun, schema) {
        this.gun = gun;
        this.schema = schema;
        this.mutex = new async_mutex_1.Mutex();
    }
    async validate(data) {
        try {
            return await this.schema.validateAsync(data, { abortEarly: false });
        }
        catch (error) {
            if (error instanceof joi_1.default.ValidationError) {
                throw new errors_1.ValidationError(error.details.map(detail => detail.message).join(', '));
            }
            throw error;
        }
    }
    generateKey(data) {
        return data.id || (0, uuid_1.v4)();
    }
    async save(data) {
        logger_1.logger.info('Saving document', { data });
        try {
            const validatedData = await this.validate(data);
            const key = this.generateKey(validatedData);
            await this.mutex.runExclusive(async () => {
                await new Promise((resolve, reject) => {
                    const gunRef = this.gun.get(key);
                    gunRef.put(validatedData, (ack) => {
                        if (ack.err)
                            reject(new errors_1.DatabaseError(ack.err));
                        else
                            resolve();
                    });
                });
            });
            logger_1.logger.info('Document saved successfully', { key });
            return validatedData;
        }
        catch (err) {
            logger_1.logger.error('Failed to save document', { error: err });
            if (err instanceof errors_1.ValidationError || err instanceof errors_1.DatabaseError) {
                throw err;
            }
            throw new errors_1.DatabaseError('Failed to save document');
        }
    }
    async find(query, options = {}) {
        logger_1.logger.info('Finding documents', { query, options });
        try {
            const data = await new Promise((resolve, reject) => {
                const result = {};
                this.gun.map().once((data, key) => {
                    if (data) {
                        result[key] = data;
                    }
                });
                setTimeout(() => resolve(result), 1000); // Resolve after 1 second
            });
            let result = Object.values(data).filter((0, sift_1.default)(query));
            if (options.skip) {
                result = result.slice(options.skip);
            }
            if (options.limit) {
                result = result.slice(0, options.limit);
            }
            logger_1.logger.info('Documents found', { count: result.length });
            return result;
        }
        catch (err) {
            logger_1.logger.error('Failed to find documents', { error: err });
            throw new errors_1.DatabaseError('Failed to find documents');
        }
    }
    async findOne(query) {
        logger_1.logger.info('Finding one document', { query });
        const results = await this.find(query, { limit: 1 });
        return results[0] || null;
    }
    async update(key, data) {
        logger_1.logger.info('Updating document', { key, data });
        try {
            const existingData = await new Promise((resolve, reject) => {
                this.gun.get(key).once((data) => {
                    if (data)
                        resolve(data);
                    else
                        resolve(null);
                });
            });
            if (!existingData) {
                throw new errors_1.NotFoundError(`Document with key ${key} not found`);
            }
            const updatedData = { ...existingData, ...data };
            const validatedData = await this.validate(updatedData);
            await this.mutex.runExclusive(async () => {
                await new Promise((resolve, reject) => {
                    this.gun.get(key).put(validatedData, (ack) => {
                        if (ack.err)
                            reject(new errors_1.DatabaseError(ack.err));
                        else
                            resolve();
                    });
                });
            });
            logger_1.logger.info('Document updated successfully', { key });
            return validatedData;
        }
        catch (err) {
            logger_1.logger.error('Failed to update document', { error: err });
            if (err instanceof errors_1.NotFoundError || err instanceof errors_1.ValidationError || err instanceof errors_1.DatabaseError) {
                throw err;
            }
            throw new errors_1.DatabaseError('Failed to update document');
        }
    }
    async delete(key) {
        logger_1.logger.info('Deleting document', { key });
        try {
            await this.mutex.runExclusive(async () => {
                await new Promise((resolve, reject) => {
                    this.gun.get(key).once((data) => {
                        if (data === undefined) {
                            reject(new errors_1.NotFoundError(`Document with key ${key} not found`));
                        }
                        else {
                            this.gun.get(key).put(null, (ack) => {
                                if (ack.err)
                                    reject(new errors_1.DatabaseError(ack.err));
                                else
                                    resolve();
                            });
                        }
                    });
                });
            });
            logger_1.logger.info('Document deleted successfully', { key });
        }
        catch (err) {
            logger_1.logger.error('Failed to delete document', { error: err });
            if (err instanceof errors_1.NotFoundError || err instanceof errors_1.DatabaseError) {
                throw err;
            }
            throw new errors_1.DatabaseError('Failed to delete document');
        }
    }
    async count(query) {
        logger_1.logger.info('Counting documents', { query });
        const results = await this.find(query);
        return results.length;
    }
}
exports.Model = Model;
