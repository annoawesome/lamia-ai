import { homeState } from './globalHomeState.js';
import { emit, newEvent } from '../events.js';
import { generateEmptyStoryObject, StoryObject } from './storyObject.js';
import { StoryIndex } from './homeState.js';
import { appendToStoryText, fixStoryText, generateStoryObjectFromGui, getLlmUri, getStoryText, setStoryText, whenFinishWriting } from './homeViewUtil.js';

const btnNewStory = document.getElementById('btn-new-story') as HTMLButtonElement;
const panelSubStoryIndex = document.getElementById('panel-sub-story-index') as HTMLDivElement;
const divEditorContent = document.getElementById('div-editor-content') as HTMLDivElement;

const inputStoryName = document.getElementById('input-story-name') as HTMLInputElement;
const btnDeleteStory = document.getElementById('btn-delete-story') as HTMLButtonElement;

const divEditorDesc = document.getElementById('div-editor-desc') as HTMLDivElement;
const inputStoryTags = document.getElementById('input-story-tags') as HTMLInputElement;

const pWordCount = document.getElementById('p-word-count') as HTMLParagraphElement;
const pCharacterCount = document.getElementById('p-character-count') as HTMLParagraphElement;

const inputLlmEndpointUrl = document.getElementById('input-llm-endpoint-uri') as HTMLInputElement;
const pLlmModelName = document.getElementById('p-llm-model-name') as HTMLParagraphElement;
const btnAiGenerateMore = document.getElementById('btn-ai-generate-more') as HTMLButtonElement;

export const storyInput = newEvent();
export const indexInput = newEvent();
export const llmInput = newEvent();

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

function requestSetLlmInputUri() {
    emit(llmInput, 'setEndpoint', getLlmUri());
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

    for (const storyDataEntry of Object.entries(obtainedIndex.stories)) {
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

export function setModelName(modelName: string) {
    pLlmModelName.innerText = `Model: ${modelName}`;
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
        pCharacterCount.innerText = `${getStoryText().length} characters`;
    }, 1000);

    whenFinishWriting(divEditorDesc, () => forceRequestSaveCurrentStory(homeState.currentId.get()));
    whenFinishWriting(inputStoryTags, () => forceRequestSaveCurrentStory(homeState.currentId.get()));

    whenFinishWriting(inputLlmEndpointUrl, () => requestSetLlmInputUri());

    requestUpdateStoryIndexGui();
}