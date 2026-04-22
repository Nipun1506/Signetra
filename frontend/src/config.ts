/**
 * Signetra Global Configuration
 * 
 * This file centralizes API and WebSocket endpoints to ensure the app works 
 * seamlessly across local development, staging, and production environments.
 */

// Use environment variables from Vite (import.meta.env)
// For local dev, Vite automatically uses .env.local or defaults provided here
const IS_PROD = import.meta.env.PROD;

// In production, we'll likely use the same host but different protocols/ports
// Or a specific URL set in the .env file (VITE_API_URL)
export const API_BASE_URL = import.meta.env.VITE_API_URL || (IS_PROD ? "" : "http://localhost:8000");

// WebSocket URL needs to handle ws:// or wss://
// If VITE_WS_URL is provided, use it. Otherwise, derive it from window.location or localhost.
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || (IS_PROD 
  ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
  : `ws://localhost:8000`);

console.log(`[Signetra Config] Mode: ${IS_PROD ? 'Production' : 'Development'}`);
console.log(`[Signetra Config] API URL: ${API_BASE_URL}`);
console.log(`[Signetra Config] WS URL: ${WS_BASE_URL}`);
