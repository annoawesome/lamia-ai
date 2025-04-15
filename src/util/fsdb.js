import fs from 'fs';
import path from 'path';
import process from 'process';
import crypto from 'crypto';

export const userDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
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

export function getLamiaUserDirectory(username) {
    return new Promise((resolve, reject) => {
        const lamiaUserDirectory = path.join(dataDirectoryPath, username);

        if (fs.existsSync(lamiaUserDirectory)) {
            resolve(lamiaUserDirectory);
        } else {
            reject(new Error(`User ${username} does not exist`));
        }
    });
}

export function createLamiaUserDirectory(username) {
    return new Promise((resolve, reject) => {
        const lamiaUserDirectory = path.join(dataDirectoryPath, username);

        if (fs.existsSync(lamiaUserDirectory)) {
            reject(new Error(`User ${username} already exists`));
        }

        fs.mkdir(path.join(dataDirectoryPath, username), { recursive: true }, (err) => {
            if (err) reject(err);
            else resolve(lamiaUserDirectory);
        });
    });
}

/**
 * Generate and get config file if .env is not available.
 * @returns {Object}
 */
export async function getConfig() {
    const configPath = path.join(dataDirectoryPath, 'config.json');
    let configJson = config;

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(configJson));
    } else {
        const configStr = fs.readFileSync(path.join(dataDirectoryPath, 'config.json'), { encoding: 'utf-8' });
        configJson = JSON.parse(configStr);
    }

    config = configJson;
    return configJson;
}

/**
 * Get environment variable from .env or config file
 * @param {string} variableName Name of variable
 */
export function getEnvVar(variableName) {
    if (process.env[variableName]) return process.env[variableName];
    else return config.env[variableName];
}