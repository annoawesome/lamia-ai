import { decrypt, encrypt, fromBase64, fromBase64ToUint8Array, generateIv, importKey, toBase64 } from "./encryption.js";

const btnNewStory = document.getElementById('btn-new-story');
const panelSubStoryIndex = document.getElementById('panel-sub-story-index');
const textareaContent = document.getElementById('textarea-content');

let lastSeenText = '';
let currentId = '';
let index = {};

async function generateEncryptedPayload(storyContent) {
    const key = await importKey(sessionStorage.getItem('encryption-key'));
    const iv = generateIv();
    const encryptedData = await encrypt(key, iv, new TextEncoder().encode(storyContent));

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

async function apiCreateStory(storyContent) {
    const payload = await generateEncryptedPayload(storyContent);

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
    const storyContent = await decryptPayload(payload);

    return storyContent;
}

async function apiUpdateStory(storyId, storyContent) {
    const payload = await generateEncryptedPayload(storyContent);

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

function updateStoryIndex(index, storyName, storyId) {
    pushStoryToIndexObject(index, storyName, storyId);
    apiPostIndex(index);
}

function loadStory(id) {
    apiGetStory(id)
        .then(storyContent => {
            console.log('Got story id ' + id);
            textareaContent.value = storyContent;
            lastSeenText = storyContent;
            currentId = id;
        });
}

function addNewStoryToIndexGui(id) {
    const storySelectButton = document.createElement('button');
    storySelectButton.className = 'btn btn-story-select';
    storySelectButton.type = 'button';
    storySelectButton.onclick = () => loadStory(id);
    storySelectButton.innerHTML = `<p>${id.substring(0, 15)}</p>`;

    panelSubStoryIndex.append(storySelectButton);
}

function createNewStory() {
    apiCreateStory('')
        .then((id) => {
            console.log('Created story id ' + id);
            textareaContent.value = '';
            lastSeenText = '';
            currentId = id;
            addNewStoryToIndexGui(id);
            updateStoryIndex(index, 'Untitled Story', id);
        });
}

function saveCurrentStory() {
    let currentText = textareaContent.value;

    if (currentText == lastSeenText) {
        return;
    }

    if (currentId === '') {
        return;
    }

    lastSeenText = currentText;
    apiUpdateStory(currentId, currentText);
    console.log('Updated id ' + currentId);
}

function updateStoryIndexGui() {
    apiGetStoryIds()
        .then((storyIds) => {
            panelSubStoryIndex.textContent = '';

            for (let storyId of storyIds) {
                addNewStoryToIndexGui(storyId);
            }
        });
}

// TODO: possible race condition?
// older version? call index updaters
apiGetIndex().then(obtainedIndex => index = obtainedIndex);

btnNewStory.onclick = createNewStory;
setInterval(saveCurrentStory, 5000);

updateStoryIndexGui();