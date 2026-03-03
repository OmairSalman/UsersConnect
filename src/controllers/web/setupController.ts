import { Request, Response } from 'express';
import { User } from '../../entities/userEntity';
import bcrypt from 'bcrypt';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import logger from '../../config/logger';
import { clearAdminCache } from '../../middlewares/setupCheck';

export class SetupController {
  /**
   * GET /setup - Show setup wizard
   */
  async showSetup(req: Request, res: Response): Promise<void> {
    try {
      const adminCount = await User.count({ where: { isAdmin: true } });

      if (adminCount > 0) {
        logger.warn('Setup wizard accessed but admin already exists - redirecting to login');
        res.redirect('/login');
        return;
      }

      res.render('pages/setup', {
        title: 'First-Time Setup',
        layout: false,
      });
    } catch (error) {
      logger.error('Error showing setup page:', error);
      res.status(500).send('Setup error - check logs');
    }
  }

  /**
   * POST /setup - Process setup wizard
   */
  async processSetup(req: Request, res: Response): Promise<void> {
    try {
      // Security: double-check no admin exists
      const adminCount = await User.count({ where: { isAdmin: true } });
      if (adminCount > 0) {
        res.status(403).json({ success: false, message: 'Setup already completed' });
        return;
      }

      const {
        name,
        email,
        password,
        enableS3,
        s3Endpoint,
        s3AccessKey,
        s3SecretKey,
        s3BucketName,
        s3Region,
        s3PublicUrl,
        enableSMTP,
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPassword,
        smtpFromName,
        smtpFromEmail,
        enableCORS,
        corsAllowedOrigins,
      } = req.body;

      // Validate admin user input
      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        return;
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'Email already in use' });
        return;
      }

      // Create admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      const hash = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
      const avatarURL = `https://gravatar.com/avatar/${hash}?s=256&d=initials`;

      const admin = User.create({
        name,
        email,
        password: hashedPassword,
        avatarURL,
        isAdmin: true,
        isEmailVerified: false,
        isEmailPublic: false,
      });

      await admin.save();
      logger.info(`✅ First admin user created: ${email}`);

      // Write optional configurations to config.yaml
      const configPath = path.join(process.cwd(), 'config.yaml');
      let existingConfig: Record<string, unknown> = {};

      if (fs.existsSync(configPath)) {
        try {
          const fileContent = fs.readFileSync(configPath, 'utf-8');
          existingConfig = (yaml.load(fileContent) as Record<string, unknown>) || {};
        } catch {
          logger.warn('Could not parse existing config.yaml, creating new one');
        }
      }

      let configUpdated = false;

      if (enableS3 === 'true' && s3AccessKey && s3SecretKey && s3BucketName) {
        existingConfig.s3 = {
          endpoint: s3Endpoint || undefined,
          accessKey: s3AccessKey,
          secretKey: s3SecretKey,
          bucketName: s3BucketName,
          region: s3Region || undefined,
          publicUrl: s3PublicUrl || undefined,
        };
        configUpdated = true;
        logger.info('✅ S3 configuration added to config.yaml');
      }

      if (enableSMTP === 'true' && smtpHost && smtpUser && smtpPassword) {
        existingConfig.smtp = {
          host: smtpHost,
          port: parseInt(smtpPort, 10) || 465,
          secure: smtpSecure === 'true',
          user: smtpUser,
          password: smtpPassword,
          from: {
            name: smtpFromName || 'UsersConnect',
            email: smtpFromEmail || smtpUser,
          },
        };
        configUpdated = true;
        logger.info('✅ SMTP configuration added to config.yaml');
      }

      if (enableCORS === 'true' && corsAllowedOrigins) {
        const origins = (corsAllowedOrigins as string)
          .split(',')
          .map((o: string) => o.trim())
          .filter((o: string) => o.length > 0);

        if (origins.length > 0) {
          existingConfig.cors = {
            enabled: true,
            allowedOrigins: origins,
            allowCredentials: true,
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
          };
          configUpdated = true;
          logger.info('✅ CORS configuration added to config.yaml');
        }
      }

      if (configUpdated) {
        try {
          const yamlContent = yaml.dump(existingConfig, { indent: 2, lineWidth: -1, noRefs: true });
          const header = `# UsersConnect Configuration\n# Generated by setup wizard on ${new Date().toISOString()}\n# You can edit this file manually or use environment variables to override settings\n\n`;
          fs.writeFileSync(configPath, header + yamlContent, 'utf-8');
          logger.info('✅ config.yaml updated successfully');
        } catch (error) {
          logger.error('Failed to write config.yaml:', error);
          // Continue — admin user was created successfully
        }
      }

      clearAdminCache();

      res.json({ success: true, message: 'Setup completed successfully! Please log in.', configUpdated });
    } catch (error) {
      logger.error('Error processing setup:', error);
      res.status(500).json({ success: false, message: 'Setup failed - check server logs' });
    }
  }
}
