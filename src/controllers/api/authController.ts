import { Request, Response } from "express";
import AuthService from "../../services/authService";
import jwt from 'jsonwebtoken';
import { User } from "../../entities/userEntity";
import { RefreshPayload, UserPayload } from "../../config/express";

const authService = new AuthService();

const isApiRequest = (request: Request) =>
{
  return request.headers.accept?.includes('application/json');
};

export default class AuthController
{
    async loginUser(request: Request, response: Response)
    {
        const credentials: {email: string, password: string} = request.body;
        if (!credentials || !credentials.email || !credentials.password)
        {
            response.status(400).send('Please enter all login credentials');
            return;
        }
        const user = await authService.loginUser(credentials);
        if(typeof user === 'string')
            if(user === 'DNE')
                response.status(401).json({ error: "Account doesn't exist, please register" });
            else
                response.status(401).json({ error: "Invalid email or password" });
        else
        {
            const accessPayload: UserPayload = {
                _id: user._id,
                name: user.name,
                email: user.email,
                isEmailPublic: user.isEmailPublic,
                isEmailVerified: user.isEmailVerified,
                avatarURL: user.avatarURL,
                isAdmin: user.isAdmin
            };

            const refreshPayload: RefreshPayload = {
                _id: user._id
            };
            
            const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
            const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '30d' });

            response.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 1000 * 60 * 15
            });

            response.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 30
            });
  
            if (isApiRequest(request))
            {
                // Angular client - return JSON
                return response.status(200).json({ 
                    message: 'Login successful',
                    user: accessPayload  // The user data
                });
            }
            else
            {
                // Browser/SSR - redirect
                return response.redirect('/feed');
            }
        }
    }

    getCurrentUser(request: Request, response: Response)
    {
        return response.json({ user: request.user });
    }

    async registerUser(request: Request, response: Response)
    {
        const result = await authService.registerUser(request.body);
        
        if (!result.success || !result.user) {
            return response.status(400).json({
                success: false,
                message: result.message || 'Registration failed'
            });
        }

        if(request.body.password !== request.body.confirmPassword)
        {
            return {
                success: false,
                message: 'Passwords do not match'
            };
        }

        if(request.body.password && !request.body.confirmPassword)
        {
            return {
                success: false,
                message: 'Please confirm your password'
            };
        }

        const newUser = result.user;
        
        const accessPayload: UserPayload = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            isEmailPublic: newUser.isEmailPublic,
            isEmailVerified: newUser.isEmailVerified,
            avatarURL: newUser.avatarURL,
            isAdmin: false
        };

        const refreshPayload: RefreshPayload = {
            _id: newUser._id
        };

        const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
        const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '30d' });

        response.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 15
        });

        response.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 30
        });

        return response.status(200).json({
            success: true,
            message: 'Registration successful',
            user: accessPayload
        });
    }

    async logoutUser(request: Request, response: Response)
    {
        response.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        response.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
  
        if (isApiRequest(request))
        {
            return response.status(200).json({ message: 'Logged out successfully' });
        }
        else
        {
            response.redirect('/');
        }
    }

    async verifyPassword(request: Request, response: Response)
    {
        const userId = request.user!._id;
        const password = request.body.password;
        const user = await authService.verifyPassword(userId, password);
        if(!user) return response.status(401).json({message: "Couldn't verify password", success: false});
        return response.status(200).json({message: "Password verified", success: true});
    }

    async requestPasswordReset(request: Request, response: Response)
    {
        const { email } = request.body;

        if (!email)
        {
            return response.status(400).json({ message: 'Email is required' });
        }

        const result = await authService.requestPasswordReset(email);

        if (result === 'success')
        {
            response.cookie('resetEmail', email, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 10 * 60 * 1000 // 10 minutes
            });
            // Always return success to prevent email enumeration
            return response.status(200).json({
                success: true,
                message: 'If an account exists with this email, a reset code has been sent.'
            });
        }
        else
        {
            return response.status(500).json({
                success: false,
                message: 'An error occurred. Please try again later.'
            });
        }
    }

    async verifyResetCode(request: Request, response: Response)
    {
        const { code } = request.body;
        const email = request.cookies.resetEmail;

        if (!email || !code)
        {
            return response.status(400).json({ success: false, message: 'Email and code are required' });
        }

        const result = await authService.verifyResetCode(email, code);
        if (typeof result === 'object' && !result.success)
        {
            return response.status(400).json({result});
        }
        
        if (typeof result === 'string')
        {
            const sessionToken = result;
            // Set session cookie
            response.cookie('resetSessionToken', sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 5 * 60 * 1000 // 5 minutes
            });

            return response.status(200).json({
                success: true,
                message: 'Code verified successfully'
            });
        }
        else
        {
            return response.status(401).json({
                success: false,
                message: 'Invalid or expired code'
            });
        }
    }

    async resetPasswordWithSession(request: Request, response: Response)
    {
        const { newPassword, confirmPassword } = request.body;
        const sessionToken = request.cookies.resetSessionToken;

        if (!sessionToken)
        {
            return response.status(401).json({
                success: false,
                message: 'No active reset session'
            });
        }

        if (!newPassword || !confirmPassword)
        {
            return response.status(400).json({
                success: false,
                message: 'Password fields are required'
            });
        }

        if (newPassword.length < 6)
        {
            return response.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        if (newPassword !== confirmPassword)
        {
            return response.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        const result = await authService.resetPasswordWithSession(sessionToken, newPassword);

        if (result === 'success')
        {
            // Clear session cookie
            response.clearCookie('resetSessionToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });

            response.clearCookie('resetEmail', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });

            return response.status(200).json({
                success: true,
                message: 'Password reset successfully'
            });
        }
        else if (result === 'invalid-session')
        {
            return response.status(401).json({
                success: false,
                message: 'Session expired or invalid'
            });
        }
        else
        {
            return response.status(500).json({
                success: false,
                message: 'An error occurred. Please try again.'
            });
        }
    }

    async requestEmailVerification(request: Request, response: Response)
    {
        const userId = request.user?._id;
        
        if (!userId) {
            return response.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const result = await authService.requestEmailVerification(userId);
        
        if (result.success) {
            return response.status(200).json(result);
        } else {
            return response.status(400).json(result);
        }
    }

    async verifyEmailCode(request: Request, response: Response)
    {
        const userId = request.user?._id;
        const { code } = request.body;
        
        if (!userId) {
            return response.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        if (!code) {
            return response.status(400).json({ success: false, message: 'Verification code is required' });
        }
        
        const result = await authService.verifyEmailCode(userId, code);
        
        if (result.success) {
            // Update JWT tokens with verified status
            const user = await User.findOneBy({ _id: userId });
            if (user) {
                response.clearCookie('accessToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/'
                });
                
                response.clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/'
                });
                
                const accessPayload: UserPayload = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isEmailPublic: user.isEmailPublic,
                    avatarURL: user.avatarURL,
                    isAdmin: user.isAdmin,
                    isEmailVerified: user.isEmailVerified
                };
                
                const refreshPayload: RefreshPayload = {
                    _id: user._id
                };
                
                const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
                const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '30d' });
                
                response.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 15
                });
                
                response.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 60 * 24 * 30
                });
            }
            
            return response.status(200).json(result);
        } else {
            return response.status(400).json(result);
        }
    }

    async requestEmailChange(request: Request, response: Response)
    {
        const userId = request.user?._id;
        const currentEmail = request.user?.email;
        
        if (!userId || !currentEmail)
        {
            return response.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const result = await authService.requestEmailChange(userId, currentEmail);
        
        if (result.success)
        {
            return response.status(200).json(result);
        }
        else
        {
            return response.status(500).json(result);
        }
    }

    async verifyCurrentEmail(request: Request, response: Response)
    {
        const { code } = request.body;
        const userId = request.user?._id;
        const currentEmail = request.user?.email;
        
        if (!userId || !currentEmail)
        {
            return response.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const result = await authService.verifyCurrentEmail(currentEmail, code, userId);
        
        if (result.success && result.tempToken)
        {
            // Set HttpOnly cookie with temp token
            response.cookie('emailChangeSession', result.tempToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 5 // 5 minutes
            });
            
            return response.status(200).json({ success: true, message: result.message });
        }
        else
        {
            return response.status(400).json(result);
        }
    }

    async requestNewEmailVerification(request: Request, response: Response)
    {
        const { newEmail } = request.body;
        const userId = request.user?._id;
        const tempToken = request.cookies.emailChangeSession;
        
        if (!userId)
        {
            return response.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        if (!tempToken)
        {
            return response.status(400).json({ success: false, message: 'Session expired. Please start over.' });
        }
        
        if (!newEmail)
        {
            return response.status(400).json({ success: false, message: 'New email is required' });
        }
        
        const result = await authService.requestNewEmailVerification(userId, newEmail, tempToken);
        
        if (result.success)
        {
            return response.status(200).json(result);
        }
        else
        {
            return response.status(400).json(result);
        }
    }

    async confirmEmailChange(request: Request, response: Response)
    {
        const { code } = request.body;
        const userId = request.user?._id;
        const tempToken = request.cookies.emailChangeSession;
        
        if (!userId)
        {
            return response.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        if (!tempToken)
        {
            return response.status(400).json({ success: false, message: 'Session expired. Please start over.' });
        }
        
        const result = await authService.confirmEmailChange(userId, code, tempToken);
        
        if (result.success && result.newEmail)
        {
            // Clear the temp session cookie
            response.clearCookie('emailChangeSession', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });
            
            // Update JWT tokens with new email
            const user = await User.findOneBy({ _id: userId });
            if (user)
            {
                response.clearCookie('accessToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/'
                });
                
                response.clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/'
                });
                
                const accessPayload: UserPayload = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isEmailPublic: user.isEmailPublic,
                    isEmailVerified: user.isEmailVerified,
                    avatarURL: user.avatarURL,
                    isAdmin: user.isAdmin
                };
                
                const refreshPayload: RefreshPayload = {
                    _id: user._id
                };
                
                const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
                const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '30d' });
                
                response.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 15
                });
                
                response.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 60 * 24 * 30
                });
            }
            
            return response.status(200).json(result);
        }
        else
        {
            return response.status(400).json(result);
        }
    }
}