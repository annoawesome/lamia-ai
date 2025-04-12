import * as lamiaApi from './lamiaApi.js';

const btnNewStory = document.getElementById('btn-new-story');
const panelSubStoryIndex = document.getElementById('panel-sub-story-index');
const textareaContent = document.getElementById('textarea-content');

const inputStoryName = document.getElementById('input-story-name');
const btnDeleteStory = document.getElementById('btn-delete-story');

const storyObjectVersion = '0.1.0';

let lastSeenText = '';
let currentId = '';
let index = {};

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

function pushStoryToIndexObject(index, storyName, storyId) {
    index.stories[storyId] = {
        storyName: storyName,
    };
}

function generateStoryObject(version, title, content) {
    return {
        metadata: {
            version: version,
        },

        title: title,
        content: content,
    };
}

function updateStoryIndex(index, storyName, storyId) {
    const pStoryName = document.getElementById(`index-story-name-${storyId}`);

    if (pStoryName) {
        pStoryName.innerText = storyName;
    }

    pushStoryToIndexObject(index, storyName, storyId);
    lamiaApi.postIndex(index);
}

function removeStoryFromIndex(index, storyId) {
    const pStoryName = document.getElementById(`index-story-name-${storyId}`);

    if (pStoryName) {
        pStoryName.outerHTML = '';
    }

    delete index.stories[storyId];
    lamiaApi.postIndex(index);
}

function loadStory(id) {
    lamiaApi.getStory(id)
        .then(storyObject => {
            console.log('Got story id ' + id);
            textareaContent.value = storyObject.content;
            inputStoryName.value = storyObject.title;
            lastSeenText = storyObject.content;
            currentId = id;
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
            textareaContent.value = '';
            inputStoryName.value = storyObject.title;
            lastSeenText = '';
            currentId = id;
            addNewStoryToIndexGui('Untitled Story', id);
            updateStoryIndex(index, 'Untitled Story', id);
        });
}

function saveCurrentStory() {
    let currentText = textareaContent.value;

    if (currentText === lastSeenText) {
        return;
    }

    if (currentId === '') {
        return;
    }

    lastSeenText = currentText;

    const storyObject = generateStoryObject(storyObjectVersion, inputStoryName.value, currentText);

    lamiaApi.updateStory(currentId, storyObject);
    console.log('Updated id ' + currentId);
}

function updateStoryIndexGui() {
    lamiaApi.getIndex()
        .then((obtainedIndex) => {
            index = obtainedIndex;
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
                textareaContent.value = '';
                inputStoryName.value = '';
                lastSeenText = '';
                currentId = '';
                // remove story from index
                removeStoryFromIndex(index, storyId);
            }
        })
        .then(() => console.log(`Deleted story ${storyId}`));
}

// TODO: possible race condition?
// older version? call index updaters
lamiaApi.getIndex().then(obtainedIndex => index = obtainedIndex);

btnNewStory.onclick = createNewStory;
document.getElementById('btn-ai-generate-more').onclick = () => generateMoreStory();
inputStoryName.addEventListener('blur', () => updateStoryIndex(index, inputStoryName.value, currentId));
inputStoryName.addEventListener('keypress', (ev) => {
    if (ev.key === 'Enter') {
        updateStoryIndex(index, inputStoryName.value, currentId);
        inputStoryName.blur();
    }
});
btnDeleteStory.onclick = () => deleteStoryPermanently(currentId);
setInterval(saveCurrentStory, 5000);
setInterval(() => {
    document.getElementById('p-word-count').innerText = `${getWordCount(textareaContent.value)} words`;
    document.getElementById('p-character-count').innerText = `${getCharacterCount(textareaContent.value)} characters`;
}, 1000);

updateStoryIndexGui();