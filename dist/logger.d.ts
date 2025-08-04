export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
    service: string;
    meta?: any;
}
declare class BrowserLogger {
    private logLevel;
    private service;
    constructor(service?: string, logLevel?: string);
    private shouldLog;
    private formatMessage;
    private logToConsole;
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}
declare class NodeLogger {
    private winston;
    constructor();
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}
export declare const logger: BrowserLogger | NodeLogger;
export { BrowserLogger, NodeLogger };
//# sourceMappingURL=logger.d.ts.map