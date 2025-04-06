import { decrypt, encrypt, fromBase64, fromBase64ToUint8Array, generateIv, importKey, toBase64 } from "./encryption.js";

const btnNewStory = document.getElementById('btn-new-story');
const panelSubStoryIndex = document.getElementById('panel-sub-story-index');
const textareaContent = document.getElementById('textarea-content');

let lastSeenText = '';
let currentId = '';

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

async function createStory(storyContent) {
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

async function getStory(storyId) {
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

async function updateStory(storyId, storyContent) {
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

async function getStoryIds() {
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

function loadStoryGui(id) {
    getStory(id)
        .then(storyContent => {
            console.log('Got story id ' + id);
            textareaContent.value = storyContent;
            lastSeenText = storyContent;
            currentId = id;
        });
}

function addNewStoryToIndex(id) {
    const storySelectButton = document.createElement('button');
    storySelectButton.className = 'btn btn-story-select';
    storySelectButton.type = 'button';
    storySelectButton.onclick = () => loadStoryGui(id);
    storySelectButton.innerHTML = `<p>${id.substring(0, 15)}</p>`;

    panelSubStoryIndex.append(storySelectButton);
}

function createNewStoryGuiAction() {
    createStory('')
        .then((id) => {
            console.log('Created story id ' + id);
            textareaContent.value = '';
            lastSeenText = '';
            currentId = id;
            addNewStoryToIndex(id);
        });
}

function saveStoryAction() {
    let currentText = textareaContent.value;

    if (currentText == lastSeenText) {
        return;
    }

    if (currentId === '') {
        return;
    }

    lastSeenText = currentText;
    updateStory(currentId, currentText);
    console.log('Updated id ' + currentId);
}

function getStoryIdsAction() {
    getStoryIds()
        .then((storyIds) => {
            panelSubStoryIndex.textContent = '';

            for (let storyId of storyIds) {
                addNewStoryToIndex(storyId);
            }
        });
}

btnNewStory.onclick = createNewStoryGuiAction;
setInterval(saveStoryAction, 5000);

getStoryIdsAction();