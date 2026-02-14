import { Request, Response } from "express";
import PostService from "../../services/postService";
import CommentService from "../../services/commentService";
import UserService from "../../services/userService";
import jwt from 'jsonwebtoken';
import { UserPayload, RefreshPayload } from "../../config/express";
import crypto from 'crypto';
import { Post } from "../../entities/postEntity";
import { isS3Configured } from "../../utils/s3Config";
import { asString } from "../../utils/asString";
import redisClient from "../../config/redis";

const postService = new PostService();
const commentService = new CommentService();
const userService = new UserService();

export default class WebController
{
    home(request: Request, response: Response)
    {
        const accessToken = request.cookies.accessToken;
        const refreshToken = request.cookies.refreshToken;
        if(accessToken || refreshToken)
        {
            response.redirect('/feed');
        }
        else
        {
            response.render('pages/home');
        }
    }

    async feed(request: Request, response: Response)
    {
        if(!request.user)
            response.redirect('/');
        else
        {
            const page = parseInt(asString(request.query.page as any) ?? '1', 10) || 1;
            const posts = await postService.getPosts(page, 10);
            const postsCount = await Post.count();
            const totalPages = Math.ceil(postsCount/10);
            const s3Enabled = isS3Configured();
            response.render('pages/feed', {
                currentUser: request.user, 
                currentUserId: request.user._id, 
                posts: posts, 
                page: page, 
                limit: 10, 
                totalPages: totalPages,
                s3Enabled: s3Enabled
            });
        }
    }

    login(request: Request, response: Response)
    {
        const accessToken = request.cookies.accessToken;
        const refreshToken = request.cookies.refreshToken;
        if (!accessToken)
        {
            if(!refreshToken) return response.render('pages/login');
        }
    
        return response.redirect('/feed');
    }

    register(request: Request, response: Response)
    {
        const accessToken = request.cookies.accessToken;
        const refreshToken = request.cookies.refreshToken;
        if (!accessToken)
        {
            if(!refreshToken) return response.render('pages/register');
        }
    
        return response.redirect('/feed');
    }
    
    async profile(request: Request, response: Response)
    {
        const user = request.user;
        const s3Enabled = isS3Configured();
        let posts;
        if(user)
        {
            const page = parseInt(asString(request.query.postsPage as any) ?? '1', 10) || 1;
            posts = await postService.getPostsByUserId(user._id, page, 10);
            if(posts)
            {
                const postsCount = await Post.countBy({ author_id: user._id });
                const totalPages = Math.ceil(postsCount/10);
                const postsLikes = await postService.countUserPostsLikes(user._id.toString());
                const commentsLikes = await commentService.countUserCommentsLikes(user._id.toString());
                response.render('pages/profile', {
                    user: user, 
                    currentUser: user, 
                    posts: posts, 
                    postsLikes: postsLikes, 
                    commentsLikes: commentsLikes, 
                    postsPage: page, 
                    limit: 10, 
                    totalPages: totalPages,
                    s3Enabled: s3Enabled
                });
            }
        }
    }

    async showUserProfile(request: Request, response: Response)
    {
        const currentUser = request.user;
        const userId = asString(request.params.userId)!;
        const page = parseInt(asString(request.query.postsPage as any) ?? '1', 10) || 1;
        const s3Enabled = isS3Configured();
        const user = await userService.getUserById(userId);
        if(user)
        {
            const posts = await postService.getPostsByUserId(userId.toString(), page, 10);
            if(posts)
            {
                const postsCount = await Post.countBy({ author_id: user._id });
                const totalPages = Math.ceil(postsCount/10);
                const postsLikes = await postService.countUserPostsLikes(userId.toString());
                const commentsLikes = await commentService.countUserCommentsLikes(userId.toString());
                response.render('pages/profile', {
                    user: user, 
                    currentUser: currentUser,
                    posts: posts, 
                    postsLikes: postsLikes, 
                    commentsLikes: commentsLikes, 
                    postsPage: page, 
                    limit: 10, 
                    totalPages: totalPages,
                    s3Enabled: s3Enabled
                });
            }
        }
    }

    editProfile(request: Request, response: Response)
    {
        const user = request.user;
        const s3Enabled = isS3Configured();
        return response.render('pages/editProfile', {currentUser: user, s3Enabled: s3Enabled, hasCustomAvatar: !user?.avatarURL.includes('gravatar.com')});
    }

    async adminUsersPanel(request: Request, response: Response)
    {
        const user = request.user;
        const users = await userService.readUsers();
        return response.render('pages/users', {currentUser: user, users: users});
    }

    async editUser(request: Request, response: Response)
    {
        const currentUser = request.user;
        const userId = asString(request.params.userId)!;
        if(currentUser?._id === userId)
        {
            return response.redirect('/profile/edit');
        }
        const user = await userService.getUserById(userId);
        return response.render('pages/adminEditUser', { user: user, currentUser: currentUser });
    }

    async about(request: Request, response: Response)
    {
        const currentUser = await getUserFromToken(request, response);
        response.render('pages/about', {currentUser: currentUser});
    }

    async privacy(request: Request, response: Response)
    {
        const currentUser = await getUserFromToken(request, response);
        response.render('pages/privacy', {currentUser: currentUser});
    }

    async terms(request: Request, response: Response)
    {
        const currentUser = await getUserFromToken(request, response);
        response.render('pages/terms', {currentUser: currentUser});
    }

    async contact(request: Request, response: Response)
    {
        const currentUser = await getUserFromToken(request, response);
        response.render('pages/contact', {currentUser: currentUser});
    }

    forgotPassword(request: Request, response: Response)
    {
        const accessToken = request.cookies.accessToken;
        const refreshToken = request.cookies.refreshToken;
        
        // Redirect if already logged in
        if (accessToken || refreshToken) {
            return response.redirect('/feed');
        }
        
        return response.render('pages/forgotPassword');
    }

    resetPassword(request: Request, response: Response)
    {
        const accessToken = request.cookies.accessToken;
        const refreshToken = request.cookies.refreshToken;
        
        // Redirect if already logged in
        if (accessToken || refreshToken) {
            return response.redirect('/feed');
        }
        
        return response.render('pages/resetPassword');
    }

    async resetPasswordConfirm(request: Request, response: Response)
    {
        const sessionToken = request.cookies.resetSessionToken;
        
        if (!sessionToken) {
            // No session - redirect to forgot password
            return response.redirect('/forgot-password');
        }
        
        // Check if session is valid
        const email = await redisClient.get(`reset-session:${sessionToken}`);
        if (!email) {
            // Session expired or invalid
            return response.redirect('/forgot-password');
        }
        
        return response.render('pages/resetPasswordConfirm');
    }
}

async function getUserFromToken(request: Request, response: Response)
{
    const accessToken = request.cookies.accessToken;
    const refreshToken = request.cookies.refreshToken;

    if (!accessToken && ! refreshToken)
    {
        return null;
    }

    try
    {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as UserPayload;
        return decoded;
    }
    catch (error)
    {
        if (!refreshToken)
            return null;
    }

    try
    {
        const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as RefreshPayload;
        
        const user = await userService.getUserById(decodedRefresh._id);

        if(!user) return response.status(404).json({message: "User not found."});

        const payload: UserPayload = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isEmailPublic: user.isEmailPublic,
            isEmailVerified: user.isEmailVerified,
            avatarURL: user.avatarURL,
            isAdmin: user.isAdmin
        };

        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
        
        response.cookie("accessToken", newAccessToken,
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 15
        });
        return payload;
    }
    catch (refreshErr)
    {
        return null;
    }

}
