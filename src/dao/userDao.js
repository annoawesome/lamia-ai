import fs from 'fs';
import path from 'path';
import { getLamiaUserDirectory, dataDirectoryPath } from '../util/fsdb.js';

export function createUser(username, passwordHash) {
    return new Promise((resolve, reject) => {
        const lamiaUserDirectory = path.join(dataDirectoryPath, username);

        if (fs.existsSync(lamiaUserDirectory)) {
            reject(new Error(`User ${username} already exists`));
        }

        fs.mkdir(path.join(dataDirectoryPath, username), { recursive: true }, (err) => {
            if (err) reject(err);
            else resolve(lamiaUserDirectory);
        });
    }).then(dataPath => fs.writeFileSync(path.join(dataPath, '/userdata'), JSON.stringify({
            username: username,
            passwordHash: passwordHash
        })));
}

function getUserMetadata(username) {
    return getLamiaUserDirectory(username)
        .then(dataPath => {
            return fs.readFileSync(path.join(dataPath, '/userdata'), {
                encoding: 'utf8'
            });
        });
}

export const userDao = {
    createUser: createUser,
    getUserMetadata: getUserMetadata,
};