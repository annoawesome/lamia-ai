import { decrypt, encrypt, fromBase64, fromBase64ToUint8Array, generateIv, importKey, toBase64 } from "./encryption.js";

const btnNewStory = document.getElementById('btn-new-story');
const panelSubStoryIndex = document.getElementById('panel-sub-story-index');
const textareaContent = document.getElementById('textarea-content');

const inputStoryName = document.getElementById('input-story-name');
const btnDeleteStory = document.getElementById('btn-delete-story');

const storyObjectVersion = '0.1.0';

let lastSeenText = '';
let currentId = '';
let index = {};

async function generateEncryptedPayload(data) {
    const key = await importKey(sessionStorage.getItem('encryption-key'));
    const iv = generateIv();
    const encryptedData = await encrypt(key, iv, new TextEncoder().encode(data));

    const payload = {
        encryptedData64: toBase64(encryptedData),
        iv: toBase64(iv),
    };

    return payload;
}

async function decryptPayload(payload) {
    const key = await importKey(sessionStorage.getItem('encryption-key'));
    const encryptedData = fromBase64(payload.encryptedData64);
    const iv = fromBase64ToUint8Array(payload.iv);
    const encodedStoryContent = await decrypt(key, iv, encryptedData);

    return new TextDecoder().decode(encodedStoryContent);
}

async function apiCreateStory(storyObject) {
    const payload = await generateEncryptedPayload(JSON.stringify(storyObject));

    const request = new Request('/api/v1/story/content', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
        },
        body: JSON.stringify(payload)
    });

    const res = await fetch(request);
    return await res.text();
}

async function apiGetStory(storyId) {
    const request = new Request(`/api/v1/story/content/${storyId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    const res = await fetch(request);
    const payload = await res.json();
    const storyObjectStr = await decryptPayload(payload);

    return JSON.parse(storyObjectStr);
}

async function apiUpdateStory(storyId, storyObject) {
    const payload = await generateEncryptedPayload(JSON.stringify(storyObject));

    const request = new Request(`/api/v1/story/content/${storyId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
        },
        body: JSON.stringify(payload)
    });

    const res = await fetch(request);
    return await res.text();
}

// eslint-disable-next-line no-unused-vars
async function apiGetStoryIds() {
    const request = new Request(`/api/v1/story/ids`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    const res = await fetch(request);
    const list = await res.json();

    return list;
}

async function apiPostIndex(index) {
    const encryptedPayload = await generateEncryptedPayload(JSON.stringify(index));

    const request = new Request(`/api/v1/story/index`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(encryptedPayload),
    });

    return await fetch(request);
}

async function apiGetIndex() {
    const request = new Request(`/api/v1/story/index`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    const res = await fetch(request);
    const encryptedPayload = await res.json();

    if (!encryptedPayload.encryptedData64)
        return generateIndexObject();

    const index = JSON.parse(await decryptPayload(encryptedPayload));
    return index;
}

async function apiDeleteStory(storyId) {
    const request = new Request(`/api/v1/story/content/${storyId}`, {
        method: 'DELETE',
    });

    const res = await fetch(request);
    const statusCode = res.status;

    return statusCode;
}

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

// update ui

// Generates an index object 
function generateIndexObject() {
    const index = {
        metadata: {
            version: '0.0.0'
        },
        stories: {},
    };

    return index;
}

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
    apiPostIndex(index);
}

function removeStoryFromIndex(index, storyId) {
    const pStoryName = document.getElementById(`index-story-name-${storyId}`);

    if (pStoryName) {
        pStoryName.outerHTML = '';
    }

    delete index.stories[storyId];
    apiPostIndex(index);
}

function loadStory(id) {
    apiGetStory(id)
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

    apiCreateStory(storyObject)
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

    apiUpdateStory(currentId, storyObject);
    console.log('Updated id ' + currentId);
}

function updateStoryIndexGui() {
    apiGetIndex()
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
    apiDeleteStory(storyId)
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
apiGetIndex().then(obtainedIndex => index = obtainedIndex);

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

updateStoryIndexGui();