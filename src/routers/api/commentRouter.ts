import { Router } from 'express';
import CommentController from '../../controllers/api/commentController';
import CommentValidator from '../../middlewares/validation/commentValidation';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';
import { isEmailVerified } from '../../middlewares/auth/isEmailVerified';
import { isCommentAuthor } from '../../middlewares/auth/isCommentAuthor';

const commentController = new CommentController();

const CommentRouter = Router();

CommentRouter.use('/', isAuthenticated);

CommentRouter.post('/:postId', isEmailVerified, CommentValidator, commentController.saveComment);

CommentRouter.put('/:commentId', isCommentAuthor, CommentValidator, commentController.updateComment);

CommentRouter.delete('/:commentId', isCommentAuthor, commentController.deleteComment);

CommentRouter.post('/:commentId/like', isEmailVerified, commentController.like);

CommentRouter.delete('/:commentId/like', isEmailVerified, commentController.unlike);

CommentRouter.post('/:commentId/dislike', isEmailVerified, commentController.dislike);

CommentRouter.delete('/:commentId/dislike', isEmailVerified, commentController.undislike);

export default CommentRouter;