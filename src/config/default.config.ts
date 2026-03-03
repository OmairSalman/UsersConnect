import { AppConfig } from './types/config.types';

/**
 * Sensible defaults for all optional configuration fields.
 * These values are the lowest-priority layer — overridden by config.yaml, then env vars.
 */
const defaultConfig: Partial<AppConfig> = {
  app: {
    nodeEnv: 'production',
  },

  database: {
    host: '',
    username: '',
    password: '',
    name: '',
    connectionRetries: 10,
    retryDelay: 5000,
  },

  redis: {
    host: '',
    ttl: {
      default: 600,        // 10 minutes — feed page 1 cache
      short: 300,          // 5 minutes — like count caches
      long: 3600,          // 1 hour — paginated user posts
      emailVerification: 600, // 10 minutes
      passwordReset: 600,  // 10 minutes
      session: 300,        // 5 minutes — reset-session, email-change-session
    },
  },

  jwt: {
    accessTokenSecret: '',
    refreshTokenSecret: '',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '30d',
  },

  gravatar: {},

  s3: {},

  smtp: {
    from: {
      name: 'UsersConnect',
    },
  },

  upload: {
    maxProfilePictureSizeBytes: 5 * 1024 * 1024,   // 5 MB
    maxPostImageSizeBytes: 10 * 1024 * 1024,         // 10 MB
  },

  logging: {
    level: 'info',
    directory: '/logs',
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    maxFiles: 5,
  },
};

export default defaultConfig;
