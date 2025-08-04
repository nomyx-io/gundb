export interface RequestContext {
    status?: number;
    body?: any;
    headers?: Record<string, string>;
}
export interface ErrorHandlerOptions {
    onError?: (error: Error, context?: RequestContext) => void;
    includeStack?: boolean;
}
export declare function createErrorHandler(options?: ErrorHandlerOptions): (error: Error, context?: RequestContext) => Promise<RequestContext>;
export declare const errorHandler: any;
export { createErrorHandler as browserErrorHandler };
export declare const hasKoaSupport: boolean;
//# sourceMappingURL=middleware.d.ts.map