import { Router } from 'express';
import UserController from '../../controllers/api/userController';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';
import { isAdmin } from '../../middlewares/auth/isAdmin';
import multer from 'multer';
import { config } from '../../config';

const usersController = new UserController();

const UserRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.upload.maxProfilePictureSizeBytes },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only images allowed'));
      }
    }
});

UserRouter.use('/', isAuthenticated);

UserRouter.get('/', isAdmin, usersController.getUsers);

UserRouter.get('/search', usersController.searchUsers);

UserRouter.get('/:id', usersController.getUserById);

UserRouter.get('/:id/profile', usersController.getUserProfile);

UserRouter.put('/:id', usersController.updateUser);

UserRouter.delete('/:id', usersController.deleteUser);

UserRouter.get('/:userId/posts', usersController.getUserPosts)

UserRouter.put('/:userId/toggle-admin', isAdmin, usersController.toggleAdmin);

UserRouter.post('/:id/profile-picture', upload.single('profilePicture'), usersController.uploadProfilePicture);

UserRouter.delete('/:id/profile-picture', usersController.removeProfilePicture);

export default UserRouter;