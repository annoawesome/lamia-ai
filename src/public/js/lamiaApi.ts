import { decrypt, encrypt, fromBase64, fromBase64ToUint8Array, generateIv, importKey, toBase64 } from "./encryption.js";
import { StoryIndex } from "./home/homeState.js";
import { StoryObject } from "./home/storyObject.js";

async function generateEncryptedPayload(data: string) {
    const storedKey = sessionStorage.getItem('encryption-key');
    if (storedKey == null) return;

    const key = await importKey(storedKey);
    const iv = generateIv();
    const encryptedData = await encrypt(key, iv, new TextEncoder().encode(data));

    const payload = {
        encryptedData64: toBase64(encryptedData),
        iv: toBase64(iv),
    };

    return payload;
}

async function decryptPayload(payload: { encryptedData64: string; iv: string; }) {
    const storedKey = sessionStorage.getItem('encryption-key');
    if (storedKey == null) return;

    const key = await importKey(storedKey);
    const encryptedData = fromBase64(payload.encryptedData64);
    const iv = fromBase64ToUint8Array(payload.iv);
    const encodedStoryContent = await decrypt(key, iv, encryptedData);

    return new TextDecoder().decode(encodedStoryContent);
}

function generateIndexObject() {
    const index = {
        metadata: {
            version: '0.0.0'
        },
        stories: {},
    };

    return index;
}

export async function createStory(storyObject: StoryObject) {
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

export async function getStory(storyId: string) {
    const request = new Request(`/api/v1/story/content/${storyId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    const res = await fetch(request);
    const payload = await res.json();
    const storyObjectStr = await decryptPayload(payload);

    if (storyObjectStr) {
        return JSON.parse(storyObjectStr);
    }
}

export async function updateStory(storyId: string, storyObject: StoryObject) {
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

export async function getStoryIds() {
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

export async function postIndex(index: StoryIndex) {
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

export async function getIndex() {
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

    const decryptedPayload = await decryptPayload(encryptedPayload);

    if (!decryptedPayload) {
        return generateIndexObject();
    }

    const index = JSON.parse(decryptedPayload);
    return index;
}

export async function deleteStory(storyId: string) {
    const request = new Request(`/api/v1/story/content/${storyId}`, {
        method: 'DELETE',
    });

    const res = await fetch(request);
    const statusCode = res.status;

    return statusCode;
}

export async function getBackendInfo() {
    const request = new Request(`/api/v1/info`, {
        method: 'GET'
    });
    
    const res = await fetch(request);
    const info = await res.json();

    return info;
}