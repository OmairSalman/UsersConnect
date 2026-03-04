import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import logger from '../config/logger';
import { config } from '../config';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private layoutTemplate: HandlebarsTemplateDelegate;

  constructor() {
    // Create SMTP transporter with proper typing
    const transportOptions: SMTPTransport.Options = {
      host: config.smtp.host,
      port: config.smtp.port ?? 465,
      secure: config.smtp.secure ?? false,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    };

    this.transporter = nodemailer.createTransport(transportOptions);

    // Load layout template
    const layoutPath = path.join(__dirname, '../views/emails/layout.hbs');
    const layoutSource = fs.readFileSync(layoutPath, 'utf-8');
    this.layoutTemplate = handlebars.compile(layoutSource);

    // Verify connection on startup
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('✅ SMTP connection verified successfully');
    } catch (error) {
      logger.error('❌ SMTP connection failed:', error);
      logger.warn('⚠️  Email functionality will be unavailable');
    }
  }

  private renderTemplate(templateName: string, data: any): string {
    // Load template file
    const templatePath = path.join(__dirname, `../views/emails/${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    // Render content
    const content = template(data);

    // Wrap in layout
    return this.layoutTemplate({ body: content });
  }

  /**
   * Send a password reset email with a 6-digit code
   * @param to - Recipient email address
   * @param name - Recipient name
   * @param resetCode - 6-digit reset code (stored in Redis)
   */
  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetCode: string
  ): Promise<boolean> {
    try {
      const html = this.renderTemplate('passwordReset', { name, resetCode });

      const mailOptions = {
        from: `"${config.smtp.from.name}" <${config.smtp.from.email ?? config.smtp.user}>`,
        to: to,
        subject: `Password Reset Code: ${resetCode} - UsersConnect`,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Password reset email sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  /**
   * Send an email verification email with a 6-digit code
   * @param to - Recipient email address
   * @param name - Recipient name
   * @param verificationCode - 6-digit verification code (stored in Redis)
   */
  async sendVerificationEmail(
    to: string,
    name: string,
    verificationCode: string
  ): Promise<boolean> {
    try {
      const html = this.renderTemplate('emailVerification', { name, verificationCode });

      const mailOptions = {
        from: `"${config.smtp.from.name}" <${config.smtp.from.email ?? config.smtp.user}>`,
        to: to,
        subject: `Verification Code: ${verificationCode} - UsersConnect`,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Verification email sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('❌ Failed to send verification email:', error);
      return false;
    }
  }

  /**
   * Send verification code to current email for email change
   */
  async sendEmailChangeVerifyCurrent(
    to: string,
    name: string,
    verificationCode: string
  ): Promise<boolean> {
    try {
      const html = this.renderTemplate('emailChangeVerifyCurrent', { name, verificationCode });

      const mailOptions = {
        from: `"${config.smtp.from.name}" <${config.smtp.from.email ?? config.smtp.user}>`,
        to: to,
        subject: `Email Change Request: ${verificationCode} - UsersConnect`,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Email change verification (current) sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('❌ Failed to send email change verification (current):', error);
      return false;
    }
  }

  /**
   * Send verification code to new email for email change
   */
  async sendEmailChangeVerifyNew(
    to: string,
    name: string,
    verificationCode: string
  ): Promise<boolean> {
    try {
      const html = this.renderTemplate('emailChangeVerifyNew', { name, verificationCode });

      const mailOptions = {
        from: `"${config.smtp.from.name}" <${config.smtp.from.email ?? config.smtp.user}>`,
        to: to,
        subject: `Verify Your New Email: ${verificationCode} - UsersConnect`,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Email change verification (new) sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('❌ Failed to send email change verification (new):', error);
      return false;
    }
  }

  /**
   * Check if SMTP is configured
   */
  isConfigured(): boolean {
    return !!(config.smtp.host && config.smtp.user && config.smtp.password);
  }
}