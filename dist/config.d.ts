export interface Config {
    port: number | string;
    gunPeers: string[];
    logLevel: string;
    enableLogRotation: boolean;
}
export declare const config: Config;
export declare function updateBrowserConfig(newConfig: Partial<Config>): void;
export declare const IS_BROWSER: boolean;
//# sourceMappingURL=config.d.ts.map