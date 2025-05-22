import path from 'path';
import crypto from 'crypto';

import { createKeyValueStore, readDocumentWithDefaults, getKeyValueStore, userDataPath } from "../util/fsdb.js";

export const dataDirectoryPath = path.join(userDataPath, 'Lamia AI Server');

type Config = {
    metadata: {
        version: string;
    };
    env: {
        JWT_SECRET: string;
        LAMIA_URL: string;
        LAMIA_PORT: number;
    };
};

export let config = {
    metadata: {
        version: '0.0.0'
    },
    env: {
        JWT_SECRET: crypto.randomBytes(128).toString('hex'),
        LAMIA_URL: 'http://localhost:27297',
        LAMIA_PORT: 27297,
    }
};

/**
 * 
 * @param {string} username 
 */
export function postLamiaUserDirectory(username: string) {
    return createKeyValueStore(dataDirectoryPath, username);
}

/**
 * 
 * @param {string} username 
 */
export function createLamiaUserDirectory(username: string) {
    return postLamiaUserDirectory(username);
}

/**
 * 
 * @param {string} username 
 */
export function getLamiaUserDirectory(username: string) {
    return getKeyValueStore(dataDirectoryPath, username);
}

/**
 * Generate and get config file if .env is not available.
 * @returns {Object}
 */
export async function getConfig() {
    const configStr = readDocumentWithDefaults(dataDirectoryPath, 'config.json', JSON.stringify(config));
    config = JSON.parse(configStr) as Config;

    return config;
}

/**
 * Get environment variable from .env or config file
 * @param {string} variableName Name of variable
 */
export function getEnvVar(variableName: string) {
    const configEnv = config.env as {[x: string]: any};

    if (process.env[variableName]) return process.env[variableName];
    else return configEnv[variableName];
}