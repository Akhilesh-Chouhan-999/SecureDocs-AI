export const APP_CONFIG = {
  APP_NAME: 'Obsidian Cipher',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'security@obsidiancipher.com',
  DEFAULT_LANGUAGE: 'en-US',
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  TIMEOUTS: {
    API_REQUEST: 30000,
    UPLOAD_REQUEST: 120000,
    SESSION_IDLE: 900000, // 15 minutes
  },
  FILE_UPLOADS: {
    MAX_FILE_SIZE_MB: 50,
    ALLOWED_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const;
