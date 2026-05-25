// A simple environment-aware logger that silences console logs in production

const isProduction = import.meta.env?.PROD || false;

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (!isProduction) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (!isProduction) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // We typically always want to log errors, even in prod, or send to a service like Sentry
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (!isProduction) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};
