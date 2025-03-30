import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
    jwt.verify(req.cookies['user-jwt'], process.env.JWT_KEY, {algorithm: 'HS256'}, (err) => {
        if (err) {
            res.sendStatus(403);
        } else {
            next();
        }
    });
}