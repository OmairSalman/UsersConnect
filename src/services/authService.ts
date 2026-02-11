import { User } from "../entities/userEntity";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PublicUser } from "../utils/publicTypes";
import { userToPublic } from "../utils/publicDTOs";
import logger from '../config/logger';
import redisClient from '../config/redis';
import { EmailService } from './emailService';

const emailService = new EmailService();

export default class AuthService
{
    async loginUser(credentials: {email: string, password: string}): Promise<PublicUser | string>
    {
        try
        {
            const user = await User.findOneBy({email: credentials.email});
            if (!user) return 'DNE';
            const match = await bcrypt.compare(credentials.password, user.password);
            if(match)
            {
                const safeUser = userToPublic(user);
                return safeUser;
            }
            else
                return 'ICR';
        }
        catch(error)
        {
            const errorDate = new Date();
            const errorDateString = errorDate.toLocaleDateString();
            const errorTimeString = errorDate.toLocaleTimeString();
            logger.error(`Error logging in: `, error);
        }
        return 'error';
    }

    async registerUser(newUser: User): Promise<PublicUser | null>
    {
        const user = new User();
        user.name = newUser.name;
        user.email = newUser.email;
        user.isAdmin = false;

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newUser.password, salt);
        const hash = crypto.createHash('sha256').update(user.email.trim()).digest('hex');
        user.avatarURL = `https://gravatar.com/avatar/${hash}?s=256&d=initials`;
        await user.save();
        const safeUser = userToPublic(user);
        return safeUser;
    }

    async verifyPassword(userId: string, password: string): Promise<PublicUser | null>
    {
        const user = await User.findOneBy({ _id: userId });
        if(!user) return null;

        const match = await bcrypt.compare(password, user.password);
        if(match)
            return user;
        return null;
    }
    
    /**
     * Request password reset - generates code and sends email
     * @param email - User's email address
     * @returns Success message or error
     */
    async requestPasswordReset(email: string): Promise<string>
    {
        try
        {
            // Check if user exists
            const user = await User.findOneBy({ email });
            
            // Security: Always return success even if user doesn't exist
            // This prevents email enumeration attacks
            if (!user)
            {
                logger.warn(`Password reset requested for non-existent email: ${email}`);
                return 'success'; // Pretend it worked
            }

            // Generate 6-digit code
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Store in Redis with 10-minute TTL
            await redisClient.setex(
                `password-reset:${email}`,
                600, // 10 minutes
                resetCode
            );

            // Send email
            await emailService.sendPasswordResetEmail(email, user.name, resetCode);

            logger.info(`Password reset code generated for ${email}`);
            return 'success';
        }
        catch (error)
        {
            logger.error('Error in requestPasswordReset:', error);
            return 'error';
        }
    }

    /**
     * Verify reset code and create temporary session
     * @param email - User's email
     * @param code - 6-digit code from email
     * @returns Session token or null if invalid
     */
    async verifyResetCode(email: string, code: string): Promise<string | null>
    {
        try
        {
            // Get code from Redis
            const storedCode = await redisClient.get(`password-reset:${email}`);

            if (!storedCode || storedCode !== code)
            {
                logger.warn(`Invalid reset code attempt for ${email}`);
                return null;
            }

            // Code is valid - generate session token
            const sessionToken = crypto.randomBytes(32).toString('hex');

            // Store session in Redis (5 minutes)
            await redisClient.setex(
                `reset-session:${sessionToken}`,
                300, // 5 minutes
                email
            );

            // Delete the reset code (one-time use)
            await redisClient.del(`password-reset:${email}`);

            logger.info(`Reset code verified for ${email}, session created`);
            return sessionToken;
        }
        catch (error)
        {
            logger.error('Error in verifyResetCode:', error);
            return null;
        }
    }

    /**
     * Reset password using session token
     * @param sessionToken - Temporary session token from cookie
     * @param newPassword - New password
     * @returns Success or error message
     */
    async resetPasswordWithSession(sessionToken: string, newPassword: string): Promise<string>
    {
        try
        {
            // Get email from session
            const email = await redisClient.get(`reset-session:${sessionToken}`);

            if (!email)
            {
                logger.warn('Invalid or expired reset session');
                return 'invalid-session';
            }

            // Get user
            const user = await User.findOneBy({ email });
            if (!user)
            {
                return 'user-not-found';
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password
            await User.update({ _id: user._id }, { password: hashedPassword });

            // Delete session (one-time use)
            await redisClient.del(`reset-session:${sessionToken}`);

            logger.info(`Password reset successful for ${email}`);
            return 'success';
        }
        catch (error)
        {
            logger.error('Error in resetPasswordWithSession:', error);
            return 'error';
        }
    }
}