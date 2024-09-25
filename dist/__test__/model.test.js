"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../model");
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("../errors");
const uuid_1 = require("uuid");
jest.mock('uuid');
jest.mock('../logger');
class MockGun {
    constructor() {
        this.store = {};
    }
    get(key) {
        return {
            put: (data, cb) => {
                setTimeout(() => {
                    if (data === null) {
                        delete this.store[key];
                    }
                    else {
                        this.store[key] = { ...this.store[key], ...data };
                    }
                    cb({ ok: true });
                }, 0);
            },
            once: (cb) => {
                setTimeout(() => {
                    cb(this.store[key] || undefined);
                }, 0);
            },
        };
    }
    map() {
        return {
            once: (cb) => {
                setTimeout(() => {
                    Object.entries(this.store).forEach(([key, value]) => {
                        cb(value, key);
                    });
                    cb(null, 'last');
                }, 0);
            },
        };
    }
    // Method for testing purposes
    getStore() {
        return this.store;
    }
    // Method for testing purposes
    setStore(newStore) {
        this.store = newStore;
    }
}
describe('Model', () => {
    let model;
    let mockGun;
    let mockSchema;
    beforeEach(() => {
        mockGun = new MockGun();
        mockSchema = joi_1.default.object({
            id: joi_1.default.string(),
            name: joi_1.default.string().required(),
            age: joi_1.default.number().integer().min(0),
        });
        model = new model_1.Model(mockGun, mockSchema);
        uuid_1.v4.mockReturnValue('mocked-uuid');
    });
    describe('save', () => {
        it('should save valid data', async () => {
            const validData = { name: 'John Doe', age: 30 };
            const result = await model.save(validData);
            expect(result).toEqual(expect.objectContaining(validData));
            expect(mockGun.getStore()['mocked-uuid']).toEqual(expect.objectContaining(validData));
        });
        it('should throw ValidationError for invalid data', async () => {
            const invalidData = { age: 'not a number' };
            await expect(model.save(invalidData)).rejects.toThrow(errors_1.ValidationError);
        });
    });
    describe('find', () => {
        it('should return matching documents', async () => {
            mockGun.setStore({
                '1': { id: '1', name: 'John', age: 30 },
                '2': { id: '2', name: 'Jane', age: 25 },
            });
            const result = await model.find({ age: { $gte: 25 } });
            expect(result).toHaveLength(2);
            expect(result).toEqual(expect.arrayContaining([
                expect.objectContaining({ name: 'John', age: 30 }),
                expect.objectContaining({ name: 'Jane', age: 25 }),
            ]));
        });
        it('should apply limit and skip options', async () => {
            mockGun.setStore({
                '1': { id: '1', name: 'John', age: 30 },
                '2': { id: '2', name: 'Jane', age: 25 },
                '3': { id: '3', name: 'Bob', age: 35 },
            });
            const result = await model.find({}, { limit: 2, skip: 1 });
            expect(result).toHaveLength(2);
            expect(result).toEqual(expect.arrayContaining([
                expect.objectContaining({ name: 'Jane', age: 25 }),
                expect.objectContaining({ name: 'Bob', age: 35 }),
            ]));
        });
    });
    describe('findOne', () => {
        it('should return the first matching document', async () => {
            mockGun.setStore({
                '1': { id: '1', name: 'John', age: 30 },
            });
            const result = await model.findOne({ name: 'John' });
            expect(result).toEqual(expect.objectContaining({ id: '1', name: 'John', age: 30 }));
        });
        it('should return null if no document matches', async () => {
            mockGun.setStore({});
            const result = await model.findOne({ name: 'NonExistent' });
            expect(result).toBeNull();
        });
    });
    describe('update', () => {
        it('should update an existing document', async () => {
            const existingData = { id: '1', name: 'John', age: 30 };
            const updateData = { age: 31 };
            mockGun.setStore({ '1': existingData });
            const result = await model.update('1', updateData);
            expect(result).toEqual(expect.objectContaining({ ...existingData, ...updateData }));
            expect(mockGun.getStore()['1']).toEqual(expect.objectContaining({ ...existingData, ...updateData }));
        });
        it('should throw NotFoundError if document does not exist', async () => {
            await expect(model.update('nonexistent', { age: 31 })).rejects.toThrow(errors_1.NotFoundError);
        });
    });
    describe('delete', () => {
        it('should delete an existing document', async () => {
            mockGun.setStore({ '1': { id: '1', name: 'John', age: 30 } });
            await expect(model.delete('1')).resolves.not.toThrow();
            expect(mockGun.getStore()['1']).toBeUndefined();
        });
        it('should throw NotFoundError if document does not exist', async () => {
            await expect(model.delete('nonexistent')).rejects.toThrow(errors_1.NotFoundError);
        });
    });
    describe('count', () => {
        it('should return the count of matching documents', async () => {
            mockGun.setStore({
                '1': { id: '1', name: 'John', age: 30 },
                '2': { id: '2', name: 'Jane', age: 25 },
                '3': { id: '3', name: 'Bob', age: 35 },
            });
            const result = await model.count({ age: { $gte: 30 } });
            expect(result).toBe(2);
        });
        it('should return 0 if no documents match', async () => {
            mockGun.setStore({
                '1': { id: '1', name: 'John', age: 30 },
                '2': { id: '2', name: 'Jane', age: 25 },
            });
            const result = await model.count({ age: { $gt: 100 } });
            expect(result).toBe(0);
        });
    });
});
