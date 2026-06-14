import winston from 'winston';
import path from 'path';
import fs from 'fs';
import type { AppConfig } from './types/config.types';

// Define log format for files (no color)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
      : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Define log format for console (with color)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

// Create the logger with the Console transport only. File transports are
// attached later by configureLogger() once the configuration system has
// resolved the logging directory and rotation limits.
//
// IMPORTANT: logger.ts must NOT import the config singleton — config/index.ts
// imports this module, so importing config back would create a circular
// dependency. The directory/size/count are injected via configureLogger().
const logger = winston.createLogger({
  transports: [
    // Console output (colored)
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

/**
 * Apply resolved logging configuration to the singleton logger.
 * Called once from config/index.ts after the config has been loaded.
 *
 * - Sets the minimum log level.
 * - Resolves the log directory against the current working directory: a
 *   RELATIVE value (the default 'logs') resolves under the app working dir
 *   (/app/logs in Docker) while an ABSOLUTE path (e.g. /var/log/usersconnect)
 *   is honored verbatim.
 * - Ensures the directory exists.
 * - Replaces any existing File transports with error.log (level 'error') and
 *   combined.log, using the configured max file size and retained-file count.
 */
export function configureLogger(loggingConfig: AppConfig['logging']): void {
  logger.level = loggingConfig.level;

  const logDir = path.resolve(process.cwd(), loggingConfig.directory);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Remove any File transports previously attached so re-configuration is idempotent.
  for (const transport of [...logger.transports]) {
    if (transport instanceof winston.transports.File) {
      logger.remove(transport);
    }
  }

  // Error log file
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: loggingConfig.maxFileSize,
    maxFiles: loggingConfig.maxFiles
  }));

  // Combined log file
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: fileFormat,
    maxsize: loggingConfig.maxFileSize,
    maxFiles: loggingConfig.maxFiles
  }));
}

export default logger;
