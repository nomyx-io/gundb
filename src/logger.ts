import { config, IS_BROWSER } from './config';

// Define log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  'error': LogLevel.ERROR,
  'warn': LogLevel.WARN,
  'info': LogLevel.INFO,
  'debug': LogLevel.DEBUG,
};

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  service: string;
  meta?: any;
}

class BrowserLogger {
  private logLevel: LogLevel;
  private service: string;

  constructor(service: string = 'gun-db', logLevel: string = 'info') {
    this.service = service;
    this.logLevel = LOG_LEVEL_MAP[logLevel] || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: string, message: string, meta?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      meta,
    };
  }

  private logToConsole(entry: LogEntry): void {
    const logMsg = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    
    switch (entry.level) {
      case 'error':
        console.error(logMsg, entry.meta || '');
        break;
      case 'warn':
        console.warn(logMsg, entry.meta || '');
        break;
      case 'info':
        console.info(logMsg, entry.meta || '');
        break;
      case 'debug':
        console.log(logMsg, entry.meta || '');
        break;
      default:
        console.log(logMsg, entry.meta || '');
    }
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.formatMessage('error', message, meta);
      this.logToConsole(entry);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.formatMessage('warn', message, meta);
      this.logToConsole(entry);
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.formatMessage('info', message, meta);
      this.logToConsole(entry);
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.formatMessage('debug', message, meta);
      this.logToConsole(entry);
    }
  }
}

class NodeLogger {
  private winston: any;

  constructor() {
    try {
      const Winston = require('winston');
      
      this.winston = Winston.createLogger({
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

      // Add log rotation if enabled
      if (config.enableLogRotation) {
        try {
          const { DailyRotateFile } = require('winston-daily-rotate-file');
          
          this.winston.add(new DailyRotateFile({
            filename: 'application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
          }));
        } catch (e) {
          console.warn('winston-daily-rotate-file not available, skipping log rotation');
        }
      }
    } catch (e) {
      console.warn('Winston not available, falling back to browser logger');
      // Fallback to browser logger if Winston is not available
      const fallback = new BrowserLogger('gun-db', config.logLevel);
      this.winston = {
        error: fallback.error.bind(fallback),
        warn: fallback.warn.bind(fallback),
        info: fallback.info.bind(fallback),
        debug: fallback.debug.bind(fallback),
      };
    }
  }

  error(message: string, meta?: any): void {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }
}

// Export logger based on environment
export const logger = IS_BROWSER 
  ? new BrowserLogger('gun-db', config.logLevel)
  : new NodeLogger();

// Export logger classes for advanced usage
export { BrowserLogger, NodeLogger };