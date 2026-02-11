import { Router } from 'express';
import AuthController from '../../controllers/api/authController';
import UserValidator from '../../middlewares/validation/userValidation';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';

const authController = new AuthController();

const AuthRouter = Router();

AuthRouter.post('/login', authController.loginUser);

AuthRouter.post('/register', UserValidator, authController.registerUser);

AuthRouter.get('/logout', authController.logoutUser);

AuthRouter.post('/verify-password', isAuthenticated, authController.verifyPassword);

AuthRouter.post('/forgot-password', authController.requestPasswordReset);

AuthRouter.post('/verify-reset-code', authController.verifyResetCode);

AuthRouter.post('/reset-password', authController.resetPasswordWithSession);

export default AuthRouter;