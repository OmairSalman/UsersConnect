import { Request, Response, NextFunction } from "express";

export function isAdmin(request: Request, response: Response, next: NextFunction)
{
    const user = request.user;
    if(user && user.isAdmin)
        return next();
    return response.status(403).json({message: "Forbidden: Admins only"});
}