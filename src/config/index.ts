import { loadConfig } from './config.loader';
import { configureLogger } from './logger';
import 'dotenv/config';

/**
 * Singleton application configuration.
 * Loaded once at startup — merges defaults, config.yaml, and env vars.
 */
export const config = loadConfig();

// Apply the resolved logging configuration to the singleton logger.
// logger.ts initialises with the Console transport only at module load time;
// this wires up the level, log directory, and File transports now that
// config has been resolved from all sources (defaults, config.yaml, env vars).
configureLogger(config.logging);

export * from './types/config.types';
