import '../css/style.css';

import { exportKey, generateEncryptionKey, generateSalt } from "./encryption.js";

const btnLogin = document.getElementById('btn-login') as HTMLButtonElement;

const inputUsername = document.getElementById('input-username') as HTMLInputElement;
const inputPassword = document.getElementById('input-password') as HTMLInputElement;

const divWarnLoginError = document.getElementById('warn-login-error') as HTMLDivElement;
const pWarnLoginError = document.getElementById('p-warn-login-error') as HTMLParagraphElement;

async function hash(str: string | undefined) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(hashBuffer))
        .map(char => char.toString(16).padStart(2, '0'))
        .join('');
}

function preprocessResponse(res: Response) {
    if (!res.ok) {
        throw new Error(res.statusText);
    } else {
        return res.json();
    }
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
        .then(res => preprocessResponse(res))
        .then(res => {
            console.log(res);
        });
}

function setInputDisabled(bool: boolean) {
    inputUsername.disabled = bool;
    inputPassword.disabled = bool;
}

btnLogin.addEventListener('click', () => {
    const username = inputUsername.value;
    const password = inputPassword.value;

    setInputDisabled(true);

    generateSalt(password + username + '_lamia')
        .then(async salt => await generateEncryptionKey(password, salt))
        .then(async key => await exportKey(key))
        .then(encodedKey => sessionStorage.setItem('encryption-key', encodedKey))
        .then(async () => await hash(password))
        .then(async passwordHash => await postLoginAccount(username, passwordHash))
        .then(() => window.location.replace('home'))
        .catch((err: Error) => {
            setInputDisabled(false);

            switch (err.message) {
                case 'Conflict':
                    pWarnLoginError.innerText = 'Failed to log in. Did you put in the correct username or password?';
                    break;
                default:
                    pWarnLoginError.innerText = 'Failed to log in. An unknown error has occurred. Please try again in a few minutes.';
                    break;
            }

            divWarnLoginError.classList.remove('gr-hidden');
        });
});