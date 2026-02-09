import { Request, Response } from "express";
import AuthService from "../../services/authService";
import jwt from 'jsonwebtoken';

const authService = new AuthService();

export default class AuthController
{
    async loginUser(request: Request, response: Response)
    {
        const credentials: {email: string, password: string} = request.body;
        if (!credentials || !credentials.email || !credentials.password)
        {
            response.status(400).send('Please enter all login credentials');
            return;
        }
        const user = await authService.loginUser(credentials);
        if(typeof user === 'string')
            if(user === 'DNE')
                response.status(401).json({ error: "Account doesn't exist, please register" });
            else
                response.status(401).json({ error: "Invalid email or password" });
        else
        {
            const accessPayload = {
                _id: user._id,
                name: user.name,
                email: user.email,
                isEmailPublic: user.isEmailPublic,
                avatarURL: user.avatarURL,
                isAdmin: user.isAdmin
            };

            const refreshPayload = {
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

            response.redirect('/feed?page=1');
        }
    }

    async registerUser(request: Request, response: Response)
    {
        let newUser = request.body;
        newUser = await authService.registerUser(newUser);
        
        const accessPayload = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            isEmailPublic: newUser.isEmailPublic,
            avatarURL: newUser.avatarURL,
            isAdmin: false
        };

        const refreshPayload = {
            _id: newUser._id
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

        response.redirect('/feed?page=1');
    }

    async logoutUser(request: Request, response: Response)
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
        response.redirect('/');
    }

    async verifyPassword(request: Request, response: Response)
    {
        const userId = request.user!._id;
        const password = request.body.password;
        const user = await authService.verifyPassword(userId, password);
        if(!user) return response.status(401).json({message: "Couldn't verify password", success: false});
        return response.status(200).json({message: "Password verified", success: true});
    }
}