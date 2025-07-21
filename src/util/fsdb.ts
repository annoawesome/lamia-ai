import fs from 'fs';
import path from 'path';
import { envDependentPaths, isValidPath } from './paths.js';
import { getEnvVar } from './env.js';

export function getServerDataRootPath() {
    const userDataPath = envDependentPaths.userData();
    let serverDataRootPath = getEnvVar('LAMIA_USERDATA_DIRECTORY') || userDataPath;

    if (!isValidPath(serverDataRootPath)) {
        serverDataRootPath = userDataPath;
    }

    return serverDataRootPath;
}

/**
 * 
 * @param {string} dataPath Path of store
 * @param {string} name Name of key
 * @returns {Promise<string | Error>}
 */
export function getKeyValueStore(dataPath: string, name: string): Promise<string | Error> {
    return new Promise((resolve, reject) => {
        const listingDirectory = path.join(dataPath, name);

        if (fs.existsSync(listingDirectory)) {
            resolve(listingDirectory);
        } else {
            reject(new Error(`Listing "${name}" does not exist`));
        }
    });
}

/**
 * Returns a list of all keys in key value store
 * @param {string} dataPath Path of store
 * @returns {string[]}
 */
export function readKeyValueStore(keyValueStore: string): string[] {
    return fs.readdirSync(keyValueStore);
}

/**
 * 
 * @param {string} dataPath Path of store
 * @param {string} name Name of key
 * @returns {Promise<string | Error>}
 */
export function createKeyValueStore(dataPath: string, name: string): Promise<string | Error | NodeJS.ErrnoException> {
    return new Promise((resolve, reject) => {
        const keyValueStoreDirectory = path.join(dataPath, name);

        if (fs.existsSync(keyValueStoreDirectory)) {
            reject(new Error(`Listing ${name} already exists`));
        }

        fs.mkdir(path.join(dataPath, name), { recursive: true }, (err) => {
            if (err) reject(err);
            else resolve(keyValueStoreDirectory);
        });
    });
}

/**
 * Similar to `createKeyValueStore` but recursively creates non-existent stores
 * @param {string} dataPath 
 * @param {string} name 
 * @returns {string}
 */
export function expectKeyValueStore(dataPath: string, name: string) {
    const keyValueStore = path.join(dataPath, name);
    fs.mkdirSync(keyValueStore, { recursive: true });
    return keyValueStore;
}

/**
 * 
 * @param {string} dataPath Path of store
 * @param {string} name Name of key
 * @param {string} contents Contents of document
 */
export function writeDocument(dataPath: string, name: string, contents: string) {
    fs.writeFileSync(path.join(dataPath, name), contents, { encoding: 'utf-8' });
}

/**
 * 
 * @param {string} dataPath Path of store
 * @param {string} name Name of key
 * @returns {string}
 */
export function readDocument(dataPath: string, name: string) {
    return fs.readFileSync(path.join(dataPath, name), { encoding: 'utf-8' });
}

export function removeDocument(dataPath: string, name: string) {
    fs.rmSync(path.join(dataPath, name), { force: true });
}

/**
 * 
 * @param {string} dataPath Path of store
 * @param {string} name Name of key
 * @param {string} defaultContents Default contents if no document is found
 * @returns {string}
 */
export function readDocumentWithDefaults(dataPath: string, name: string, defaultContents: string) {
    const configPath = path.join(dataPath, name);
    let contents = defaultContents;

    if (!fs.existsSync(configPath)) {
        writeDocument(dataPath, name, defaultContents);
    } else {
        contents = readDocument(dataPath, name);
    }

    return contents;
}