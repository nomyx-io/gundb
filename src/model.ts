import Gun, { IGunInstance } from 'gun';
import Joi, { ObjectSchema } from 'joi';
import sift from 'sift';
import { Mutex } from 'async-mutex';
import { v4 as uuid } from 'uuid';
import { ValidationError, DatabaseError, NotFoundError } from './errors';
import { logger } from './logger';

export class Model<T> {
  private readonly gun: any;
  private readonly schema: ObjectSchema<T>;
  private readonly mutex: Mutex;

  constructor(gun: IGunInstance<any>, schema: ObjectSchema<T>) {
    this.gun = gun;
    this.schema = schema;
    this.mutex = new Mutex();
  }

  private async validate(data: Partial<T>): Promise<T> {
    try {
      return await this.schema.validateAsync(data, { abortEarly: false });
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        throw new ValidationError(error.details.map(detail => detail.message).join(', '));
      }
      throw error;
    }
  }

  private generateKey(data: any): string {
    return data.id || uuid();
  }

  async save(data: T): Promise<T> {
    logger.info('Saving document', { data });
    try {
      const validatedData = await this.validate(data);
      const key = this.generateKey(validatedData);
      await this.mutex.runExclusive(async () => {
        await new Promise<void>((resolve, reject) => {
          const gunRef = this.gun.get(key);
          gunRef.put(validatedData as any, (ack: any) => {
            if (ack.err) reject(new DatabaseError(ack.err));
            else resolve();
          });
        });
      });
      logger.info('Document saved successfully', { key });
      return validatedData;
    } catch (err) {
      logger.error('Failed to save document', { error: err });
      if (err instanceof ValidationError || err instanceof DatabaseError) {
        throw err;
      }
      throw new DatabaseError('Failed to save document');
    }
  }

  async find(query: Partial<T>, options: { limit?: number; skip?: number } = {}): Promise<T[]> {
    logger.info('Finding documents', { query, options });
    try {
      const data = await new Promise<Record<string, T>>((resolve, reject) => {
        const result: Record<string, T> = {};
        this.gun.map().once((data: any, key: string) => {
          if (data) {
            result[key] = data as T;
          }
        });
        setTimeout(() => resolve(result), 1000); // Resolve after 1 second
      });

      let result = Object.values(data).filter(sift(query as any)) as T[];

      if (options.skip) {
        result = result.slice(options.skip);
      }

      if (options.limit) {
        result = result.slice(0, options.limit);
      }

      logger.info('Documents found', { count: result.length });
      return result;
    } catch (err) {
      logger.error('Failed to find documents', { error: err });
      throw new DatabaseError('Failed to find documents');
    }
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    logger.info('Finding one document', { query });
    const results = await this.find(query, { limit: 1 });
    return results[0] || null;
  }

  async update(key: string, data: Partial<T>): Promise<T> {
    logger.info('Updating document', { key, data });
    try {
      const existingData = await new Promise<T | null>((resolve, reject) => {
        this.gun.get(key).once((data: any) => {
          if (data) resolve(data as T);
          else resolve(null);
        });
      });

      if (!existingData) {
        throw new NotFoundError(`Document with key ${key} not found`);
      }

      const updatedData = { ...existingData, ...data };
      const validatedData = await this.validate(updatedData);

      await this.mutex.runExclusive(async () => {
        await new Promise<void>((resolve, reject) => {
          this.gun.get(key).put(validatedData as any, (ack: any) => {
            if (ack.err) reject(new DatabaseError(ack.err));
            else resolve();
          });
        });
      });

      logger.info('Document updated successfully', { key });
      return validatedData;
    } catch (err) {
      logger.error('Failed to update document', { error: err });
      if (err instanceof NotFoundError || err instanceof ValidationError || err instanceof DatabaseError) {
        throw err;
      }
      throw new DatabaseError('Failed to update document');
    }
  }

  async delete(key: string): Promise<void> {
    logger.info('Deleting document', { key });
    try {
      await this.mutex.runExclusive(async () => {
        await new Promise<void>((resolve, reject) => {
          this.gun.get(key).once((data: any) => {
            if (data === undefined) {
              reject(new NotFoundError(`Document with key ${key} not found`));
            } else {
              this.gun.get(key).put(null as any, (ack: any) => {
                if (ack.err) reject(new DatabaseError(ack.err));
                else resolve();
              });
            }
          });
        });
      });
      logger.info('Document deleted successfully', { key });
    } catch (err) {
      logger.error('Failed to delete document', { error: err });
      if (err instanceof NotFoundError || err instanceof DatabaseError) {
        throw err;
      }
      throw new DatabaseError('Failed to delete document');
    }
  }

  async count(query: Partial<T>): Promise<number> {
    logger.info('Counting documents', { query });
    const results = await this.find(query);
    return results.length;
  }
}