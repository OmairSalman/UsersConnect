import { Request, Response, NextFunction } from 'express';

export const isEmailVerified = (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
        return response.status(401).json({ 
            success: false, 
            message: 'Unauthorized',
            requiresAuth: true
        });
    }

    if (!request.user.isEmailVerified) {
        return response.status(403).json({ 
            success: false, 
            message: 'Please verify your email to perform this action',
            requiresVerification: true
        });
    }

    next();
};