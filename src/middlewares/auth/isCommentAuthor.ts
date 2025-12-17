import { Request, Response, NextFunction } from 'express';
import { Comment } from '../../entities/commentEntity';

export async function isCommentAuthor(request: Request, response: Response, next: NextFunction)
{
    const user = request.user!;
    const commentId = request.params.commentId;

    const comment = await Comment.findOneBy({_id: commentId});
    if(!comment)
        return response.status(404).send("Comment not found");
    if(comment.author._id !== user._id && !user.isAdmin)
        return response.status(403).send("You're not allowed to perform this action on this comment");
    next();
}