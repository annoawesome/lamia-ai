import path from 'path';

import { createKeyValueStore, readDocumentWithDefaults, getKeyValueStore, writeDocument, getServerDataRootPath, expectKeyValueStore } from "../util/fsdb.js";

export function getDataDirectoryPath() {
    return path.join(getServerDataRootPath(), 'Lamia AI Server');
}

/**
 * Call this before any other db function to ensure that directory is there.
 * Generates the directory where server dabase is located
 */
export function generateDataDirectoryPath() {
    expectKeyValueStore(getServerDataRootPath(), 'Lamia AI Server');
}

/**
 * 
 * @param {string} username 
 */
export function postLamiaUserDirectory(username: string) {
    return createKeyValueStore(getDataDirectoryPath(), username);
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
    return getKeyValueStore(getDataDirectoryPath(), username);
}

/**
 * Get variable from .env or config file. Only use for unique local variables
 * @param {string} variableName Name of variable
 */
export function getEnvVarWithDefault(variableName: string, defaultValue: unknown) {
    if (process.env[variableName]) {
        return process.env[variableName];
    };

    const configStr = readDocumentWithDefaults(getDataDirectoryPath(), 'config.json', '{}');
    const config = JSON.parse(configStr);

    if (!config[variableName]) {
        config[variableName] = defaultValue;
        writeDocument(getDataDirectoryPath(), 'config.json', JSON.stringify(config));
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

    const configStr = readDocumentWithDefaults(getDataDirectoryPath(), 'config.json', '{}');
    const config = JSON.parse(configStr);
    
    return config[variableName];
}