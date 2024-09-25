import { Database } from '../database';
import { Model } from '../model';
import Joi from 'joi';

jest.mock('../model');

describe('Database', () => {
  let database: Database;
  let mockGun: any;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
    mockGun = {
      get: jest.fn().mockReturnThis(),
    };
    database = new Database(mockGun);
  });

  describe('model', () => {
    it('should create and return a new model if it does not exist', () => {
      const schema = Joi.object();
      const modelName = 'testModel';

      const result = database.model(modelName, schema);

      expect(Model).toHaveBeenCalledWith(expect.anything(), schema);
      expect(result).toBeInstanceOf(Model);
      expect(mockGun.get).toHaveBeenCalledWith(modelName);
    });

    it('should return an existing model if it already exists', () => {
      const schema = Joi.object();
      const modelName = 'testModel';

      const firstCall = database.model(modelName, schema);
      const secondCall = database.model(modelName, schema);

      expect(Model).toHaveBeenCalledTimes(1);
      expect(firstCall).toBe(secondCall);
      expect(mockGun.get).toHaveBeenCalledTimes(1);
    });
  });
});