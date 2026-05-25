export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:5000',
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_PRODUCTION: import.meta.env.PROD || false,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
} as const;

export const isDev = ENV.NODE_ENV === 'development';
