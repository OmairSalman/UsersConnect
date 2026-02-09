import { Router } from 'express';
import CommentController from '../../controllers/api/commentController';
import CommentValidator from '../../middlewares/validation/commentValidation';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';
import { isCommentAuthor } from '../../middlewares/auth/isCommentAuthor';

const commentController = new CommentController();

const CommentRouter = Router();

CommentRouter.use('/', isAuthenticated);

CommentRouter.post('/:postId', CommentValidator, commentController.saveComment);

CommentRouter.put('/:commentId', isCommentAuthor, CommentValidator, commentController.updateComment)

CommentRouter.delete('/:commentId', isCommentAuthor, commentController.deleteComment);

CommentRouter.post('/:commentId/like', commentController.like)

CommentRouter.delete('/:commentId/like', commentController.unlike);

CommentRouter.post('/:commentId/dislike', commentController.dislike);

CommentRouter.delete('/:commentId/dislike', commentController.undislike);

export default CommentRouter;