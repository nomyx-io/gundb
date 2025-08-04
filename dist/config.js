"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_BROWSER = exports.config = void 0;
exports.updateBrowserConfig = updateBrowserConfig;
// Detect if we're running in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
// Browser-compatible configuration
function getBrowserConfig() {
    // In browser, we can use localStorage for configuration or provide sensible defaults
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('gundb-config') : null;
    const browserConfig = stored ? JSON.parse(stored) : {};
    return {
        port: browserConfig.port || 3000,
        gunPeers: browserConfig.gunPeers || [],
        logLevel: browserConfig.logLevel || 'info',
        enableLogRotation: browserConfig.enableLogRotation || false,
    };
}
// Node.js configuration with dotenv support
function getNodeConfig() {
    try {
        // Only import dotenv in Node.js environment
        const dotenv = require('dotenv');
        dotenv.config();
    }
    catch (e) {
        // dotenv not available, continue with process.env
    }
    return {
        port: process.env.PORT || 3000,
        gunPeers: process.env.GUN_PEERS ? process.env.GUN_PEERS.split(',') : [],
        logLevel: process.env.LOG_LEVEL || 'info',
        enableLogRotation: process.env.ENABLE_LOG_ROTATION === 'true',
    };
}
// Export configuration based on environment
exports.config = isBrowser ? getBrowserConfig() : getNodeConfig();
// Helper function to update configuration in browser environment
function updateBrowserConfig(newConfig) {
    if (isBrowser && typeof localStorage !== 'undefined') {
        const currentConfig = getBrowserConfig();
        const updatedConfig = { ...currentConfig, ...newConfig };
        localStorage.setItem('gundb-config', JSON.stringify(updatedConfig));
    }
}
// Helper to check if we're in browser environment
exports.IS_BROWSER = isBrowser;
