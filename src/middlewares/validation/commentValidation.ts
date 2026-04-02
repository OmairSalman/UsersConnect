import { Request, Response, NextFunction } from 'express';

export default function CommentValidator(request: Request, response: Response, next: NextFunction)
{
    const commentContent = request.body.content;

    if(!commentContent)
        return response.status(400).send("Invalid comment data");

    next();
}