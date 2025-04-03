import { decrypt, encrypt, fromBase64, fromBase64ToUint8Array, generateIv, importKey, toBase64 } from "./encryption.js";

const authedRequest = new Request('/api/v1/isAuthed', {
    method: 'GET'
});

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

    const request = new Request('/api/v1/story', {
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
    const request = new Request(`/api/v1/story/${storyId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    const res = await fetch(request);
    const payload = await res.json();
    const storyContent = decryptPayload(payload);

    return storyContent;
}

async function updateStory(storyId, storyContent) {
    const payload = await generateEncryptedPayload(storyContent);

    const request = new Request(`/api/v1/story/${storyId}`, {
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

createStory("In the arms of an angel.")
    .then(storyId => getStory(storyId))
    .then(val => console.log(val));

fetch(authedRequest)
    .then(res => {
        console.log(res);
        console.log('Success?');
    });