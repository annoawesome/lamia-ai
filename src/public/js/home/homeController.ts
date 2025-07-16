import { emit, newEvent } from "../events.js";
import { homeState } from "./globalHomeState.js";
import { putStoryInIndex, removeStoryInIndex, StoryIndex } from "./homeState.js";
import { convertStoryObject__0_1_0t0_2_0, convertStoryObject__0_2_0t0_3_0, generateDifference, redoAllStoryContent, redoStoryContent, StoryObject, syncStoryObject, undoStoryContent } from "./storyObject.js";

import * as lamiaApi from '../lamiaApi.js';
import * as koboldCppApi from '../koboldCppApi.js';
import { llmSettings } from "./storyOverviewLlm.js";

export const storyOutput = newEvent();
export const indexOutput = newEvent();
export const llmOutput = newEvent();
export const appOutput = newEvent();

/**
 * Propagates error to render.
 * @param err The error created by the failed request
 * @param resultingBehavior Behavior that is caused by the error
 */
function emitBackendError(err: Error, resultingBehavior: string) {
    const message = err.message;

    switch (message) {
        case '403':
            emit(appOutput, 'toast', `${resultingBehavior}. Authentication error. Please log in`);
            break;
        case '404':
            emit(appOutput, 'toast', `${resultingBehavior}. Server did not respond`);
            break;
        default:
            emit(appOutput, 'toast', `${resultingBehavior}. An unknown error (${message}) (either client or server) has occurred.`);
            break;
    }
}

/**
 * Updates current story object
 * @param {string} updatedText Updated text.
 */
export function updateCurrentStoryObject(updatedStoryObject: StoryObject) {
    if (!homeState.currentStoryObject) return;

    const updatedText = updatedStoryObject.content;

    if (homeState.currentStoryObject.history.pointer !== 0) {
        redoAllStoryContent(homeState.currentStoryObject);
        homeState.lastSeenText.set(homeState.currentStoryObject.content);
    }

    generateDifference(homeState.currentStoryObject, homeState.lastSeenText.get() as string, updatedText);
    syncStoryObject(homeState.currentStoryObject, updatedStoryObject);

    homeState.lastSeenText.set(updatedText);
}

export function getStoryIndex() {
    lamiaApi.getIndex()
        .then(obtainedIndex => {
            homeState.index.set(obtainedIndex);
            emit(indexOutput, 'get', obtainedIndex);
        }).catch((err: Error) => {
            emitBackendError(err, 'Failed to load stories');
        });
}

/**
 * Update story index in database.
 * @param {string} storyName Title of story.
 * @param {string} storyId Id of story.
 */
export function updateStoryIndex(storyName: string, storyId: string) {
    putStoryInIndex(homeState, storyName, storyId);

    const index = homeState.index.get() as StoryIndex;

    lamiaApi.postIndex(index)
        .then(() => emit(indexOutput, 'update'));
}

export function createNewStory(protoStoryObject: StoryObject) {
    const storyObject = protoStoryObject;
    homeState.currentStoryObject = storyObject;

    lamiaApi.createStory(storyObject)
        .then(storyId => {
            console.log('Created story id ' + storyId);
            updateStoryIndex('Untitled Story', storyId);

            homeState.currentId.set(storyId);
            homeState.lastSeenText.set(storyObject.content);
            emit(storyOutput, 'create', storyObject, storyId);
        })
        .catch((err: Error) => {
            emitBackendError(err, 'Failed to create story');
        });
}

/**
 * Load story from databse with id.
 * @param {string} storyId Id of story.
 */
export function loadStory(storyId: string) {
    lamiaApi.getStory(storyId)
        .then(storyObject => {
            storyObject = convertStoryObject__0_1_0t0_2_0(storyObject);
            storyObject = convertStoryObject__0_2_0t0_3_0(storyObject);
            
            console.log('Got story id ' + storyId);
            homeState.currentId.set(storyId);
            homeState.lastSeenText.set(storyObject.content);

            homeState.currentStoryObject = storyObject;

            emit(storyOutput, 'load', storyObject, storyId);
        })
        .catch((err: Error) => {
            emitBackendError(err, 'Failed to load story');
        });
}

/**
 * Save story to database.
 * @param {string} storyId Id of story.
 * @param {string} storyName Title of story.
 * @param {string} storyContent Content of story.
 */
export function saveStory(storyObjectSnapshot: StoryObject, storyId: string) {
    const currentStoryObject = homeState.currentStoryObject;

    if (currentStoryObject) {
        updateCurrentStoryObject(storyObjectSnapshot);

        lamiaApi.updateStory(storyId, currentStoryObject)
            .then(() => {
                console.log('Updated id ' + storyId);
            })
            .catch((err: Error) => {
                emitBackendError(err, 'Failed to save story');
            });
    }
}

/**
 * Delete story from database.
 * @param {string} storyId Id of story.
 */
export function deleteStory(storyId: string) {
     lamiaApi.deleteStory(storyId)
        .then(status => {
            if (status === 200) {
                homeState.currentId.set('');
                homeState.lastSeenText.set('');
                removeStoryInIndex(homeState, storyId);
                lamiaApi.postIndex(homeState.index.get() as StoryIndex);
                homeState.currentStoryObject = null;
                emit(storyOutput, 'delete', storyId);
            }
        })
        .catch((err: Error) => {
            emitBackendError(err, 'Failed to delete story');
        });
}

/**
 * Send request to llm to continue the story.
 * @param {string} text Prompt to give to the llm.
 * @param {string} url The url to send the request to.
 */
export function generateStory(text: string, url: string) {
    const body: koboldCppApi.KoboldCppRequestBody = {
        max_length: llmSettings.responseLength,
        max_context_length: llmSettings.contextLength,
        rep_pen: llmSettings.repetitionPenalty,
        temperature: llmSettings.temperature,
        top_k: llmSettings.topK,
        top_p: llmSettings.topP,
    };

    if (llmSettings.streamingMode === 'sse') {
        koboldCppApi.postRequestGenerateSse(text, url, body, (data) => {
            if (data && data.token) {
                emit(llmOutput, 'generate.stream', data.token);
            }
        })
        .then(() => {
            emit(llmOutput, 'generate:done');
        })
        .catch((err: Error) => {
            const message = err.message;

            if (message.startsWith('NetworkError') || message === '404') {
                emit(appOutput, 'toast', 'The LLM endpoint did not respond. Is it up and running?');
            } else {
                emit(appOutput, 'toast', 'Failed to generate text. The LLM endpoint responded with an unknown error (' + message + ')');
            }

            emit(llmOutput, 'generate:done');
        });
    } else {
        koboldCppApi.postRequestGenerate(text, url, body)
            .then(json => {
                emit(llmOutput, 'generate', json.results[0].text);
                emit(llmOutput, 'generate:done');
            })
            .catch((err: Error) => {
                const message = err.message;

                if (message.startsWith('NetworkError') || message === '404') {
                    emit(appOutput, 'toast', 'The LLM endpoint did not respond. Is it up and running?');
                } else {
                    emit(appOutput, 'toast', 'Failed to generate text. The LLM endpoint responded with an unknown error (' + message + ')');
                }

                emit(llmOutput, 'generate:done');
            });
    }
}

function isValidUrl(url: string) {
    try {
        const urlObject = new URL(url);

        return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
    } catch {
        return false;
    }
}

export function setLlmUri(uri: string) {
    llmSettings.uri = isValidUrl(uri) ? uri : 'http://localhost:5001';

    koboldCppApi.getLoadedModel(uri)
        .then(modelName => {
            emit(llmOutput, 'modelName', modelName);
        });
}

/* HISTORY */

export function performUndo() {
    const currentStoryObject = homeState.currentStoryObject;

    if (currentStoryObject) {
        undoStoryContent(currentStoryObject);
        emit(storyOutput, 'history:undo', currentStoryObject.content);
    }
}

export function performRedo() {
    const currentStoryObject = homeState.currentStoryObject;

    if (currentStoryObject) {
        redoStoryContent(currentStoryObject);
        emit(storyOutput, 'history:redo', currentStoryObject.content);
    }
}


export function getBackendInfo() {
    lamiaApi.getBackendInfo().then(backendInfo => {
        emit(appOutput, 'info', backendInfo);
    })
    .catch((err: Error) => {
        emitBackendError(err, 'Failed to get backend information');
    });
}

export function logout() {
    lamiaApi.logout()
        .then(() => {
            emit(appOutput, 'logout');
        })
        .catch((err: Error) => {
            emitBackendError(err, 'Failed to logout');
        });
}