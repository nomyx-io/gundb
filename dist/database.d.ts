import { IGunInstance } from 'gun';
import { ObjectSchema } from 'joi';
import { Model } from './model';
export declare class Database {
    private readonly gun;
    private readonly models;
    constructor(gun: IGunInstance<any>);
    model<T>(name: string, schema: ObjectSchema<T>): Model<T>;
}
//# sourceMappingURL=database.d.ts.map