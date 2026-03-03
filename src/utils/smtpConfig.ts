import { config } from '../config';

/**
 * Check if SMTP is properly configured.
 * Returns true if all required SMTP settings are set.
 * Uses the centralized config object (YAML + env var) as source of truth.
 */
export function isSMTPConfigured(): boolean {
  return !!(config.smtp?.host && config.smtp?.user && config.smtp?.password);
}
