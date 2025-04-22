import fs from 'fs';
import path from 'path';
import process from 'process';

export const userDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");

/**
 * 
 * @param {string} dataPath Path of store
 * @param {string} name Name of key
 * @returns {Promise<string | Error>}
 */
export function getKeyValueStore(dataPath, name) {
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
 * 
 * @param {string} dataPath Path of store
 * @param {string} name Name of key
 * @returns {Promise<string | Error>}
 */
export function createKeyValueStore(dataPath, name) {
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
 * 
 * @param {string} dataPath Path of store
 * @param {string} name Name of key
 * @param {string} contents Contents of document
 */
export function writeDocument(dataPath, name, contents) {
    fs.writeFileSync(path.join(dataPath, name), contents, { encoding: 'utf-8' });
}

/**
 * 
 * @param {string} dataPath Path of store
 * @param {string} name Name of key
 * @returns {string}
 */
export function getDocument(dataPath, name) {
    return fs.readFileSync(path.join(dataPath, name), { encoding: 'utf-8' });
}

/**
 * 
 * @param {string} dataPath Path of store
 * @param {string} name Name of key
 * @param {string} defaultContents Default contents if no document is found
 * @returns {string}
 */
export function getDocumentWithDefaults(dataPath, name, defaultContents) {
    const configPath = path.join(dataPath, name);
    let contents = defaultContents;

    if (!fs.existsSync(configPath)) {
        writeDocument(dataPath, name, defaultContents);
    } else {
        contents = getDocument(dataPath, name);
    }

    return contents;
}