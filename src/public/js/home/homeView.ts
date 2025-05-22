import { homeState } from './globalHomeState.js';
import { emit, newEvent } from '../events.js';
import { generateEmptyStoryObject, generateStoryObject, StoryObject, storyObjectVersion } from './storyObject.js';
import { StoryIndex } from './homeState.js';

const btnNewStory = document.getElementById('btn-new-story') as HTMLButtonElement;
const panelSubStoryIndex = document.getElementById('panel-sub-story-index') as HTMLDivElement;
const divEditorContent = document.getElementById('div-editor-content') as HTMLDivElement;

const inputStoryName = document.getElementById('input-story-name') as HTMLInputElement;
const btnDeleteStory = document.getElementById('btn-delete-story') as HTMLButtonElement;

const divEditorDesc = document.getElementById('div-editor-desc') as HTMLDivElement;
const inputStoryTags = document.getElementById('input-story-tags') as HTMLInputElement;

const pWordCount = document.getElementById('p-word-count') as HTMLParagraphElement;
const pCharacterCount = document.getElementById('p-character-count') as HTMLParagraphElement;

const inputAiEndpointUrl = document.getElementById('input-ai-endpoint-uri') as HTMLInputElement;
const btnAiGenerateMore = document.getElementById('btn-ai-generate-more') as HTMLButtonElement;

export const storyInput = newEvent();
export const indexInput = newEvent();
export const llmInput = newEvent();

/**
 * Get uri for ai endpoint
 * @returns {string}
 */
function getLlmUri() {
    return inputAiEndpointUrl.value;
}

function getStoryText() {
    return divEditorContent.innerText;
}

/**
 * 
 * @param {string} text 
 */
function setStoryText(text: string) {
    divEditorContent.innerHTML = text.split('\n').reduce((previous, current) => previous += `<div>${current}</div>`, '');
}

function fixStoryText() {
    setStoryText(getStoryText());
}

/**
 * 
 * @param {string} text 
 */
function appendToStoryText(text: string) {
    const splitText = text.split('\n');

    // NOTE: div element assumption may not hold
    const innerDivElement = divEditorContent.children[divEditorContent.children.length - 1] as HTMLDivElement;
    innerDivElement.innerText += splitText[0];

    if (splitText.length > 1) {
        for (let i = 1; i < splitText.length; i++) {
            const divTextChunk = document.createElement('div');
            divTextChunk.textContent = splitText[i];
            divEditorContent.append(divTextChunk);
        }
    }
}

async function requestLlmGenerate() {
    const text = getStoryText();
    const url = getLlmUri();

    fixStoryText();

    emit(llmInput, 'generate', text, url);
}

/**
 * Append text to story. Trigger on generation finish.
 * @param {string} text The generated text to append.
 */
export function onGenerateStory(text: string) {
    fixStoryText();
    appendToStoryText(text);
}

export function onSseStreamedGenerateStory(textChunk: string) {
    appendToStoryText(textChunk);
}

// update story data stuff

/**
 * Get the word count of text.
 * @param {string} text The text to count words from.
 * @returns {number}
 */
function getWordCount(text: string) {
    return text.split(new RegExp("\\s+")).filter(word => word.length > 0).length;
}

/**
 * Get the character count of text.
 * @param {string} text The text to count characters from.
 * @returns {number}
 */
function getCharacterCount(text: string) {
    return text.length;
}

function generateStoryObjectFromGui() {
    const storyTitle = inputStoryName.value;
    const storyContent = getStoryText();
    const storyDesc = divEditorDesc.innerText;
    const storyTags = inputStoryTags.value.split(new RegExp('\\s*,\\s*')).filter(str => str.length > 0);

    return generateStoryObject(
        storyObjectVersion,
        storyTitle,
        storyContent,
        storyDesc,
        storyTags
    );
}

function whenFinishWriting(domElement: HTMLElement, callback: () => void) {
    domElement.addEventListener('blur', () => {
        callback();
    });

    domElement.addEventListener('keypress', ev => {
        if (ev.key === 'Enter') {
            domElement.blur();
        }
    });
}



// update ui

/**
 * Update story textarea and title input.
 * @param {string} storyName Title of story.
 * @param {string} storyContent Contents of story.
 */
function loadStoryFromEvent(storyObject: StoryObject) {
    const overview = storyObject.overview;

    setStoryText(storyObject.content);
    inputStoryName.value = storyObject.title;
    divEditorDesc.innerText = overview.description;
    inputStoryTags.value = overview.tags.toString().replaceAll(',', ', ');
}

/**
 * Adds the story to the left panel where user can load it.
 * @param {string} name Title of story.
 * @param {string} storyId Id of story.
 */
function addNewStoryToIndexGui(name: string, storyId: string) {
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
function removeStoryInIndexGui(storyId: string) {
    const pStoryName = document.getElementById(`index-story-name-${storyId}`);

    if (pStoryName) {
        pStoryName.outerHTML = '';
    }
}

/**
 * Update story in index GUI.
 * @param {string} storyId Id of story.
 */
function updateStoryInIndexGui(storyId: string, storyName: string) {
    const pStoryName = document.getElementById(`index-story-name-${storyId}`);

    if (pStoryName) {
        pStoryName.innerText = storyName;
    }
}

function getUpdatedStoryContent() {
    const currentText = getStoryText();
    const currentId = homeState.currentId.get();

    const updatedStoryContent = {
        updated: false,
        storyId: currentId,
        updatedText: currentText,
    };

    if (currentText === homeState.lastSeenText.get()) {
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
function requestUpdateStoryIndex(storyName: string, storyId: string) {
    updateStoryInIndexGui(storyId, storyName);
    emit(indexInput, 'update', storyName, storyId);
}

function requestSaveCurrentStory() {
    const updatedStoryContent = getUpdatedStoryContent();

    if (!updatedStoryContent.updated) return;

    forceRequestSaveCurrentStory(updatedStoryContent.storyId);
}

function forceRequestSaveCurrentStory(storyId: string) {
    emit(storyInput, 'save', generateStoryObjectFromGui(), storyId);
}

function requestDeleteStoryPermanently(storyId: string) {
    emit(storyInput, 'delete', storyId);
}

function requestUpdateStoryIndexGui() {
    emit(indexInput, 'get');
}

/**
 * Update story textarea and title input. Trigger on event.
 * @param {StoryObject} storyObject Object representation of a story.
 */
export function onLoadStory(storyObject: StoryObject) {
    loadStoryFromEvent(storyObject);
}

/**
 * Update story textarea, title input, index gui, and request story index update. Trigger on event.
 * @param {storyObject} storyObject Object representation of story.
 * @param {string} storyId Id of story.
 */
export function onCreateNewStory(storyObject: StoryObject, storyId: string) {
    loadStoryFromEvent(storyObject);
    addNewStoryToIndexGui('Untitled Story', storyId);
    requestUpdateStoryIndex('Untitled Story', storyId);
}

/**
 * Update left panel story index. Trigger on event.
 * @param {Object} obtainedIndex Index obtained from database.
 */
export function onGetStoryIndex(obtainedIndex: StoryIndex) {
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
export function onDelete(storyId: string) {
    loadStoryFromEvent(generateEmptyStoryObject());
    removeStoryInIndexGui(storyId);
}

// TODO: move to main home.js
export function init() {
    btnNewStory.onclick = requestCreateNewStory;
    btnAiGenerateMore.onclick = () => requestLlmGenerate();

    divEditorContent.addEventListener('blur', () => {
        fixStoryText();
    });

    whenFinishWriting(inputStoryName, () => requestUpdateStoryIndex(inputStoryName.value, homeState.currentId.get()));
    btnDeleteStory.onclick = () => requestDeleteStoryPermanently(homeState.currentId.get());
    setInterval(requestSaveCurrentStory, 5000);
    setInterval(() => {
        pWordCount.innerText = `${getWordCount(getStoryText())} words`;
        pCharacterCount.innerText = `${getCharacterCount(getStoryText())} characters`;
    }, 1000);

    whenFinishWriting(divEditorDesc, () => forceRequestSaveCurrentStory(homeState.currentId.get()));
    whenFinishWriting(inputStoryTags, () => forceRequestSaveCurrentStory(homeState.currentId.get()));

    requestUpdateStoryIndexGui();
}