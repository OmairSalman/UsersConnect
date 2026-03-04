import { loadConfig } from './config.loader';
import logger from './logger';
import 'dotenv/config';

/**
 * Singleton application configuration.
 * Loaded once at startup — merges defaults, config.yaml, and env vars.
 */
export const config = loadConfig();

// Update the winston logger's level to match the loaded config.
// logger.ts initialises with process.env.LOG_LEVEL at module load time;
// this corrects it after config has been resolved from all sources.
logger.level = config.logging.level;

export * from './types/config.types';
