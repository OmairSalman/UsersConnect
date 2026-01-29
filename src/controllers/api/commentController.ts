import { Request, Response } from "express";
import CommentService from "../../services/commentService";
import { asString } from "../../utils/asString";

const commentService = new CommentService();

export default class CommentController
{
    async saveComment(request: Request, response: Response)
    {
        const postId = asString(request.params.postId)!;
        const comment = request.body;
        const savedComment = await commentService.saveComment(postId, comment, request.user!._id);
        
        response.render('partials/commentCard', { comment: savedComment, currentUser: request.user, currentUserId: request.user!._id, layout: false }, (err, html) => {
            if (err)
            {
                console.error(err);
                return response.status(500).json({message: 'Error rendering comment', error: err});
            }
            response.send({ html });
        });
    }

    async updateComment(request: Request, response: Response)
    {
        let commentId = asString(request.params.commentId)!;
        const comment = request.body;
        const updatedComment = await commentService.updateComment(commentId, comment);
        if(!updatedComment) return response.status(404).send("Comment not found");
        return response.status(200).json({message: "Comment update successfully", comment: updatedComment});
    }

    async deleteComment(request: Request, response: Response)
    {
        let commentId = asString(request.params.commentId)!;
        const deletedComment = await commentService.deleteComment(commentId);
        if(!deletedComment) return response.status(404).send("Comment not found");
        return response.status(200).json({message: "Comment deleted successfully", comment: deletedComment});
    }

    async like(request: Request, response: Response)
    {
        let commentId = asString(request.params.commentId)!;
        let user = request.user!;
        const likedComment = await commentService.like(commentId, user);
        if(!likedComment) return response.status(404).send("Comment not found");
        return response.status(200).json({message: `Liked comment ${commentId} by ${user._id} successfully.`, liked: true, likeCount: likedComment.likes.length, likes: likedComment.likes});
    }

    async unlike(request: Request, response: Response)
    {
        let commentId = asString(request.params.commentId)!;
        let user = request.user!;
        const unlikedComment = await commentService.unlike(commentId, user);
        if(!unlikedComment) return response.status(404).send("Comment not found");
        return response.status(200).json({message: `Unliked comment ${commentId} by ${user._id} successfully.`, liked: false, likeCount: unlikedComment.likes.length, likes: unlikedComment.likes});
    }
}