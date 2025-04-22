import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { userDao } from '../../dao/userDao.js';
import { getEnvVar } from '../../service/lamiadbService.js';
import { isFailure, sanitizeFailure } from '../../util/failure.js';

const saltRounds = 10;

export function createUserController(req, res) {
    const body = req.body;
    const username = body.username;
    const password = body.password;

    bcrypt.hash(password, saltRounds).then((passwordHash) => {
        userDao.createUser(username, passwordHash)
            .then(() => jwt.sign({ username: username }, getEnvVar('JWT_SECRET'), {algorithm: 'HS256'}, (err, token) => {
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
            }))
            .catch(err => {
                console.log(err);

                if (isFailure(err)) {
                    res.status(err.httpStatusCode);
                    res.json(sanitizeFailure(err));
                } else {
                    res.sendStatus(500);
                };
            });
    });
}