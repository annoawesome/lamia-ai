import express from 'express';

import {router as userRouter} from './router/userRouter.js';
import { logSource } from './middleware/logger.js';

const server = express();
const defaultPort = 8080;


export function startServer() {
    console.log('[INFO] Started server');

    server.use(logSource);

    server.use('/user', userRouter);
    server.use(express.static('public'));

    server.listen(defaultPort, () => {
        console.log('[INFO] Server listening at port ' + defaultPort);
    });
}