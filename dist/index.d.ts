import Gun from 'gun';
import { Config } from './config';
import { Database } from './database';
export { errorHandler } from './middleware';
export * from './errors';
export * from './model';
export * from './database';
export * from './middleware';
export * from './logger';
export * from './config';
export declare function createGun(config?: Partial<Config>): import("gun").IGunInstance<any>;
export declare function createDatabase(gun: ReturnType<typeof Gun>): Database;
export { Gun };
export declare const defaultDatabase: Database;
//# sourceMappingURL=index.d.ts.map