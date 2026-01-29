import { Request, Response, NextFunction } from 'express';
import { Post } from '../../entities/postEntity';
import { asString } from '../../utils/asString';

export async function isPostAuthor(request: Request, response: Response, next: NextFunction)
{
    const user = request.user!;
    const postId = asString(request.params.postId)!;
    
    const post = await Post.findOneBy({_id: postId});
    if(!post)
        return response.status(404).send("Post not found");
    if(post.author._id !== user._id && !user.isAdmin)
        return response.status(403).send("You're not allowed to perform this action on this post");
    next();
}