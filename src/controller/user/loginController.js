import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { userDao } from '../../dao/userDao.js';
import { getEnvVar } from '../../service/lamiadbService.js';

export function postLoginController(req, res) {
    const body = req.body;
    const username = body.username;
    const password = body.password;

    userDao.getUserMetadata(username).then(userdataStr => {
        const userdata = JSON.parse(userdataStr);

        bcrypt.compare(password, userdata.passwordHash, (err, success) => {
            if (success) {
                jwt.sign({ username: username }, getEnvVar('JWT_SECRET'), {algorithm: 'HS256'}, (err, token) => {
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