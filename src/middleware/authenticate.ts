import jwt, { SignOptions } from 'jsonwebtoken';
import { getEnvVar } from '../service/lamiadbService.js';
import { NextFunction, Request, Response } from 'express';

export type AuthenticatedRequest = Request & {
    username?: string
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    jwt.verify(req.cookies['user-jwt'], getEnvVar('JWT_SECRET'), {algorithms: [ 'HS256' ]}, (err, decoded) => {
        if (typeof(decoded) === 'object' && 'username' in decoded) {
            req.username = decoded.username;
            next();
        } else {
            res.sendStatus(403);
        }
    });
}