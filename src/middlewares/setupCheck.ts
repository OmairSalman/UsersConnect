import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/userEntity';
import logger from '../config/logger';

let adminCheckCache: boolean | null = null;
let lastCheckTime = 0;
const CACHE_TTL = 5000; // 5 seconds

/**
 * Middleware to check if setup is required.
 * Redirects to /setup if no admin users exist.
 */
export async function setupCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Skip check for static files
    if (req.path.startsWith('/js/') || req.path.startsWith('/css/') || req.path.startsWith('/images/')) {
      return next();
    }

    // Use cached result if recent (avoid DB query on every request)
    const now = Date.now();
    if (adminCheckCache !== null && now - lastCheckTime < CACHE_TTL) {
      if (!adminCheckCache) {
        res.redirect('/setup');
        return;
      }
      return next();
    }

    // Check if any admin users exist
    const adminCount = await User.count({ where: { isAdmin: true } });
    adminCheckCache = adminCount > 0;
    lastCheckTime = now;

    if (adminCount === 0) {
      logger.info('No admin users found - redirecting to setup wizard');
      res.redirect('/setup');
      return;
    }

    next();
  } catch (error) {
    logger.error('Error in setup check middleware:', error);
    // Allow request to continue on error (better than breaking the app)
    next();
  }
}

/**
 * Clear the admin check cache (call after creating first admin).
 */
export function clearAdminCache(): void {
  adminCheckCache = null;
  lastCheckTime = 0;
}
