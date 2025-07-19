import express from 'express';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import path from 'path';

import { router as userRouter } from './router/userRouter.js';
import { router as storyRouter } from './router/storyRouter.js';
import { router as configRouter } from './router/configRouter.js';
import { logSource, log } from './middleware/logger.js';
import { getEnvVar } from './util/env.js';
import { generateDataDirectoryPath, getEnvVarWithDefault } from './service/lamiadbService.js';
import { getInfoController } from './controller/infoController.js';
import { errorRedirectController } from './controller/errorController.js';
import { limiter } from './middleware/ratelimit.js';

const server = express();

export async function startServer() {
    log('Loading configuration');
    log('Starting server');

    generateDataDirectoryPath();
    getEnvVarWithDefault('JWT_SECRET', crypto.randomBytes(128).toString('hex'));

    const defaultPort = getEnvVar('LAMIA_PORT');

    server.use(logSource);
    server.use(cookieParser());
    server.use(limiter);

    server.use('/api/v1/user', userRouter);
    server.use('/api/v1/story', storyRouter);

    server.use('/api/v1/config', configRouter);
    server.get('/api/v1/info', getInfoController);

    // say YES to build tools!
    server.use(express.static(path.join(process.resourcesPath || getEnvVar('LAMIA_WEBROOT_DIR') || 'dist','public'), { extensions: [ 'html' ] }));
    server.use(errorRedirectController);

    server.listen(defaultPort, () => {
        log('Server listening at port ' + defaultPort);
    });
}