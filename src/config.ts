// Detect if we're running in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export interface Config {
  port: number | string;
  gunPeers: string[];
  logLevel: string;
  enableLogRotation: boolean;
}

// Browser-compatible configuration
function getBrowserConfig(): Config {
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
function getNodeConfig(): Config {
  try {
    // Only import dotenv in Node.js environment
    const dotenv = require('dotenv');
    dotenv.config();
  } catch (e) {
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
export const config: Config = isBrowser ? getBrowserConfig() : getNodeConfig();

// Helper function to update configuration in browser environment
export function updateBrowserConfig(newConfig: Partial<Config>): void {
  if (isBrowser && typeof localStorage !== 'undefined') {
    const currentConfig = getBrowserConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    localStorage.setItem('gundb-config', JSON.stringify(updatedConfig));
  }
}

// Helper to check if we're in browser environment
export const IS_BROWSER = isBrowser;