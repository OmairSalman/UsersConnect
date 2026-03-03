declare namespace NodeJS {
  interface ProcessEnv {
    // ── Application ───────────────────────────────────────────────────────────
    NODE_ENV: string;

    // ── Database (Required) ───────────────────────────────────────────────────
    DATABASE_HOST: string;
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
    DATABASE_NAME: string;

    // ── Redis (Required) ──────────────────────────────────────────────────────
    REDIS_HOST: string;
    REDIS_PASSWORD?: string;

    // ── JWT (Required) ────────────────────────────────────────────────────────
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;

    // ── Gravatar (Optional) ───────────────────────────────────────────────────
    GRAVATAR_API_KEY?: string;

    // ── S3 Storage (Optional) ─────────────────────────────────────────────────
    S3_ENDPOINT?: string;
    S3_ACCESS_KEY?: string;
    S3_SECRET_KEY?: string;
    S3_BUCKET_NAME?: string;
    S3_REGION?: string;
    S3_PUBLIC_URL?: string;

    // ── SMTP Email (Optional) ─────────────────────────────────────────────────
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_SECURE?: string;
    SMTP_USER?: string;
    SMTP_PASSWORD?: string;
    SMTP_FROM_NAME?: string;
    SMTP_FROM_EMAIL?: string;

    // ── CORS (Optional) ───────────────────────────────────────────────────────
    CORS_ENABLED?: string;           // 'true' | 'false'
    CORS_ALLOWED_ORIGINS?: string;   // comma-separated list of origin URLs
    CORS_ALLOW_CREDENTIALS?: string; // 'true' | 'false'
    CORS_ALLOWED_METHODS?: string;   // comma-separated list
    CORS_ALLOWED_HEADERS?: string;   // comma-separated list

    // ── Logging (Optional) ────────────────────────────────────────────────────
    LOG_LEVEL?: string; // 'error' | 'warn' | 'info' | 'debug'
  }
}

export {};
