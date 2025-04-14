import jwt from 'jsonwebtoken';
import { getEnvVar } from '../util/fsdb.js';

export function authenticate(req, res, next) {
    jwt.verify(req.cookies['user-jwt'], getEnvVar('JWT_SECRET'), {algorithm: 'HS256'}, (err, decoded) => {
        if (err) {
            res.sendStatus(403);
        } else {
            req.username = decoded.username;
            next();
        }
    });
}