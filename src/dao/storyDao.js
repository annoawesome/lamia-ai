import crypto from 'crypto';
import { getLamiaUserDirectory } from '../service/lamiadbService.js';
import { expectKeyValueStore, readDocument, readDocumentWithDefaults, readKeyValueStore, removeDocument, writeDocument } from '../util/fsdb.js';

function getStoriesDirectory(dataPath) {
    return expectKeyValueStore(dataPath, 'story');
}

function getStory(username, storyId) {
    return getLamiaUserDirectory(username)
        .then(getStoriesDirectory)
        .then(storiesPath => readDocument(storiesPath, storyId));
}

function createStory(username, data) {
    const uuid = crypto.randomUUID();

    return getLamiaUserDirectory(username)
        .then(getStoriesDirectory)
        .then(storiesPath => writeDocument(storiesPath, uuid, data))
        .then(() => uuid);
}

function modifyStory(username, storyId, data) {
    return getLamiaUserDirectory(username)
        .then(getStoriesDirectory)
        .then(storiesPath => writeDocument(storiesPath, storyId, data))
        .then(() => storyId);
}

function deleteStory(username, storyId) {
    return getLamiaUserDirectory(username)
        .then(getStoriesDirectory)
        .then(storiesPath => removeDocument(storiesPath, storyId));
}

function getStoryIds(username) {
    return getLamiaUserDirectory(username)
        .then(getStoriesDirectory)
        .then(storiesPath => readKeyValueStore(storiesPath));
}

function getIndex(username) {
    return getLamiaUserDirectory(username)
        .then(dataPath => readDocumentWithDefaults(dataPath, 'storyIndex', '{}'));
}

function writeIndex(username, data) {
    return getLamiaUserDirectory(username)
        .then(dataPath => writeDocument(dataPath, 'storyIndex', data));
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