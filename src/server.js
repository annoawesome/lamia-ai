import express from 'express';
import cookieParser from 'cookie-parser';

import {router as userRouter} from './router/userRouter.js';
import { logSource } from './middleware/logger.js';
import { authenticate } from './middleware/authenticate.js';

const server = express();
const defaultPort = 8080;


export function startServer() {
    console.log('[INFO] Started server');

    server.use(logSource);
    server.use(cookieParser());

    server.use('/user', userRouter);
    server.use(express.static('public'));

    // Test endpoint for authentication
    server.get('/isAuthed', authenticate, (req, res) => {
        res.sendStatus(200);
    });

    server.listen(defaultPort, () => {
        console.log('[INFO] Server listening at port ' + defaultPort);
    });
}