/**
 * Utility script for various functions that gets data from ui elements
 */

import { generateStoryObject } from './storyObject.js';

const divEditorContent = document.getElementById('div-editor-content') as HTMLDivElement;

const inputStoryName = document.getElementById('input-story-name') as HTMLInputElement;
const divEditorDesc = document.getElementById('div-editor-desc') as HTMLDivElement;
const inputStoryTags = document.getElementById('input-story-tags') as HTMLInputElement;

const inputLlmEndpointUrl = document.getElementById('input-llm-endpoint-uri') as HTMLInputElement;

/**
 * Get uri for ai endpoint
 * @returns {string}
 */
export function getLlmUri() {
    return inputLlmEndpointUrl.value;
}

export function getStoryText() {
    return divEditorContent.innerText;
}

/**
 * 
 * @param {string} text 
 */
export function setStoryText(text: string) {
    divEditorContent.innerHTML = text.split('\n').reduce((previous, current) => previous += `<div>${current}</div>`, '');
}

export function fixStoryText() {
    setStoryText(getStoryText());
}

/**
 * 
 * @param {string} text 
 */
export function appendToStoryText(text: string) {
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

export function generateStoryObjectFromGui() {
    const storyTitle = inputStoryName.value || 'Untitled Story';
    const storyContent = getStoryText();
    const storyDesc = divEditorDesc.innerText;
    const storyTags = inputStoryTags.value.split(new RegExp('\\s*,\\s*')).filter(str => str.length > 0);

    return generateStoryObject(
        storyTitle,
        storyContent,
        storyDesc,
        storyTags
    );
}

export function whenFinishWriting(domElement: HTMLElement, callback: () => void) {
    whenFinishWritingMultiLine(domElement, callback);

    domElement.addEventListener('keypress', ev => {
        if (ev.key === 'Enter') {
            domElement.blur();
        }
    });
}

export function whenFinishWritingMultiLine(domElement: HTMLElement, callback: () => void) {
    domElement.addEventListener('blur', () => {
        callback();
    });
}