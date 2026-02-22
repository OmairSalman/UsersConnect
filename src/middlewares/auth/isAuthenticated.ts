import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload, RefreshPayload } from '../../config/express';
import UserService from '../../services/userService';

const userService = new UserService();

export async function isAuthenticated(request: Request, response: Response, next: NextFunction)
{
  const accessToken = request.cookies.accessToken;
  const refreshToken = request.cookies.refreshToken;

  if (!accessToken && !refreshToken)
  {
    // Check if this is an API request or browser request
    const isApiRequest = request.headers.accept?.includes('application/json');
    
    if (isApiRequest) {
      // Angular/API client - return JSON error
      return response.status(401).json({ message: 'Unauthorized' });
    } else {
      // Browser/SSR - redirect to login page
      return response.redirect('/login');
    }
  }

  try
  {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as UserPayload;
    request.user = decoded;
    return next();
  }
  catch (error)
  {
    if (!refreshToken) {
      const isApiRequest = request.headers.accept?.includes('application/json');
      
      if (isApiRequest) {
        return response.status(401).json({ message: 'Unauthorized' });
      } else {
        return response.redirect('/login');
      }
    }
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
    const isApiRequest = request.headers.accept?.includes('application/json');
    
    if (isApiRequest) {
      return response.status(401).json({ message: 'Unauthorized' });
    } else {
      return response.redirect('/login');
    }
  }
}