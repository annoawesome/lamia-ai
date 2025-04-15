import express from 'express';
import cookieParser from 'cookie-parser';

import {router as userRouter} from './router/userRouter.js';
import { router as storyRouter } from './router/storyRouter.js';
import { logSource, log } from './middleware/logger.js';
import { authenticate } from './middleware/authenticate.js';
import { getConfig, getEnvVar } from './util/fsdb.js';

const server = express();

export async function startServer() {
    log('Loading configuration');
    await getConfig();
    log('Starting server');

    const defaultPort = getEnvVar('LAMIA_PORT');

    server.use(logSource);
    server.use(cookieParser());

    server.use('/api/v1/user', userRouter);
    server.use('/api/v1/story', storyRouter);
    server.use(express.static('public'));

    // Test endpoint for authentication
    server.get('/api/v1/isAuthed', authenticate, (req, res) => {
        res.sendStatus(200);
    });

    server.listen(defaultPort, () => {
        log('Server listening at port ' + defaultPort);
    });
}