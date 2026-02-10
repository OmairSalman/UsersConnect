declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;

    DATABASE_HOST: string;
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
    DATABASE_NAME: string;

    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;

    GRAVATAR_API_KEY: string;

    REDIS_HOST: string;
    REDIS_PASSWORD: string;

    LOG_LEVEL: string;

    S3_ENDPOINT?: string;
    S3_ACCESS_KEY: string;
    S3_SECRET_KEY: string;
    S3_BUCKET_NAME: string;
    S3_REGION: string;
    S3_PUBLIC_URL?: string;

    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_SECURE: string;
    SMTP_USER: string;
    SMTP_PASSWORD: string;
    SMTP_FROM_NAME: string;
    SMTP_FROM_EMAIL: string;
  }
}