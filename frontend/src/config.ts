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
export const API_BASE_URL = IS_PROD ? "https://signetra.onrender.com" : "http://localhost:8000";
const WS_BASE_URL = IS_PROD ? "wss://signetra.onrender.com" : "ws://localhost:8000";

export const config = {
  API_BASE_URL,
  WS_BASE_URL,
  SOCKET_URL: `${WS_BASE_URL}/ws/detection`
};

console.log(`[Signetra Config] Mode: ${IS_PROD ? 'Production' : 'Development'}`);
console.log(`[Signetra Config] API URL: ${API_BASE_URL}`);
console.log(`[Signetra Config] WS URL: ${WS_BASE_URL}`);
