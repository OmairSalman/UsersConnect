import { Router } from 'express';
import PostController from '../../controllers/api/postController';
import PostValidator from '../../middlewares/validation/postValidation';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';
import { isPostAuthor } from '../../middlewares/auth/isPostAuthor';
import multer from 'multer';

const postController = new PostController();

const PostRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only images allowed'));
      }
    }
  });

PostRouter.use('/', isAuthenticated);

PostRouter.get('/', postController.getAllPosts);

PostRouter.get('/:postId', postController.getPost);

PostRouter.post('/', upload.single('image'), PostValidator, postController.savePost);

PostRouter.put('/:postId', isPostAuthor, upload.single('image'), PostValidator, postController.updatePost);

PostRouter.delete('/:postId', isPostAuthor, postController.deletePost);

PostRouter.post('/:postId/like', postController.like)

PostRouter.delete('/:postId/like', postController.unlike);

export default PostRouter;