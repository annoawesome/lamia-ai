import express from 'express';
import cookieParser from 'cookie-parser';

import {router as userRouter} from './router/userRouter.js';
import { router as storyRouter } from './router/storyRouter.js';
import { logSource, log } from './middleware/logger.js';
import { getConfig, getEnvVar } from './service/lamiadbService.js';

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

    server.use('/js', express.static('src/public/js'));
    server.use('/css', express.static('src/public/css'));
    server.use('/', express.static('src/public/html', { extensions: ['html'] }));

    server.listen(defaultPort, () => {
        log('Server listening at port ' + defaultPort);
    });
}