import { emit, newEvent } from "../events.js";
import { homeState } from "./globalHomeState.js";
import { getHomeIndex, putStoryInIndex, removeStoryInIndex, setCurrentId, setHomeIndex, setLastSeenText } from "./homeState.js";

import * as lamiaApi from '../lamiaApi.js';
import * as koboldCppApi from '../koboldCppApi.js';

export const storyOutput = newEvent();
export const indexOutput = newEvent();
export const llmOutput = newEvent();

const storyObjectVersion = '0.1.0';

/**
 * @typedef {Object} StoryObject
 */

/**
 * Generates a json representation of a story.
 * @param {string} version Data type version.
 * @param {string} title Title of story.
 * @param {string} content Content of story.
 * @returns {StoryObject}
 */
function generateStoryObject(version, title, content) {
    return {
        metadata: {
            version: version,
        },

        title: title,
        content: content,
    };
}

/**
 * Update global state last seen text.
 * @param {string} updatedText Updated text.
 */
export function updateStoryLastSeenText(updatedText) {
    setLastSeenText(homeState, updatedText);
}

export function getStoryIndex() {
    lamiaApi.getIndex()
        .then(obtainedIndex => {
            setHomeIndex(homeState, obtainedIndex);
            emit(indexOutput, 'get', obtainedIndex);
        });
}

export function obtainStoryIndex() {
    lamiaApi.getIndex().then(obtainedIndex => setHomeIndex(homeState, obtainedIndex));
}

/**
 * Update story index in database.
 * @param {string} storyName Title of story.
 * @param {string} storyId Id of story.
 */
export function updateStoryIndex(storyName, storyId) {
    putStoryInIndex(homeState, storyName, storyId);
    lamiaApi.postIndex(getHomeIndex(homeState))
        .then(() => emit(indexOutput, 'update'));
}

export function createNewStory() {
    const storyObject = generateStoryObject(storyObjectVersion, 'Untitled Story', '');

    lamiaApi.createStory(storyObject)
        .then(storyId => {
            console.log('Created story id ' + storyId);
            updateStoryIndex('Untitled Story', storyId);

            setCurrentId(homeState, storyId);
            setLastSeenText(homeState, storyObject.content);
            emit(storyOutput, 'create', storyObject, storyId);
        });
}

/**
 * Load story from databse with id.
 * @param {string} storyId Id of story.
 */
export function loadStory(storyId) {
    lamiaApi.getStory(storyId)
        .then(storyObject => {
            console.log('Got story id ' + storyId);
            setCurrentId(homeState, storyId);
            setLastSeenText(homeState, storyObject.content);
            emit(storyOutput, 'load', storyObject, storyId);
        });
}

/**
 * Save story to database.
 * @param {string} storyId Id of story.
 * @param {string} storyName Title of story.
 * @param {string} storyContent Content of story.
 */
export function saveStory(storyId, storyName, storyContent) {
     const storyObject = generateStoryObject(storyObjectVersion, storyName, storyContent);
    
    lamiaApi.updateStory(storyId, storyObject)
        .then(() => {
            console.log('Updated id ' + storyId);
        });
}

/**
 * Delete story from database.
 * @param {string} storyId Id of story.
 */
export function deleteStory(storyId) {
     lamiaApi.deleteStory(storyId)
        .then(status => {
            if (status === 200) {
                setCurrentId(homeState, '');
                setLastSeenText(homeState, '');
                removeStoryInIndex(homeState, storyId);
                lamiaApi.postIndex(getHomeIndex(homeState));
                emit(storyOutput, 'delete', storyId);
            }
        });
}

/**
 * Send request to llm to continue the story.
 * @param {string} text Prompt to give to the llm.
 * @param {string} url The url to send the request to.
 */
export function generateStory(text, url) {
    koboldCppApi.postRequestGenerate(text, url)
        .then(json => {
            emit(llmOutput, 'generate', json.results[0].text);
        });
}