import { Router } from 'express';
import PostController from '../../controllers/api/postController';
import PostValidator from '../../middlewares/validation/postValidation';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';
import { isEmailVerified } from '../../middlewares/auth/isEmailVerified';
import { isPostAuthor } from '../../middlewares/auth/isPostAuthor';
import multer from 'multer';
import { Post } from '../../entities/postEntity';

const postController = new PostController();

const PostRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only images allowed'));
      }
    }
  });

//PostRouter.use('/', isAuthenticated);

PostRouter.get('/', postController.getAllPosts);

PostRouter.get('/:postId', postController.getPost);

PostRouter.get('/user/:userId', postController.getPostsByUserId);

PostRouter.post('/', isEmailVerified, upload.single('image'), postController.savePost);

PostRouter.put('/:postId', isPostAuthor, upload.single('image'), PostValidator, postController.updatePost);

PostRouter.delete('/:postId', isPostAuthor, postController.deletePost);

PostRouter.post('/:postId/like', isEmailVerified, postController.like);

PostRouter.delete('/:postId/like', isEmailVerified, postController.unlike);

PostRouter.post('/:postId/dislike', isEmailVerified, postController.dislike);

PostRouter.delete('/:postId/dislike', isEmailVerified, postController.undislike);

export default PostRouter;