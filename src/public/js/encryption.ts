export function generateIv() {
    return crypto.getRandomValues(new Uint8Array(16));
}

export async function generateSalt(secret: string) {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret)));
}

export async function generateEncryptionKey(password: string, salt: Uint8Array<ArrayBuffer>) {
    const passwordBuffer = new TextEncoder().encode(password);
    const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveKey', 'deriveBits']);

    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    return key;
}

export async function exportKey(key: CryptoKey) {
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    return JSON.stringify(Array.from(new Uint8Array(exportedKey)));
}

export async function importKey(key: string) {
    const rawKey = new Uint8Array(JSON.parse(key));

    return await crypto.subtle.importKey('raw', rawKey.buffer, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export function encrypt(key: CryptoKey, iv: Uint8Array<ArrayBuffer>, content: BufferSource) {
    return crypto.subtle.encrypt({ name: 'AES-GCM', length: 256, iv: iv }, key, content);
}

export function decrypt(key: CryptoKey, iv: Uint8Array<ArrayBuffer>, data: BufferSource) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', length: 256, iv: iv }, key, data);
}

export function toBase64(arrayBuffer: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
}

export function fromBase64ToUint8Array(base64: string) {
    return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
}

export function fromBase64(base64: string) {
    return fromBase64ToUint8Array(base64).buffer;
}