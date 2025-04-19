import fs from 'fs';
import path from 'path';
import { getLamiaUserDirectory, dataDirectoryPath } from '../util/fsdb.js';
import { makeFailure } from '../util/failure.js';

export function createUser(username, passwordHash) {
    return new Promise((resolve, reject) => {
        const lamiaUserDirectory = path.join(dataDirectoryPath, username);

        if (fs.existsSync(lamiaUserDirectory)) {
            reject(makeFailure(null, 409, `user-already-exists`, `User "${username}" already exists`));
        }

        fs.mkdir(path.join(dataDirectoryPath, username), { recursive: true }, (err) => {
            if (err) reject(makeFailure(err, 500, 'internal-error', 'Internal server error'));
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