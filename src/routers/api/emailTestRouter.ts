import { Router } from 'express';
import EmailTestController from '../../controllers/api/emailTestController';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';
import { isAdmin } from '../../middlewares/auth/isAdmin';

const emailTestController = new EmailTestController();

const EmailTestRouter = Router();

// Only admins can test emails
//EmailTestRouter.use('/', isAuthenticated, isAdmin);

EmailTestRouter.post('/password-reset', emailTestController.testPasswordReset);
EmailTestRouter.post('/verification', emailTestController.testVerification);

export default EmailTestRouter;