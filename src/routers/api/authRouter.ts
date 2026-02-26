import { Router } from 'express';
import AuthController from '../../controllers/api/authController';
import UserValidator from '../../middlewares/validation/userValidation';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';

const authController = new AuthController();

const AuthRouter = Router();

AuthRouter.post('/login', authController.loginUser);

AuthRouter.get('/me', isAuthenticated, authController.getCurrentUser);

AuthRouter.post('/register', UserValidator, authController.registerUser);

AuthRouter.get('/logout', authController.logoutUser);

AuthRouter.post('/verify-password', isAuthenticated, authController.verifyPassword);

AuthRouter.post('/forgot-password', authController.requestPasswordReset);

AuthRouter.post('/verify-reset-code', authController.verifyResetCode);

AuthRouter.post('/resend-reset-code', authController.resendPasswordResetCode);

AuthRouter.post('/reset-password', authController.resetPasswordWithSession);

AuthRouter.get('/check-reset-session', authController.checkResetSession);

AuthRouter.post('/email-verification/request', isAuthenticated, authController.requestEmailVerification);

AuthRouter.post('/email-verification/verify', isAuthenticated, authController.verifyEmailCode);

AuthRouter.post('/email-change/request', isAuthenticated, authController.requestEmailChange);

AuthRouter.post('/email-change/verify-current', isAuthenticated, authController.verifyCurrentEmail);

AuthRouter.post('/email-change/request-new', isAuthenticated, authController.requestNewEmailVerification);

AuthRouter.post('/email-change/confirm', isAuthenticated, authController.confirmEmailChange);

export default AuthRouter;