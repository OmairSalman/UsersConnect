import { Request, Response } from "express";
import UserService from "../../services/userService";
import PostService from "../../services/postService";
import { asString } from "../../utils/asString";
import jwt from 'jsonwebtoken';
import multer from 'multer';
import logger from "../../config/logger";
import { RefreshPayload, UserPayload } from "../../config/express";

const userService = new UserService();
const postService = new PostService();

export default class UserController
{
    async getUsers(request: Request, response: Response)
    {
        const users = await userService.readUsers();
        if(!users) response.status(404).send('Users data not found');
        response.status(200).json(users);
    }

    async getUserById(request: Request, response: Response)
    {
        const userId = asString(request.params.id)!;
        const user = await userService.getUserById(userId);
        if(!user) response.status(404).send('User not found')
        else
        {
            response.status(200).json(user);
        }
    }

    async updateUser(request: Request, response: Response)
    {
        const userId = asString(request.params.id)!;
        const updatedUser = request.body;

        if(userId !== request.user?._id && !request.user?.isAdmin)
        {
            return response.status(403).send({message: "Forbidden: Admins only"});
        }

        if (updatedUser.newPassword || updatedUser.confirmPassword) {
            if (!updatedUser.newPassword || !updatedUser.confirmPassword) {
                return response.status(400).send('Both password fields are required.');
            }
            if (updatedUser.newPassword !== updatedUser.confirmPassword) {
                return response.status(400).send('Passwords do not match.');
            }
        }

        const user = await userService.updateUser(userId, updatedUser);
        if(typeof user === 'string')
            {
                if(request.xhr)
                    response.json({message: user});

                else response.status(400).json({message: user});
            }
        else
        {
            if(request.user?._id === user._id)
            {
                response.clearCookie("accessToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });

                response.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });

                const accessPayload: UserPayload = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isEmailPublic: user.isEmailPublic,
                    isEmailVerified: user.isEmailVerified,
                    avatarURL: user.avatarURL,
                    isAdmin: user.isAdmin
                };

                const refreshPayload: RefreshPayload = {
                    _id: user._id
                };

                const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
                const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '30d' });

                response.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 15
                });

                response.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 60 * 24 * 30
                });
            }
            response.status(200).json({success: true, user: user});
        }
    }

    async deleteUser(request: Request, response: Response)
    {
        const userId = asString(request.params.id)!;
        if(userId !== request.user?._id && !request.user?.isAdmin)
        {
            return response.status(403).send({message: "Forbidden: Admins only"});
        }
        const deletedUser = await userService.deleteUser(userId);
        if (!deletedUser) response.status(404).send('User not found');
        else
        {
            response.status(200).json({success: true, user: deletedUser});
        }
    }

    async searchUsers(request: Request, response: Response)
    {
        const searchTerm = asString(request.query.search as any);
        if (!searchTerm) return response.status(400).send('Search query is required');
        const filteredUsers = await userService.searchUsers(searchTerm);
        response.status(200).json(filteredUsers);
    }

    async getUserPosts(request: Request, response: Response)
    {
        let userId = asString(request.params.userId)!;
        const page = parseInt(asString(request.query.page as any) ?? '1', 10) || 1;
        const posts = await postService.getPostsByUserId(userId, page, 10);
        if(!posts) return response.status(404).send("No posts by user");
        return response.status(200).send({message: `Found posts of user with id ${userId}`, posts: posts});
    }

    async toggleAdmin(request: Request, response: Response)
    {
        let userId = asString(request.params.userId)!;
        const user = await userService.toggleAdmin(userId);
        if(!user)
            return response.status(404).json({message: "User not found", success: false});
        return response.status(200).json({message: "User's admin status switched.", success: true, user: user});
    }

    async uploadProfilePicture(request: Request, response: Response)
    {
        const userId = asString(request.params.id)!;
        
        if(userId !== request.user?._id && !request.user?.isAdmin)
        {
            return response.status(403).json({message: "Forbidden: You can only change your own profile picture"});
        }

        if (!request.file)
        {
            return response.status(400).json({message: "No image file provided"});
        }

        try
        {
            const updatedUser = await userService.uploadProfilePicture(userId, request.file);
            
            if (!updatedUser)
            {
                return response.status(404).json({message: "User not found"});
            }

            // Update JWT tokens if user is updating their own picture
            if(request.user?._id === userId)
            {
                response.clearCookie("accessToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });

                response.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });

                const accessPayload: UserPayload = {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    isEmailPublic: updatedUser.isEmailPublic,
                    isEmailVerified: updatedUser.isEmailVerified,
                    avatarURL: updatedUser.avatarURL,
                    isAdmin: updatedUser.isAdmin
                };

                const refreshPayload: RefreshPayload = {
                    _id: updatedUser._id
                };

                const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
                const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '30d' });

                response.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 15
                });

                response.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 60 * 24 * 30
                });
            }

            return response.status(200).json({success: true, user: updatedUser});
        }
        catch (error)
        {
            logger.error('Error uploading profile picture:', error);
            return response.status(500).json({message: "Failed to upload profile picture"});
        }
    }

    async removeProfilePicture(request: Request, response: Response)
    {
        const userId = asString(request.params.id)!;
        
        if(userId !== request.user?._id && !request.user?.isAdmin)
        {
            return response.status(403).json({message: "Forbidden: You can only change your own profile picture"});
        }

        try
        {
            const updatedUser = await userService.removeProfilePicture(userId);
            
            if (!updatedUser)
            {
                return response.status(404).json({message: "User not found"});
            }

            // Update JWT tokens if user is removing their own picture
            if(request.user?._id === userId)
            {
                response.clearCookie("accessToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });

                response.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });

                const accessPayload:UserPayload = {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    isEmailPublic: updatedUser.isEmailPublic,
                    isEmailVerified: updatedUser.isEmailVerified,
                    avatarURL: updatedUser.avatarURL,
                    isAdmin: updatedUser.isAdmin
                };

                const refreshPayload: RefreshPayload = {
                    _id: updatedUser._id
                };

                const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
                const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '30d' });

                response.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 15
                });

                response.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 60 * 24 * 30
                });
            }

            return response.status(200).json({success: true, user: updatedUser});
        }
        catch (error)
        {
            logger.error('Error removing profile picture:', error);
            return response.status(500).json({message: "Failed to remove profile picture"});
        }
    }
}