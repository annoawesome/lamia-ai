import { emit, newEvent } from "../events.js";
import { homeState } from "./globalHomeState.js";
import { putStoryInIndex, removeStoryInIndex, StoryIndex } from "./homeState.js";
import { convertStoryObject, generateStoryObject, StoryObject } from "./storyObject.js";

import * as lamiaApi from '../lamiaApi.js';
import * as koboldCppApi from '../koboldCppApi.js';
import { llmSettings } from "./storyOverviewLlm.js";

export const storyOutput = newEvent();
export const indexOutput = newEvent();
export const llmOutput = newEvent();

const storyObjectVersion = '0.2.0';


/**
 * Update global state last seen text.
 * @param {string} updatedText Updated text.
 */
export function updateStoryLastSeenText(updatedText: string) {
    homeState.lastSeenText.set(updatedText);
}

export function getStoryIndex() {
    lamiaApi.getIndex()
        .then(obtainedIndex => {
            homeState.index.set(obtainedIndex);
            emit(indexOutput, 'get', obtainedIndex);
        });
}

export function obtainStoryIndex() {
    lamiaApi.getIndex().then(obtainedIndex => homeState.index.set(obtainedIndex));
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

export function createNewStory() {
    const storyObject = generateStoryObject(storyObjectVersion, 'Untitled Story', '', '', []);

    lamiaApi.createStory(storyObject)
        .then(storyId => {
            console.log('Created story id ' + storyId);
            updateStoryIndex('Untitled Story', storyId);

            homeState.currentId.set(storyId);
            homeState.lastSeenText.set(storyObject.content);
            emit(storyOutput, 'create', storyObject, storyId);
        });
}

/**
 * Load story from databse with id.
 * @param {string} storyId Id of story.
 */
export function loadStory(storyId: string) {
    lamiaApi.getStory(storyId)
        .then(storyObject => {
            storyObject = convertStoryObject(storyObject);
            console.log('Got story id ' + storyId);
            homeState.currentId.set(storyId);
            homeState.lastSeenText.set(storyObject.content);
            emit(storyOutput, 'load', storyObject, storyId);
        });
}

/**
 * Save story to database.
 * @param {string} storyId Id of story.
 * @param {string} storyName Title of story.
 * @param {string} storyContent Content of story.
 */
export function saveStory(storyObject: StoryObject, storyId: string) {
    lamiaApi.updateStory(storyId, storyObject)
        .then(() => {
            console.log('Updated id ' + storyId);
        });
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
                emit(storyOutput, 'delete', storyId);
            }
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
        koboldCppApi.postRequestGenerateSse(text, url, body, (data: any) => {
            if (data && data.token) {
                emit(llmOutput, 'generate.stream', data.token);
            }
        });
    } else {
        koboldCppApi.postRequestGenerate(text, url, body)
            .then(json => {
                emit(llmOutput, 'generate', json.results[0].text);
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