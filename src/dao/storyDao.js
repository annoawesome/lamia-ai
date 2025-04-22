import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getLamiaUserDirectory } from '../service/lamiadbService.js';

function getStoriesDirectory(dataPath) {
    const storiesPath = path.join(dataPath, 'story');
    fs.mkdirSync(storiesPath, { recursive: true });
    return storiesPath;
}

function getStory(username, storyId) {
    return getLamiaUserDirectory(username)
        .then(getStoriesDirectory)
        .then(storiesPath => fs.readFileSync(path.join(storiesPath, storyId), { encoding: 'utf-8' }));
}

function createStory(username, data) {
    const uuid = crypto.randomUUID();

    return getLamiaUserDirectory(username)
        .then(getStoriesDirectory)
        .then(storiesPath => fs.writeFileSync(path.join(storiesPath, uuid), data, { encoding: 'utf-8' }))
        .then(() => uuid);
}

function modifyStory(username, storyId, data) {
    return getLamiaUserDirectory(username)
        .then(getStoriesDirectory)
        .then(storiesPath => fs.writeFileSync(path.join(storiesPath, storyId), data, { encoding: 'utf-8' }))
        .then(() => storyId);
}

function deleteStory(username, storyId) {
    return getLamiaUserDirectory(username)
        .then(getStoriesDirectory)
        .then(storiesPath => fs.rmSync(path.join(storiesPath, storyId), { force: true }));
}

function getStoryIds(username) {
    return getLamiaUserDirectory(username)
        .then(getStoriesDirectory)
        .then(storiesPath => fs.readdirSync(storiesPath));
}

function getIndex(username) {
    return getLamiaUserDirectory(username)
        .then(dataPath => path.join(dataPath, 'storyIndex'))
        .then(indexPath => {
            if (fs.existsSync(indexPath)) {
                return fs.readFileSync(indexPath, { encoding: 'utf-8' });
            } else {
                return '{}';
            }
        });
}

function writeIndex(username, data) {
    return getLamiaUserDirectory(username)
        .then(dataPath => fs.writeFileSync(path.join(dataPath, 'storyIndex'), data, { encoding: 'utf-8' }));
}

export const storyDao = {
    getStory: getStory,
    createStory: createStory,
    modifyStory: modifyStory,
    getStoryIds: getStoryIds,
    getIndex: getIndex,
    writeIndex: writeIndex,
    deleteStory: deleteStory
};