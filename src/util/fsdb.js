import fs from 'fs';
import path from 'path';
import process from 'process';

export const userDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
export const dataDirectoryPath = path.join(userDataPath, 'Lamia AI Server');

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