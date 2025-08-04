"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeLogger = exports.BrowserLogger = exports.logger = exports.LogLevel = void 0;
const config_1 = require("./config");
// Define log levels
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
const LOG_LEVEL_MAP = {
    'error': LogLevel.ERROR,
    'warn': LogLevel.WARN,
    'info': LogLevel.INFO,
    'debug': LogLevel.DEBUG,
};
class BrowserLogger {
    constructor(service = 'gun-db', logLevel = 'info') {
        this.service = service;
        this.logLevel = LOG_LEVEL_MAP[logLevel] || LogLevel.INFO;
    }
    shouldLog(level) {
        return level <= this.logLevel;
    }
    formatMessage(level, message, meta) {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            service: this.service,
            meta,
        };
    }
    logToConsole(entry) {
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
    error(message, meta) {
        if (this.shouldLog(LogLevel.ERROR)) {
            const entry = this.formatMessage('error', message, meta);
            this.logToConsole(entry);
        }
    }
    warn(message, meta) {
        if (this.shouldLog(LogLevel.WARN)) {
            const entry = this.formatMessage('warn', message, meta);
            this.logToConsole(entry);
        }
    }
    info(message, meta) {
        if (this.shouldLog(LogLevel.INFO)) {
            const entry = this.formatMessage('info', message, meta);
            this.logToConsole(entry);
        }
    }
    debug(message, meta) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const entry = this.formatMessage('debug', message, meta);
            this.logToConsole(entry);
        }
    }
}
exports.BrowserLogger = BrowserLogger;
class NodeLogger {
    constructor() {
        try {
            const Winston = require('winston');
            this.winston = Winston.createLogger({
                level: config_1.config.logLevel,
                format: Winston.format.combine(Winston.format.timestamp(), Winston.format.json()),
                defaultMeta: { service: 'gun-db' },
                transports: [
                    new Winston.transports.File({ filename: 'error.log', level: 'error' }),
                    new Winston.transports.File({ filename: 'combined.log' }),
                    new Winston.transports.Console({
                        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple())
                    })
                ],
            });
            // Add log rotation if enabled
            if (config_1.config.enableLogRotation) {
                try {
                    const { DailyRotateFile } = require('winston-daily-rotate-file');
                    this.winston.add(new DailyRotateFile({
                        filename: 'application-%DATE%.log',
                        datePattern: 'YYYY-MM-DD',
                        zippedArchive: true,
                        maxSize: '20m',
                        maxFiles: '14d'
                    }));
                }
                catch (e) {
                    console.warn('winston-daily-rotate-file not available, skipping log rotation');
                }
            }
        }
        catch (e) {
            console.warn('Winston not available, falling back to browser logger');
            // Fallback to browser logger if Winston is not available
            const fallback = new BrowserLogger('gun-db', config_1.config.logLevel);
            this.winston = {
                error: fallback.error.bind(fallback),
                warn: fallback.warn.bind(fallback),
                info: fallback.info.bind(fallback),
                debug: fallback.debug.bind(fallback),
            };
        }
    }
    error(message, meta) {
        this.winston.error(message, meta);
    }
    warn(message, meta) {
        this.winston.warn(message, meta);
    }
    info(message, meta) {
        this.winston.info(message, meta);
    }
    debug(message, meta) {
        this.winston.debug(message, meta);
    }
}
exports.NodeLogger = NodeLogger;
// Export logger based on environment
exports.logger = config_1.IS_BROWSER
    ? new BrowserLogger('gun-db', config_1.config.logLevel)
    : new NodeLogger();
