import { UserPayload } from "../config/express";
import redisClient from "../config/redis";
import { Comment } from "../entities/commentEntity";
import { Post } from "../entities/postEntity";
import { User } from "../entities/userEntity";
import { commentToPublic } from "../utils/publicDTOs";
import { PublicComment } from "../utils/publicTypes";
import logger from '../config/logger';

export default class CommentService
{
    async saveComment(postId: string, newComment: Comment, authorId: string): Promise<PublicComment | null>
    {
        try
        {
            const insertResult = await Comment.insert({
                content: newComment.content,
                post_id: postId,
                author_id: authorId
            });
            const comment = await Comment.findOne(
                {
                    where: {_id: insertResult.identifiers[0]._id},
                    relations: ["post"]
                });
            if(!comment) return null;

            const keys = await redisClient.keys(`usersconnect:user:${comment.post.author._id}:posts:page:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');

            const safeComment = commentToPublic(comment);
            return safeComment;
        }
        catch(error)
        {
            
            logger.error(`Error saving comment:`, error);
            return null;
        }
    }

    async countUserCommentsLikes(userId: string)
    {
        const cacheKey = `user:${userId}:comments:likes:count`;
        const cached = await redisClient.get(cacheKey);
        if (cached)
        {
            return JSON.parse(cached);
        }
        const comments = await Comment.find(
            {
                where: {author: {_id: userId}}
            });
        if(comments)
        {
            let commentsLikes = 0;
            comments.forEach(comment =>{
                commentsLikes += comment.likes.length;
            });
            await redisClient.setex(cacheKey, 300, JSON.stringify(commentsLikes));
            return commentsLikes;
        }
    }

    async updateComment(commentId: string, updatedComment: Comment): Promise<PublicComment | null>
    {
        try
        {
            await Comment.update({_id: commentId}, updatedComment);
            const comment = await Comment.findOne(
                {
                    where: {_id: commentId},
                    relations: ["post"]
                });
            if(!comment) return null;

            const keys = await redisClient.keys(`usersconnect:user:${comment.post.author._id}:posts:page:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');

            const safeComment = commentToPublic(comment);
            return safeComment;
        }
        catch(error)
        {
            
            logger.error(`Error updating comment:`, error);
            return null;
        }
    }

    async deleteComment(commentId: string): Promise<PublicComment | null>
    {
        try
        {
            const comment = await Comment.findOne(
                {
                    where: {_id: commentId},
                    relations: ["post"]
                });
            if(!comment) return null;
            await comment.remove();

            const keys = await redisClient.keys(`usersconnect:user:${comment.post.author._id}:posts:page:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');
            await redisClient.del(`user:${comment.author._id}:comments:likes:count`);

            const safeComment = commentToPublic(comment);
            return safeComment;
        }
        catch (error)
        {
            
            logger.error(`Error deleting comment:`, error);
            return null;
        }
    }

    async like(commentId: string, user: UserPayload): Promise<PublicComment | null>
    {
        try
        {
            const comment = await Comment.findOne(
            {
                where: { _id: commentId },
                relations: ["post"]
            });
            if (!comment) return null;

            // Add to likes if not already there
            if (!comment.likes.some(u => u._id === user._id))
            {
                comment.likes.push(user as User);
                
                // Remove from dislikes if they disliked it before
                comment.dislikes = comment.dislikes.filter(u => u._id !== user._id);
                
                await comment.save();
            }

            const keys = await redisClient.keys(`usersconnect:user:${comment.post.author._id}:posts:page:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');
            await redisClient.del(`user:${comment.author._id}:comments:likes:count`);
            const safeComment = commentToPublic(comment);
            return safeComment;
        }
        catch (error)
        {
            
            logger.error(`Error liking comment:`, error);
            return null;
        }
    }

    async unlike(commentId: string, user: UserPayload): Promise<PublicComment | null>
    {
        try
        {
                const comment = await Comment.findOne(
                {
                    where: { _id: commentId },
                    relations: ["post"]
                });
            if (!comment) return null;

            comment.likes = comment.likes.filter(u => u._id !== user._id);
            await comment.save();

            const keys = await redisClient.keys(`usersconnect:user:${comment.post.author._id}:posts:page:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');
            await redisClient.del(`user:${comment.author._id}:comments:likes:count`);
            const safeComment = commentToPublic(comment);
            return safeComment;
        }
        catch (error)
        {
            
            logger.error(`Error unliking comment:`, error);
            return null;
        }
    }

    async dislike(commentId: string, user: UserPayload): Promise<PublicComment | null>
    {
        try
        {
            const comment = await Comment.findOne(
                {
                    where: { _id: commentId },
                    relations: ["post"]
                });
            if (!comment) return null;

            // Add to dislikes if not already there
            if (!comment.dislikes.some(u => u._id === user._id))
            {
                comment.dislikes.push(user as User);
                
                // Remove from likes if they liked it before
                comment.likes = comment.likes.filter(u => u._id !== user._id);
                
                await comment.save();
            }

            const keys = await redisClient.keys(`usersconnect:user:${comment.post.author._id}:posts:page:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');
            await redisClient.del(`user:${comment.author._id}:comments:likes:count`);
            const safeComment = commentToPublic(comment);
            return safeComment;
        }
        catch (error)
        {
            
            logger.error(`Error disliking comment:`, error);
            return null;
        }
    }

    async undislike(commentId: string, user: UserPayload): Promise<PublicComment | null>
    {
        try
        {
            const comment = await Comment.findOne(
            {
                where: { _id: commentId },
                relations: ["post"]
            });
            if (!comment) return null;

            comment.dislikes = comment.dislikes.filter(u => u._id !== user._id);
            await comment.save();

            const keys = await redisClient.keys(`usersconnect:user:${comment.post.author._id}:posts:page:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');
            await redisClient.del(`user:${comment.author._id}:comments:likes:count`);
            const safeComment = commentToPublic(comment);
            return safeComment;
        }
        catch (error)
        {
            
            logger.error(`Error undisliking comment:`, error);
            return null;
        }
    }
}