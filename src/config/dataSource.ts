import { DataSource } from 'typeorm';
import { User } from '../entities/userEntity';
import { Post } from '../entities/postEntity';
import { Comment } from '../entities/commentEntity';
import { config } from './index';

const isDevelopment = config.app.nodeEnv === 'development';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: 3306,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: [User, Post, Comment],

  // Development: auto-sync schema (convenient; never use in production)
  // Production: use migrations only (safe, version-controlled changes)
  synchronize: isDevelopment,

  // Run pending migrations automatically on startup in non-development environments
  migrationsRun: !isDevelopment,

  // Development: load TypeScript migration sources directly (via ts-node)
  // Production: load compiled JavaScript from dist/
  migrations: [
    isDevelopment
      ? 'src/migrations/**/*.ts'
      : 'dist/migrations/**/*.js',
  ],

  logging: false,
});

export default AppDataSource;
