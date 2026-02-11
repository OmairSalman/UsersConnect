import { Router } from 'express';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';
import WebController from '../../controllers/web/webController';
import { isAdmin } from '../../middlewares/auth/isAdmin';

const webController = new WebController();

const WebRouter = Router();

WebRouter.use(['/feed', '/create', '/profile', '/admin'], isAuthenticated);

WebRouter.use('/admin', isAdmin);

WebRouter.get('/', webController.home);

WebRouter.get('/feed', webController.feed);

WebRouter.get('/login', webController.login);

WebRouter.get('/register', webController.register);

WebRouter.get('/profile', webController.profile);

WebRouter.get('/profile/edit', webController.editProfile);

WebRouter.get('/profile/:userId', webController.showUserProfile);

WebRouter.get('/admin/users', webController.adminUsersPanel);

WebRouter.get('/admin/edit/:userId', webController.editUser);

WebRouter.get('/about', webController.about);

WebRouter.get('/privacy', webController.privacy);

WebRouter.get('/terms', webController.terms);

WebRouter.get('/contact', webController.contact);

WebRouter.get('/forgot-password', webController.forgotPassword);

WebRouter.get('/reset-password', webController.resetPassword);

WebRouter.get('/reset-password/confirm', webController.resetPasswordConfirm);

export default WebRouter;