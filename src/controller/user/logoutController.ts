import { Request, Response } from 'express';

export function logoutController(req: Request, res: Response) {
    res.clearCookie('user-jwt', {
        secure: true,
        httpOnly: true,
    }).sendStatus(200);
}