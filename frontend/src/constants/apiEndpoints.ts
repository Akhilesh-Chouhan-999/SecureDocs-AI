export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
  },
  DOCUMENTS: {
    BASE: '/documents',
    UPLOAD: '/documents/upload',
    ANALYSIS: '/documents/:id/analysis',
    DOWNLOAD: '/documents/:id/download',
  },
  VAULT: {
    BASE: '/vault',
    ENCRYPT: '/vault/encrypt',
    DECRYPT: '/vault/decrypt',
  },
  ADMIN: {
    USERS: '/admin/users',
    SYSTEM_LOGS: '/admin/logs',
    AI_METRICS: '/admin/metrics',
  },
} as const;
