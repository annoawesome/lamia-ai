import { homeState } from './globalHomeState.js';
import { emit, newEvent } from '../events.js';
import { generateEmptyStoryObject, generateStoryObject, StoryObject } from './storyObject.js';
import { StoryIndex } from './homeState.js';
import { appendToStoryText, fixStoryText, generateStoryObjectFromGui, getLlmUri, getStoryText, getStoryTitle, isValidStoryTitle, setStoryText, setStoryTitle, whenFinishWriting, whenFinishWritingMultiLine } from './homeViewUtil.js';
import { popToastNotif } from './toastNotifs.js';

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

const svgLlmWaitingIndicator = document.getElementById('llm-waiting-indicator') as HTMLOrSVGImageElement;

const btnUndo = document.getElementById('btn-undo') as HTMLButtonElement;
const btnRedo = document.getElementById('btn-redo') as HTMLButtonElement;

const pBackendInfo = document.getElementById('p-backend-info') as HTMLParagraphElement;
const btnOpenMenu = document.getElementById('btn-menu') as HTMLButtonElement;
const divMainHomeMenuPopup = document.getElementById('main-home-menu-popup') as HTMLDivElement;
const btnLogout = document.getElementById('btn-logout') as HTMLButtonElement;

export const storyInput = newEvent();
export const indexInput = newEvent();
export const llmInput = newEvent();
export const appInput = newEvent();

async function requestLlmGenerate() {
    const text = getStoryText();
    const url = getLlmUri();

    fixStoryText();

    btnAiGenerateMore.disabled = true;
    svgLlmWaitingIndicator.classList.remove('gr-hidden');
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

export function onSseStreamFinish() {
    btnAiGenerateMore.disabled = false;
    svgLlmWaitingIndicator.classList.add('gr-hidden');
    requestSaveCurrentStory();
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

    divEditorContent.contentEditable = 'true';
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

function isStoryLoaded() {
    return homeState.currentId.get() !== '';
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

    if (!isStoryLoaded()) {
        return updatedStoryContent;
    }

    if (!isValidStoryTitle(getStoryTitle())) {
        return updatedStoryContent;
    }

    updatedStoryContent.updated = true;
    return updatedStoryContent;
}

function requestCreateNewStory(protoStoryObject: StoryObject) {
    emit(storyInput, 'create', protoStoryObject);
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
    if (!isStoryLoaded()) {
        requestCreateNewStory(generateStoryObjectFromGui());
    } else {
        emit(storyInput, 'save', generateStoryObjectFromGui(), storyId);
    }
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

/* HISTORY */

function requestUndo() {
    emit(storyInput, 'history:undo');
}

function requestRedo() {
    emit(storyInput, 'history:redo');
}

/* APP */

function requestGetBackendInfo() {
    emit(appInput, 'info');
}

function requestLogout() {
    emit(appInput, 'logout');
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
    addNewStoryToIndexGui(storyObject.title, storyId);
    requestUpdateStoryIndex(storyObject.title, storyId);
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
    divEditorContent.contentEditable = 'false';
    removeStoryInIndexGui(storyId);
}

export function setModelName(modelName: string) {
    pLlmModelName.innerText = `Model: ${modelName}`;
}

/* HISTORY */

/**
 * Use for both undo/redo, or anything that needs direct editing of text
 * @param newContent 
 */
export function onRequestUpdateText(newContent: string) {
    setStoryText(newContent);
}

export function onGetBackendInfo(backendInfo: { backendName: string, version: string }) {
    pBackendInfo.innerText = `Backend: ${backendInfo.backendName} (${backendInfo.version})`;
}

export function onLogout() {
    window.location.href = '/';
}

export function onToastNotification(message: string) {
    popToastNotif(message);
}


// TODO: move to main home.js
export function init() {
    btnNewStory.onclick = () => requestCreateNewStory(generateStoryObject('Untitled Story', '', '', []));
    btnAiGenerateMore.onclick = () => requestLlmGenerate();

    divEditorContent.addEventListener('blur', () => {
        fixStoryText();
    });

    whenFinishWriting(inputStoryName, () => {
        if (!isValidStoryTitle(getStoryTitle())) {
            setStoryTitle('Untitled Story');
        }

        if (isStoryLoaded()) {
            requestUpdateStoryIndex(getStoryTitle(), homeState.currentId.get());
            forceRequestSaveCurrentStory(homeState.currentId.get());
        } else {
            requestCreateNewStory(generateStoryObjectFromGui());
        }
    });

    btnDeleteStory.onclick = () => requestDeleteStoryPermanently(homeState.currentId.get());

    whenFinishWritingMultiLine(divEditorContent, () => {
        requestSaveCurrentStory();
    });

    setInterval(() => {
        pWordCount.innerText = `${getWordCount(getStoryText())}`;
        pCharacterCount.innerText = `${getStoryText().length}`;
    }, 1000);

    whenFinishWritingMultiLine(divEditorDesc, () => {
        if (!isValidStoryTitle(getStoryTitle())){
            return;
        }

        forceRequestSaveCurrentStory(homeState.currentId.get());
    });

    whenFinishWriting(inputStoryTags, () => {
        if (!isValidStoryTitle(getStoryTitle())){
            return;
        }

        forceRequestSaveCurrentStory(homeState.currentId.get());
    });

    whenFinishWriting(inputLlmEndpointUrl, () => requestSetLlmInputUri());

    btnUndo.addEventListener('click', requestUndo);
    btnRedo.addEventListener('click', requestRedo);

    // temporary, used to test log outs
    btnOpenMenu.addEventListener('click', () => {
        const classList = divMainHomeMenuPopup.classList;
        return classList.contains('gr-hidden') ? classList.remove('gr-hidden') : classList.add('gr-hidden');
    });

    btnLogout.addEventListener('click', requestLogout);

    requestUpdateStoryIndexGui();
    requestGetBackendInfo();
}