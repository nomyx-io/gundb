import Gun from 'gun';
import { Config, config as defaultConfig } from './config';
import { Database } from './database';
import { logger } from './logger';

export { errorHandler } from './middleware';
export * from './errors';
export * from './model';
export * from './database';
export * from './middleware';
export * from './logger';
export * from './config';

export function createGun(config: Partial<Config> = {}) {
  const mergedConfig = { ...defaultConfig, ...config };
  return Gun({
    peers: mergedConfig.gunPeers
  });
}

export function createDatabase(gun: ReturnType<typeof Gun>) {
  return new Database(gun);
}

export { Gun };

// Initialize with default configuration
const defaultGun = createGun();
export const defaultDatabase = createDatabase(defaultGun);

logger.info('GunDB library initialized');
