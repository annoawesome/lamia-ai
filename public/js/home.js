import { generateHomeState, getCurrentId, getHomeIndex, getLastSeenText, putStoryInIndex, removeStoryInIndex, setCurrentId, setHomeIndex, setLastSeenText } from './homeState.js';
import * as lamiaApi from './lamiaApi.js';

const btnNewStory = document.getElementById('btn-new-story');
const panelSubStoryIndex = document.getElementById('panel-sub-story-index');
const textareaContent = document.getElementById('textarea-content');

const inputStoryName = document.getElementById('input-story-name');
const btnDeleteStory = document.getElementById('btn-delete-story');

const storyObjectVersion = '0.1.0';

const homeState = generateHomeState();

// ai endpoint handling

function aiGetUri() {
    return document.getElementById('input-ai-endpoint-uri').value;
}

async function aiRequestGenerate() {
    console.log("Requesting ai generation");

    // koboldai api request
    const request = new Request(`${aiGetUri()}/api/v1/generate`, {
        method: 'POST',
        body: JSON.stringify({
            max_length: 128,
            prompt: textareaContent.value,
        })
    });

    const res = await fetch(request);
    const json = await res.json();

    return json;
}

function generateMoreStory() {
    aiRequestGenerate()
        .then((json) => {
            console.log(json.results[0].text);
            textareaContent.value += json.results[0].text;
        });
}

// update story data stuff

function getWordCount(text) {
    return text.split(new RegExp("\\s+")).filter(word => word.length > 0).length;
}

function getCharacterCount(text) {
    return text.length;
}

// update ui

function generateStoryObject(version, title, content) {
    return {
        metadata: {
            version: version,
        },

        title: title,
        content: content,
    };
}

function updateStoryIndex(storyName, storyId) {
    const pStoryName = document.getElementById(`index-story-name-${storyId}`);

    if (pStoryName) {
        pStoryName.innerText = storyName;
    }

    putStoryInIndex(homeState, storyName, storyId);
    lamiaApi.postIndex(getHomeIndex(homeState));
}

function removeStoryFromIndex(index, storyId) {
    const pStoryName = document.getElementById(`index-story-name-${storyId}`);

    if (pStoryName) {
        pStoryName.outerHTML = '';
    }

    lamiaApi.postIndex(index);
}

/**
 * Update the html elements and home state to match newly loaded story.
 * @param {string} storyName Title of story
 * @param {string} storyId Id of story in the database
 * @param {string} storyContent Contents of the story
 */
function updateStoryGui(storyName, storyId, storyContent) {
    textareaContent.value = storyContent;
    inputStoryName.value = storyName;
    setLastSeenText(homeState, storyContent);
    setCurrentId(homeState, storyId);
}

function loadStory(id) {
    lamiaApi.getStory(id)
        .then(storyObject => {
            console.log('Got story id ' + id);
            updateStoryGui(storyObject.title, id, storyObject.content);
        });
}

function addNewStoryToIndexGui(name, id) {
    const storySelectButton = document.createElement('button');
    storySelectButton.className = 'btn btn-story-select';
    storySelectButton.type = 'button';
    storySelectButton.onclick = () => loadStory(id);
    storySelectButton.innerHTML = `<p class="p-story-name" id="index-story-name-${id}">${name.substring(0, 15)}</p>`;

    panelSubStoryIndex.append(storySelectButton);
}

function createNewStory() {
    const storyObject = generateStoryObject(storyObjectVersion, 'Untitled Story', '');

    lamiaApi.createStory(storyObject)
        .then((id) => {
            console.log('Created story id ' + id);
            updateStoryGui(storyObject.title, id, storyObject.content);
            addNewStoryToIndexGui('Untitled Story', id);
            updateStoryIndex('Untitled Story', id);
        });
}

function saveCurrentStory() {
    let currentText = textareaContent.value;
    const currentId = getCurrentId(homeState);

    if (currentText === getLastSeenText(homeState)) {
        return;
    }

    if (currentId === '') {
        return;
    }

    setLastSeenText(homeState, currentText);

    const storyObject = generateStoryObject(storyObjectVersion, inputStoryName.value, currentText);

    lamiaApi.updateStory(currentId, storyObject);
    console.log('Updated id ' + currentId);
}

function updateStoryIndexGui() {
    lamiaApi.getIndex()
        .then((obtainedIndex) => {
            setHomeIndex(homeState, obtainedIndex);
            panelSubStoryIndex.textContent = '';

            for (let storyDataEntry of Object.entries(obtainedIndex.stories)) {
                const storyId = storyDataEntry[0];
                const storyData = storyDataEntry[1];

                addNewStoryToIndexGui(storyData.storyName, storyId);
            }
        });
}

function deleteStoryPermanently(storyId) {
    lamiaApi.deleteStory(storyId)
        .then(status => {
            if (status === 200) {
                updateStoryGui('', '', '');
                // remove story from index
                removeStoryInIndex(homeState, storyId);
                removeStoryFromIndex(getHomeIndex(homeState), storyId);
            }
        })
        .then(() => console.log(`Deleted story ${storyId}`));
}

// TODO: possible race condition?
// older version? call index updaters
lamiaApi.getIndex().then(obtainedIndex => setHomeIndex(homeState, obtainedIndex));

btnNewStory.onclick = createNewStory;
document.getElementById('btn-ai-generate-more').onclick = () => generateMoreStory();
inputStoryName.addEventListener('blur', () => updateStoryIndex(inputStoryName.value, getCurrentId(homeState)));
inputStoryName.addEventListener('keypress', (ev) => {
    if (ev.key === 'Enter') {
        updateStoryIndex(inputStoryName.value, getCurrentId(homeState));
        inputStoryName.blur();
    }
});
btnDeleteStory.onclick = () => deleteStoryPermanently(getCurrentId(homeState));
setInterval(saveCurrentStory, 5000);
setInterval(() => {
    document.getElementById('p-word-count').innerText = `${getWordCount(textareaContent.value)} words`;
    document.getElementById('p-character-count').innerText = `${getCharacterCount(textareaContent.value)} characters`;
}, 1000);

updateStoryIndexGui();