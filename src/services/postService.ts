import { Post } from "../entities/postEntity";
import { User } from "../entities/userEntity";
import redisClient from "../config/redis";
import { postToPublic } from "../utils/publicDTOs";
import { PublicPost } from "../utils/publicTypes";
import { UserPayload } from "../config/express";
import { S3Service } from "./s3Service";
import logger from '../config/logger';

export default class PostService
{
    async getPosts(page: number, limit: number): Promise<PublicPost[]>
    {
        try
        {
            const cacheKey = "feed:page:1";
            if(page === 1)
            {
                const cached = await redisClient.get(cacheKey);
                if (cached)
                {
                    return JSON.parse(cached);
                }
            }
            const skip = (page - 1) * limit;
            const posts = await Post.find(
                {
                    order: {createdAt: "DESC"},
                    skip: skip,
                    take: limit
                }
            );
            const safePosts = posts.map(postToPublic);
            if(page === 1) await redisClient.setex(cacheKey, 600, JSON.stringify(safePosts));
            return safePosts;
        }
        catch (error)
        {
            
            logger.error(`Error fetching posts:\n`, error);
            return [];
        }
    }

    async getPostById(postId: string): Promise<PublicPost | null>
    {
        try
        {
            const post = await Post.findOne(
                {
                    where: { _id: postId },
                });
            if(!post) return null;
            const safePost = postToPublic(post);
            return safePost;
        }
        catch
        (error)
        {
            
            logger.error(`Error fetching post by ID:`, error);
            return null;
        }
    }

    async savePost(newPost: Post & { imageURL?: string }, authorId: string): Promise<PublicPost | null>
    {
        try
        {
            const insertResult = await Post.insert({
                title: newPost.title,
                content: newPost.content,
                imageURL: newPost.imageURL, // ADD THIS LINE
                author_id: authorId
            });
            const keys = await redisClient.keys(`usersconnect:user:${authorId}:posts:page:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');

            const post = await Post.findOneBy({_id: insertResult.identifiers[0]._id});
            const safePost = postToPublic(post!);
            return safePost;
        }
        catch (error)
        {
            
            logger.error(`Error saving post:`, error);
            return null;
        }
    }

    async updatePost(postId: string, updatedPost: Post, imageURL?: string | null): Promise<PublicPost | null>
    {
        try
        {
            // Get the current post to check if we need to delete an old image
            const currentPost = await Post.findOneBy({ _id: postId });
            if(!currentPost) return null;

            const oldImageURL = currentPost.imageURL;

            // Prepare update data
            const updateData: any = {
                title: updatedPost.title,
                content: updatedPost.content,
            };

            // Handle image updates
            if (imageURL === null) {
                // User wants to remove the image
                updateData.imageURL = null;
                // Delete old image from S3 if it exists
                if (oldImageURL) {
                    const s3Service = new S3Service();
                    await s3Service.deletePostImage(oldImageURL);
                }
            } else if (imageURL !== undefined) {
                // User uploaded a new image
                updateData.imageURL = imageURL;
                // Delete old image from S3 if it exists
                if (oldImageURL) {
                    const s3Service = new S3Service();
                    await s3Service.deletePostImage(oldImageURL);
                }
            }
            // If imageURL is undefined, don't change the image

            await Post.update({ _id: postId }, updateData);
            const post = await Post.findOneBy({ _id: postId });
            if(!post) return null;

            const keys = await redisClient.keys(`usersconnect:user:${post.author._id}:posts:page:*`);
            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }
            await redisClient.del('feed:page:1');

            const safePost = postToPublic(post);
            return safePost;
        }
        catch (error)
        {
            
            logger.error(`Error updating post:`, error);
            return null;
        }
    }

    async deletePost(postId: string): Promise<PublicPost | null>
    {
        try
        {
            const post = await Post.findOne({ where: {_id: postId } });
            if(!post) return null;

            // Delete image from S3 if it exists
            if (post.imageURL) {
                const s3Service = new S3Service();
                await s3Service.deletePostImage(post.imageURL);
            }

            await post.remove();
            for (const comment of post.comments) {
                await redisClient.del(`user:${comment.author._id}:comments:likes:count`);
            }

            const keys = await redisClient.keys(`usersconnect:user:${post.author._id}:posts:*`);

if (keys.length > 0) {
    // Strip the prefix from each key before deleting
    const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

    await redisClient.del(...keysWithoutPrefix);
}

            await redisClient.del('feed:page:1');
            await redisClient.del(`user:${post.author._id}:comments:likes:count`);

            const safePost = postToPublic(post);
            return safePost;
        }
        catch (error)
        {
            
            logger.error(`Error deleting post:`, error);
            return null;
        }
    }

    async getPostsByUserId(userId: string, page: number, limit: number): Promise<PublicPost[] | null>
    {
        const cacheKey = `user:${userId}:posts:page:${page}:limit:${limit}`;
        try
        {
            const cached = await redisClient.get(cacheKey);
            if (cached)
            {
                return JSON.parse(cached);
            }
            const skip = (page - 1) * limit;
            const posts =  await Post.find(
                {
                    where: { author: {_id: userId} },
                    order: { createdAt: "DESC" },
                    skip: skip,
                    take: limit
                }
            );
            if(!posts) return null;
            const safePosts = posts.map(postToPublic);
            await redisClient.setex(cacheKey, 3600, JSON.stringify(safePosts));
            return safePosts;
        }
        catch (error)
        {
            
            logger.error(`Error fetching posts by user:\n`, error);
            return null;
        }
    }

    async countUserPostsLikes(userId: string)
    {
        const cacheKey = `user:${userId}:posts:likes:count`;
        const cached = await redisClient.get(cacheKey);
        if (cached)
        {
            return JSON.parse(cached);
        }
        const posts = await Post.find(
            {
                where: { author: {_id: userId} },
            }
        );
        if(posts)
        {
            let postsLikes = 0;
            posts.forEach(comment =>{
                postsLikes += comment.likes.length;
            });
            await redisClient.setex(cacheKey, 300, JSON.stringify(postsLikes));
            return postsLikes;
        }
    }

    async like(postId: string, user: UserPayload): Promise<PublicPost | null>
    {
        try
        {
            const post = await Post.findOne(
            {
                where: { _id: postId },
            });
            if (!post) return null;

            // Add to likes if not already there
            if (!post.likes.some(u => u._id === user._id))
            {
                post.likes.push(user as User);
                
                // Remove from dislikes if they disliked it before
                post.dislikes = post.dislikes.filter(u => u._id !== user._id);
                
                await post.save();
            }

            const keys = await redisClient.keys(`usersconnect:user:${post.author._id}:posts:*`);

            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }

            await redisClient.del('feed:page:1');
            const safePost = postToPublic(post);
            return safePost;
        }
        catch (error)
        {
            
            logger.error(`Error liking post:`, error);
            return null;
        }
    }

    async unlike(postId: string, user: UserPayload): Promise<PublicPost | null>
    {
        try
        {
            const post = await Post.findOne(
            {
                where: { _id: postId },
            });
            if (!post) return null;

            post.likes = post.likes.filter(u => u._id !== user._id);
            await post.save();

            const keys = await redisClient.keys(`usersconnect:user:${post.author._id}:posts:*`);

            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }

            await redisClient.del('feed:page:1');
            const safePost = postToPublic(post);
            return safePost;
        }
        catch (error)
        {
            
            logger.error(`Error unliking post:`, error);
            return null;
        }
    }

    async dislike(postId: string, user: UserPayload): Promise<PublicPost | null>
    {
        try
        {
            const post = await Post.findOne(
            {
                where: { _id: postId },
            });
            if (!post) return null;

            // Add to dislikes if not already there
            if (!post.dislikes.some(u => u._id === user._id))
            {
                post.dislikes.push(user as User);
                
                // Remove from likes if they liked it before
                post.likes = post.likes.filter(u => u._id !== user._id);
                
                await post.save();
            }

            const keys = await redisClient.keys(`usersconnect:user:${post.author._id}:posts:*`);

            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }

            await redisClient.del('feed:page:1');
            const safePost = postToPublic(post);
            return safePost;
        }
        catch (error)
        {
            
            logger.error(`Error disliking post:`, error);
            return null;
        }
    }

    async undislike(postId: string, user: UserPayload): Promise<PublicPost | null>
    {
        try
        {
            const post = await Post.findOne(
            {
                where: { _id: postId },
            });
            if (!post) return null;

            post.dislikes = post.dislikes.filter(u => u._id !== user._id);
            await post.save();

            const keys = await redisClient.keys(`usersconnect:user:${post.author._id}:posts:*`);

            if (keys.length > 0) {
                // Strip the prefix from each key before deleting
                const keysWithoutPrefix = keys.map(key => key.replace('usersconnect:', ''));

                await redisClient.del(...keysWithoutPrefix);
            }

            await redisClient.del('feed:page:1');
            const safePost = postToPublic(post);
            return safePost;
        }
        catch (error)
        {
            
            logger.error(`Error undisliking post:`, error);
            return null;
        }
    }
}