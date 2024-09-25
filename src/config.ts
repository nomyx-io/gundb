import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  port: number | string;
  gunPeers: string[];
  logLevel: string;
  enableLogRotation: boolean;
}

export const config: Config = {
  port: process.env.PORT || 3000,
  gunPeers: process.env.GUN_PEERS ? process.env.GUN_PEERS.split(',') : [],
  logLevel: process.env.LOG_LEVEL || 'info',
  enableLogRotation: process.env.ENABLE_LOG_ROTATION === 'true',
};