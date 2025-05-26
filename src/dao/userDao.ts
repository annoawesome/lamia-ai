import fs from 'fs';
import path from 'path';
import { getLamiaUserDirectory, dataDirectoryPath } from '../service/lamiadbService.js';
import { makeFailure } from '../util/failure.js';

function createUserDirectory(username: string) {
    return new Promise((resolve, reject) => {
        const lamiaUserDirectory = path.join(dataDirectoryPath, username);

        if (fs.existsSync(lamiaUserDirectory)) {
            reject(makeFailure(null, 409, `user-already-exists`, `User "${username}" already exists`));
        }
    
        fs.mkdir(path.join(dataDirectoryPath, username), { recursive: true }, (err) => {
            if (err) reject(makeFailure(err, 500, 'internal-error', 'Internal server error'));
            else resolve(lamiaUserDirectory);
        });
    });
}

async function createUser(username: string, passwordHash: string) {
    const dataPath = await createUserDirectory(username);

    if (typeof(dataPath) !== 'string') {
        return false;
    }

    fs.writeFileSync(path.join(dataPath, '/userdata'), JSON.stringify({
        username: username,
        passwordHash: passwordHash
    }));

    return true;
}

async function getUserMetadata(username: string) {
    try {
        const dataPath = await getLamiaUserDirectory(username);
        
        // should never happen, error gets caught and the catch block is ran
        if (typeof(dataPath) !== 'string') {
            return false;
        }

        return fs.readFileSync(path.join(dataPath, '/userdata'), {
            encoding: 'utf-8',
        });
    } catch (e) {
        return false;
    }
}

export const userDao = {
    createUser: createUser,
    getUserMetadata: getUserMetadata,
};