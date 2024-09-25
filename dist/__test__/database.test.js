"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const model_1 = require("../model");
const joi_1 = __importDefault(require("joi"));
jest.mock('../model');
describe('Database', () => {
    let database;
    let mockGun;
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mocks before each test
        mockGun = {
            get: jest.fn().mockReturnThis(),
        };
        database = new database_1.Database(mockGun);
    });
    describe('model', () => {
        it('should create and return a new model if it does not exist', () => {
            const schema = joi_1.default.object();
            const modelName = 'testModel';
            const result = database.model(modelName, schema);
            expect(model_1.Model).toHaveBeenCalledWith(expect.anything(), schema);
            expect(result).toBeInstanceOf(model_1.Model);
            expect(mockGun.get).toHaveBeenCalledWith(modelName);
        });
        it('should return an existing model if it already exists', () => {
            const schema = joi_1.default.object();
            const modelName = 'testModel';
            const firstCall = database.model(modelName, schema);
            const secondCall = database.model(modelName, schema);
            expect(model_1.Model).toHaveBeenCalledTimes(1);
            expect(firstCall).toBe(secondCall);
            expect(mockGun.get).toHaveBeenCalledTimes(1);
        });
    });
});
