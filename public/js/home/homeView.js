import { getCurrentId, getLastSeenText } from './homeState.js';
import { homeState } from './globalHomeState.js';
import { emit, newEvent } from '../events.js';

const btnNewStory = document.getElementById('btn-new-story');
const panelSubStoryIndex = document.getElementById('panel-sub-story-index');
const textareaContent = document.getElementById('textarea-content');

const inputStoryName = document.getElementById('input-story-name');
const btnDeleteStory = document.getElementById('btn-delete-story');

export const storyInput = newEvent();
export const indexInput = newEvent();
export const llmInput = newEvent();

/**
 * Get uri for ai endpoint
 * @returns {string}
 */
function getLlmUri() {
    return document.getElementById('input-ai-endpoint-uri').value;
}

async function requestLlmGenerate() {
    const text = textareaContent.value;
    const url = getLlmUri();

    emit(llmInput, 'generate', text, url);
}

/**
 * Append text to story. Trigger on generation finish.
 * @param {string} text The generated text to append.
 */
export function onGenerateStory(text) {
    textareaContent.value += text;
}

// update story data stuff

/**
 * Get the word count of text.
 * @param {string} text The text to count words from.
 * @returns {number}
 */
function getWordCount(text) {
    return text.split(new RegExp("\\s+")).filter(word => word.length > 0).length;
}

/**
 * Get the character count of text.
 * @param {string} text The text to count characters from.
 * @returns {number}
 */
function getCharacterCount(text) {
    return text.length;
}

// update ui

/**
 * Update story textarea and title input.
 * @param {string} storyName Title of story.
 * @param {string} storyContent Contents of story.
 */
function loadStoryFromEvent(storyName, storyContent) {
    textareaContent.value = storyContent;
    inputStoryName.value = storyName;
}

/**
 * Adds the story to the left panel where user can load it.
 * @param {string} name Title of story.
 * @param {string} storyId Id of story.
 */
function addNewStoryToIndexGui(name, storyId) {
    const storySelectButton = document.createElement('button');
    storySelectButton.className = 'btn btn-story-select';
    storySelectButton.type = 'button';
    storySelectButton.onclick = () => {emit(storyInput, 'load', storyId);};
    storySelectButton.innerHTML = `<p class="p-story-name" id="index-story-name-${storyId}">${name.substring(0, 15)}</p>`;

    panelSubStoryIndex.append(storySelectButton);
}

/**
 * Remove story from index GUI. Connected to event.
 * @param {string} storyId Id of story.
 */
function removeStoryInIndexGui(storyId) {
    const pStoryName = document.getElementById(`index-story-name-${storyId}`);

    if (pStoryName) {
        pStoryName.outerHTML = '';
    }
}

/**
 * Update story in index GUI.
 * @param {string} storyId Id of story.
 */
function updateStoryInIndexGui(storyId, storyName) {
    const pStoryName = document.getElementById(`index-story-name-${storyId}`);

    if (pStoryName) {
        pStoryName.innerText = storyName;
    }
}

function getUpdatedStoryContent() {
    const currentText = textareaContent.value;
    const currentId = getCurrentId(homeState);

    const updatedStoryContent = {
        updated: false,
        storyId: currentId,
        updatedText: currentText,
    };

    if (currentText === getLastSeenText(homeState)) {
        return updatedStoryContent;
    }

    if (currentId === '') {
        return updatedStoryContent;
    }

    updatedStoryContent.updated = true;
    return updatedStoryContent;
}

function requestCreateNewStory() {
    emit(storyInput, 'create');
}

/**
 * Request controller to update story index. Updates index gui beforehand for smoothness.
 * @param {string} storyName Title of story.
 * @param {string} storyId Id of story.
 */
function requestUpdateStoryIndex(storyName, storyId) {
    updateStoryInIndexGui(storyId, storyName);
    emit(indexInput, 'update', storyName, storyId);
}

function requestSaveCurrentStory() {
    const updatedStoryContent = getUpdatedStoryContent();

    if (!updatedStoryContent.updated) return;

    emit(storyInput, 'save', updatedStoryContent.storyId, inputStoryName.value, updatedStoryContent.updatedText);
}

function requestDeleteStoryPermanently(storyId) {
    emit(storyInput, 'delete', storyId);
}

function requestUpdateStoryIndexGui() {
    emit(indexInput, 'get');
}

/**
 * Update story textarea and title input. Trigger on event.
 * @param {StoryObject} storyObject Object representation of a story.
 */
export function onLoadStory(storyObject) {
    loadStoryFromEvent(storyObject.title, storyObject.content);
}

/**
 * Update story textarea, title input, index gui, and request story index update. Trigger on event.
 * @param {storyObject} storyObject Object representation of story.
 * @param {string} storyId Id of story.
 */
export function onCreateNewStory(storyObject, storyId) {
    loadStoryFromEvent(storyObject.title, storyObject.content);
    addNewStoryToIndexGui('Untitled Story', storyId);
    requestUpdateStoryIndex('Untitled Story', storyId);
}

/**
 * Update left panel story index. Trigger on event.
 * @param {Object} obtainedIndex Index obtained from database.
 */
export function onGetStoryIndex(obtainedIndex) {
    panelSubStoryIndex.textContent = '';

    for (let storyDataEntry of Object.entries(obtainedIndex.stories)) {
        const storyId = storyDataEntry[0];
        const storyData = storyDataEntry[1];

        addNewStoryToIndexGui(storyData.storyName, storyId);
    }
}

/**
 * Remove story from index gui and clear story content. Trigger on event.
 * @param {string} storyId Id of story.
 */
export function onDelete(storyId) {
    loadStoryFromEvent('', '');
    removeStoryInIndexGui(storyId);
}

// TODO: move to main home.js
export function init() {
    btnNewStory.onclick = requestCreateNewStory;
    document.getElementById('btn-ai-generate-more').onclick = () => requestLlmGenerate();
    inputStoryName.addEventListener('blur', () => requestUpdateStoryIndex(inputStoryName.value, getCurrentId(homeState)));
    inputStoryName.addEventListener('keypress', (ev) => {
        if (ev.key === 'Enter') {
            requestUpdateStoryIndex(inputStoryName.value, getCurrentId(homeState));
            inputStoryName.blur();
        }
    });
    btnDeleteStory.onclick = () => requestDeleteStoryPermanently(getCurrentId(homeState));
    setInterval(requestSaveCurrentStory, 5000);
    setInterval(() => {
        document.getElementById('p-word-count').innerText = `${getWordCount(textareaContent.value)} words`;
        document.getElementById('p-character-count').innerText = `${getCharacterCount(textareaContent.value)} characters`;
    }, 1000);

    requestUpdateStoryIndexGui();
}