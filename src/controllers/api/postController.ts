import { Request, Response } from "express";
import PostService from "../../services/postService";
import { S3Service } from "../../services/s3Service";
import { isS3Configured } from "../../utils/s3Config";
import { asString } from "../../utils/asString";

const postService = new PostService();

export default class PostController
{
    async getAllPosts(request: Request, response: Response)
    {
        const page = parseInt(asString(request.query.page as any) ?? '1', 10) || 1;
        const limit = parseInt(asString(request.query.limit as any) ?? '10', 10) || 10;
        const posts = await postService.getPosts(page, limit);
        if(!posts) return response.status(404).send('No posts yet');
        return response.status(200).json(posts);
    }

    async getPost(request: Request, response: Response)
    {
        const postId = asString(request.params.postId)!;
        const post = await postService.getPostById(postId);
        if(!post) return response.status(404).send("Post not found");
        return response.status(200).json(post);
    }

    async savePost(request: Request, response: Response)
    {
        let newPost = request.body;
        let imageURL: string | undefined;

        // Check if S3 is configured and file was uploaded
        if (isS3Configured() && request.file) {
            try {
                const s3Service = new S3Service();
                imageURL = await s3Service.uploadPostImage(request.file, request.user!._id);
            } catch (error) {
                console.error('S3 upload error:', error);
                return response.status(500).json({message: "Failed to upload image"});
            }
        } else if (request.file && !isS3Configured()) {
            // User tried to upload but S3 is not configured
            return response.status(400).json({message: "Image uploads are not enabled on this server"});
        }

        newPost = await postService.savePost({ ...newPost, imageURL }, request.user!._id);
        response.status(201).json({message: "Post saved successfully", post: newPost});
    }

    async updatePost(request: Request, response: Response)
    {
        let postId = asString(request.params.postId)!;
        let post = request.body;
        let imageURL: string | undefined | null = undefined;

        // Only handle images if S3 is configured
        if (isS3Configured()) {
            // Check if user wants to remove the image
            if (request.body.removeImage === 'true') {
                imageURL = null; // null means remove the image
            }
            // Check if a new image was uploaded
            else if (request.file) {
                try {
                    const s3Service = new S3Service();
                    imageURL = await s3Service.uploadPostImage(request.file, request.user!._id);
                } catch (error) {
                    console.error('S3 upload error:', error);
                    return response.status(500).json({message: "Failed to upload image"});
                }
            }
        } else if (request.file && !isS3Configured()) {
            // User tried to upload but S3 is not configured
            return response.status(400).json({message: "Image uploads are not enabled on this server"});
        }

        const updatedPost = await postService.updatePost(postId, post, imageURL);
        if(!updatedPost) return response.status(404).send("Post not found");
        return response.status(200).json({message: "Post update successfully", post: updatedPost});
    }

    async deletePost(request: Request, response: Response)
    {
        let postId = asString(request.params.postId)!;
        const deletedPost = await postService.deletePost(postId);
        if(!deletedPost) return response.status(404).send("Post not found");
        return response.status(200).json({message: "Post deleted successfully", post: deletedPost});
    }

    async like(request: Request, response: Response)
    {
        let postId = asString(request.params.postId)!;
        let user = request.user!;
        const likedPost = await postService.like(postId, user);
        if(!likedPost) return response.status(404).send("Post not found");
        return response.status(200).json({message: `Liked post ${postId} by ${user._id} successfully.`, liked: true, likeCount: likedPost.likes.length, likes: likedPost.likes});
    }

    async unlike(request: Request, response: Response)
    {
        let postId = asString(request.params.postId)!;
        let user = request.user!;
        const unlikedPost = await postService.unlike(postId, user);
        if(!unlikedPost) return response.status(404).send("Post not found");
        return response.status(200).json({message: `Unliked post ${postId} by ${user._id} successfully.`, liked: false, likeCount: unlikedPost.likes.length, likes: unlikedPost.likes});
    }
}
