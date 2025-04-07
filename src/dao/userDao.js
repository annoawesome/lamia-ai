import fs from 'fs';
import path from 'path';
import process from 'process';

const userDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
const dataDirectoryPath = path.join(userDataPath, 'Lamia AI Server');

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
    return new Promise((resolve, reject) => {
        const lamiaUserDirectory = path.join(dataDirectoryPath, username);

        if (!fs.existsSync(lamiaUserDirectory)) {
            reject(new Error(`User not found`));
        }

        resolve(lamiaUserDirectory);
    })
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