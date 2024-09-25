import { IGunInstance } from 'gun';
import { ObjectSchema } from 'joi';
export declare class Model<T> {
    private readonly gun;
    private readonly schema;
    private readonly mutex;
    constructor(gun: IGunInstance<any>, schema: ObjectSchema<T>);
    private validate;
    private generateKey;
    save(data: T): Promise<T>;
    find(query: Partial<T>, options?: {
        limit?: number;
        skip?: number;
    }): Promise<T[]>;
    findOne(query: Partial<T>): Promise<T | null>;
    update(key: string, data: Partial<T>): Promise<T>;
    delete(key: string): Promise<void>;
    count(query: Partial<T>): Promise<number>;
}
//# sourceMappingURL=model.d.ts.map