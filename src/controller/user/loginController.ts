import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { userDao } from '../../dao/userDao.js';
import { getEnvVarWithDefaultIgnoring } from '../../service/lamiadbService.js';
import { Request, Response } from 'express';

export function postLoginController(req: Request, res: Response) {
    const body = req.body;
    const username = body.username;
    const password = body.password;

    userDao.getUserMetadata(username).then(userdataStr => {
        if (userdataStr === false) {
            res.sendStatus(500);
            return;
        }

        const userdata = JSON.parse(userdataStr);

        bcrypt.compare(password, userdata.passwordHash, (err, success) => {
            if (success) {
                jwt.sign({ username: username }, getEnvVarWithDefaultIgnoring('JWT_SECRET') as string, {algorithm: 'HS256'}, (err, token) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    } else if (token) {
                        res.status(200)
                            .cookie('user-jwt', token, {
                                secure: true,
                                httpOnly: true,
                            })
                            .json({});
                    }
                });
            } else {
                res.sendStatus(409);
            }
        });
    });
}