import path from 'path';

import { createKeyValueStore, readDocumentWithDefaults, getKeyValueStore, userDataPath, writeDocument } from "../util/fsdb.js";

export const dataDirectoryPath = path.join(userDataPath, 'Lamia AI Server');

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
 * Get variable from .env or config file. Only use for unique local variables
 * @param {string} variableName Name of variable
 */
export function getEnvVarWithDefault(variableName: string, defaultValue: unknown) {
    if (process.env[variableName]) {
        return process.env[variableName];
    };

    const configStr = readDocumentWithDefaults(dataDirectoryPath, 'config.json', '{}');
    const config = JSON.parse(configStr);

    if (!config[variableName]) {
        config[variableName] = defaultValue;
        writeDocument(dataDirectoryPath, 'config.json', JSON.stringify(config));
    }
    
    return config[variableName];
}

/**
 * Same as `getEnvVarWithDefault()` but without setting a default.
 * @param variableName 
 * @returns 
 */
export function getEnvVarWithDefaultIgnoring(variableName: string) {
    if (process.env[variableName]) {
        return process.env[variableName];
    };

    const configStr = readDocumentWithDefaults(dataDirectoryPath, 'config.json', '{}');
    const config = JSON.parse(configStr);
    
    return config[variableName];
}

/**
 * Get variable from .env
 * @param {string} variableName Name of variable
 */
export function getEnvVar(variableName: string) {
    return process.env[variableName];
}