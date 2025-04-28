import path from 'path';
import crypto from 'crypto';

import { createKeyValueStore, readDocumentWithDefaults, getKeyValueStore, userDataPath } from "../util/fsdb.js";

export const dataDirectoryPath = path.join(userDataPath, 'Lamia AI Server');

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
export function postLamiaUserDirectory(username) {
    return createKeyValueStore(dataDirectoryPath, username);
}

/**
 * 
 * @param {string} username 
 */
export function createLamiaUserDirectory(username) {
    return postLamiaUserDirectory(username);
}

/**
 * 
 * @param {string} username 
 */
export function getLamiaUserDirectory(username) {
    return getKeyValueStore(dataDirectoryPath, username);
}

/**
 * Generate and get config file if .env is not available.
 * @returns {Object}
 */
export async function getConfig() {
    const configStr = readDocumentWithDefaults(dataDirectoryPath, 'config.json', JSON.stringify(config));
    config = JSON.parse(configStr);

    return config;
}

/**
 * Get environment variable from .env or config file
 * @param {string} variableName Name of variable
 */
export function getEnvVar(variableName) {
    if (process.env[variableName]) return process.env[variableName];
    else return config.env[variableName];
}