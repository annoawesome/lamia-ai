import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { userDao } from '../../dao/userDao.js';

const saltRounds = 10;

export function createUserController(req, res) {
    const body = req.body;
        const username = body.username;
        const password = body.password;
    
        bcrypt.hash(password, saltRounds).then((passwordHash) => {
            userDao.createUser(username, passwordHash)
                .then(() => jwt.sign({ username: username }, process.env.JWT_KEY, {algorithm: 'HS256'}, (err, token) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    } else if (token) {
                        res.status(200).json({
                            jwt: token,
                        });
                    }
                }))
                .catch(err => {
                    console.log(err);
                    res.sendStatus(500);
                });
        });
}