import Winston from 'winston';
import { config } from './config';

export const logger = Winston.createLogger({
  level: config.logLevel,
  format: Winston.format.combine(
    Winston.format.timestamp(),
    Winston.format.json()
  ),
  defaultMeta: { service: 'gun-db' },
  transports: [
    new Winston.transports.File({ filename: 'error.log', level: 'error' }),
    new Winston.transports.File({ filename: 'combined.log' }),
    new Winston.transports.Console({
      format: Winston.format.combine(
        Winston.format.colorize(),
        Winston.format.simple()
      )
    })
  ],
});

// Add log rotation
if (config.enableLogRotation) {
  const { DailyRotateFile } = require('winston-daily-rotate-file');
  
  logger.add(new DailyRotateFile({
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  }));
}