import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload, RefreshPayload } from '../../config/express';
import UserService from '../../services/userService';

const userService = new UserService();

export async function isAuthenticated(request: Request, response: Response, next: NextFunction)
{
  const accessToken = request.cookies.accessToken;
  const refreshToken = request.cookies.refreshToken;

  if (!accessToken && ! refreshToken)
  {
    return response.redirect('/login');
  }

  try
  {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as UserPayload;

    request.user = decoded;

    return next();
  }
  catch (error)
  {
    if (!refreshToken)
      return response.redirect('/login');
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
      avatarURL: user.avatarURL,
      isAdmin: user.isAdmin
    };

    const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });

    response.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 15
    });

    request.user = payload;
    return next();
  }
  catch (refreshErr)
  {
    return response.redirect('/login');
  }
}