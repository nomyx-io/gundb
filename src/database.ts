import Gun, { IGunInstance } from 'gun';
import { ObjectSchema } from 'joi';
import { Model } from './model';

export class Database {
  private readonly gun: IGunInstance<any>;
  private readonly models: Map<string, Model<any>>;

  constructor(gun: IGunInstance<any>) {
    this.gun = gun;
    this.models = new Map();
  }

  model<T>(name: string, schema: ObjectSchema<T>): Model<T> {
    if (this.models.has(name)) {
      return this.models.get(name) as Model<T>;
    }
    const model = new Model<T>(this.gun.get(name) as any, schema);
    this.models.set(name, model);
    return model;
  }
}