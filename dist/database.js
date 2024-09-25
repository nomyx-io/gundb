"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const model_1 = require("./model");
class Database {
    constructor(gun) {
        this.gun = gun;
        this.models = new Map();
    }
    model(name, schema) {
        if (this.models.has(name)) {
            return this.models.get(name);
        }
        const model = new model_1.Model(this.gun.get(name), schema);
        this.models.set(name, model);
        return model;
    }
}
exports.Database = Database;
