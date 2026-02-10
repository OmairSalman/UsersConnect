import { Request, Response } from 'express';
import { EmailService } from '../../services/emailService';
import logger from '../../config/logger';

const emailService = new EmailService();

export default class EmailTestController {
  async testPasswordReset(request: Request, response: Response) {
    const { email } = request.body;

    if (!email) {
      return response.status(400).json({ message: 'Email is required' });
    }

    // Generate a test 6-digit code
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const sent = await emailService.sendPasswordResetEmail(
        email,
        'Admin Omair',
        testCode
      );

      if (sent) {
        return response.status(200).json({
          success: true,
          message: 'Password reset email sent successfully!',
          testCode: testCode, // In production, never send this back!
        });
      } else {
        return response.status(500).json({
          success: false,
          message: 'Failed to send email',
        });
      }
    } catch (error) {
      logger.error('Email test error:', error);
      return response.status(500).json({
        success: false,
        message: 'Error sending email',
      });
    }
  }

  async testVerification(request: Request, response: Response) {
    const { email } = request.body;

    if (!email) {
      return response.status(400).json({ message: 'Email is required' });
    }

    // Generate a test 6-digit code
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const sent = await emailService.sendVerificationEmail(
        email,
        'Test User',
        testCode
      );

      if (sent) {
        return response.status(200).json({
          success: true,
          message: 'Verification email sent successfully!',
          testCode: testCode,
        });
      } else {
        return response.status(500).json({
          success: false,
          message: 'Failed to send email',
        });
      }
    } catch (error) {
      logger.error('Email test error:', error);
      return response.status(500).json({
        success: false,
        message: 'Error sending email',
      });
    }
  }
}