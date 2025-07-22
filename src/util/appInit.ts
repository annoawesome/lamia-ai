import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { envDependentPaths } from './paths.js';
import { getEnvVar } from './env.js';

export function loadEnvFile(path: string) {
    if (fs.existsSync(path)) {
        dotenv.config({
            path: path
        });

        return true;
    }

    return false;
}

export function loadEnv() {
    if (loadEnvFile('.env.local')) return;
    if (loadEnvFile('.env')) return;

    if (process.env.NODE_ENV === 'production' && loadEnvFile('.env.production.local')) return;
    if (process.env.NODE_ENV === 'production' && loadEnvFile('.env.production')) return;
    if (process.env.NODE_ENV === 'testing' && loadEnvFile('.env.test.local')) return;
    if (process.env.NODE_ENV === 'testing' && loadEnvFile('.env.test')) return;
    if (process.env.NODE_ENV === 'development' && loadEnvFile('.env.development.local')) return;

    // Electron Forge will copy the .env.production file to the resources path
    if (loadEnvFile(path.join(process.resourcesPath || '', '.env.production'))) return;
}

export function fixPaths(defaultDynamicUserDataPath: string | undefined) {
    const lamiaAppDataDirectory = getEnvVar('LAMIA_USERDATA_DIRECTORY');

    if (defaultDynamicUserDataPath && getEnvVar('LAMIA_APP_CONTEXT') === 'Electron') {
        envDependentPaths.userData = () => defaultDynamicUserDataPath;
    } else if (lamiaAppDataDirectory) {
        envDependentPaths.userData = () => lamiaAppDataDirectory;
    }
}