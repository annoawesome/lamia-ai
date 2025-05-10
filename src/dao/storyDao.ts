import crypto from 'crypto';
import { getLamiaUserDirectory } from '../service/lamiadbService.js';
import { expectKeyValueStore, readDocument, readDocumentWithDefaults, readKeyValueStore, removeDocument, writeDocument } from '../util/fsdb.js';

function getStoriesDirectory(dataPath: string) {
    return expectKeyValueStore(dataPath, 'story');
}

async function getStory(username: string, storyId: string) {
    const userDirectory = await getLamiaUserDirectory(username);

    if (typeof(userDirectory) !== 'string') {
        return;
    }

    return readDocument(getStoriesDirectory(userDirectory), storyId)
}

async function createStory(username: string, data: string) {
    const uuid = crypto.randomUUID();
    const userDirectory = await getLamiaUserDirectory(username);

    if (typeof(userDirectory) !== 'string') {
        return;
    }

    writeDocument(getStoriesDirectory(userDirectory), uuid, data);

    return uuid;
}

async function modifyStory(username: string, storyId: string, data: string) {
    const userDirectory = await getLamiaUserDirectory(username);

    if (typeof(userDirectory) !== 'string') {
        return;
    }

    writeDocument(getStoriesDirectory(userDirectory), storyId, data);
}

async function deleteStory(username: string, storyId: string) {
    const userDirectory = await getLamiaUserDirectory(username);

    if (typeof(userDirectory) !== 'string') {
        return;
    }

    removeDocument(getStoriesDirectory(userDirectory), storyId)
}

async function getStoryIds(username: string) {
    const userDirectory = await getLamiaUserDirectory(username);

    if (typeof(userDirectory) !== 'string') {
        return;
    }

    return readKeyValueStore(getStoriesDirectory(userDirectory));
}

async function getIndex(username: string) {
    const userDirectory = await getLamiaUserDirectory(username);

    if (typeof(userDirectory) !== 'string') {
        return;
    }

    return readDocumentWithDefaults(userDirectory, 'storyIndex', '{}')
}

async function writeIndex(username: string, data: string) {
    const userDirectory = await getLamiaUserDirectory(username);

    if (typeof(userDirectory) !== 'string') {
        return;
    }

    return writeDocument(userDirectory, 'storyIndex', data)
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