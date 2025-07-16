import fs from 'fs';
import path from 'path';
import { getLamiaUserDirectory, getDataDirectoryPath } from '../service/lamiadbService.js';
import { makeFailure } from '../util/failure.js';

function isValidUsername(str: string) {
    return /^[A-Za-z0-9_]+$/.test(str);
}

function createUserDirectory(username: string) {
    return new Promise((resolve, reject) => {
        const lamiaUserDirectory = path.join(getDataDirectoryPath(), username);

        if (username.length < 4 || username.length > 48) {
            reject(makeFailure(null, 400, `bad-length-username`, `Username must be between 4 and 48 characters long`));
        }

        if (!isValidUsername(username)) {
            reject(makeFailure(null, 400, `malformed-username`, `Username must contain only alphanumeric characters`));
        }

        if (fs.existsSync(lamiaUserDirectory)) {
            reject(makeFailure(null, 409, `user-already-exists`, `Username was taken`));
        }
    
        fs.mkdir(lamiaUserDirectory, { recursive: true }, (err) => {
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
    } catch {
        return false;
    }
}

export const userDao = {
    createUser: createUser,
    getUserMetadata: getUserMetadata,
};