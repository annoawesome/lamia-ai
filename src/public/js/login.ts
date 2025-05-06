import { exportKey, generateEncryptionKey, generateSalt } from "./encryption.js";

const btnLogin = document.getElementById('btn-login') as HTMLButtonElement;

const inputUsername = document.getElementById('input-username') as HTMLInputElement;
const inputPassword = document.getElementById('input-password') as HTMLInputElement;

async function hash(str: string | undefined) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(hashBuffer))
        .map(char => char.toString(16).padStart(2, '0'))
        .join('');
}

function postLoginAccount(username: string, password: string) {
    // TODO: implement endpoint
    const request = new Request('/api/v1/user/login', {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            username: username,
            password: password,
        })
    });

    return fetch(request)
        .then(res => res.json())
        .then(res => {
            console.log(res);
        });
}

function setInput(bool: boolean) {
    inputUsername.disabled = bool;
    inputPassword.disabled = bool;
}

btnLogin.addEventListener('click', () => {
    const username = inputUsername.value;
    const password = inputPassword.value;

    setInput(false);

    generateSalt(password + username + '_lamia')
        .then(async salt => await generateEncryptionKey(password, salt))
        .then(async key => await exportKey(key))
        .then(encodedKey => sessionStorage.setItem('encryption-key', encodedKey))
        .then(async () => await hash(password))
        .then(passwordHash => postLoginAccount(username, passwordHash))
        .then(() => window.location.replace('home'))
        .catch(() => {
            setInput(true);
        });
});