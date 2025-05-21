const btnRegisterAccount = document.getElementById('btn-register-account') as HTMLButtonElement;

const inputUsername = document.getElementById('input-username') as HTMLInputElement;
const inputPassword = document.getElementById('input-password') as HTMLInputElement;
const inputReEnterPassword = document.getElementById('input-re-enter-password') as HTMLInputElement;

const divWarnRegisterError = document.getElementById('warn-register-error') as HTMLDivElement;
const pWarnRegisterError = document.getElementById('p-warn-register-error') as HTMLDivElement;

async function hash(str: string) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(hashBuffer))
        .map(char => char.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Currently only enforces password length. Overly strict requirements leads to
 * password reuse, a bad practice among users.
 * @param {string} password Password.
 * @returns {boolean}
 */
function isSecurePassword(password: string) {
    if (password.length < 12) return false;

    return true;
}

function postCreateAccount(username: string, password: string) {
    const request = new Request('/api/v1/user/create', {
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
        .then(async res => {
            if (res.status >= 300) 
                throw await res.json(); 
            else 
                return await res.json();
            });
}

function toggleInputDisabled(bool: boolean) {
    inputUsername.disabled = bool;
    inputPassword.disabled = bool;
    inputReEnterPassword.disabled = bool;
    btnRegisterAccount.disabled = bool;
}

function setErrorMessage(message: string) {
    divWarnRegisterError.style.display = '';
    pWarnRegisterError.innerText = message;
}

btnRegisterAccount.addEventListener('click', () => {
    const username = inputUsername.value;
    const password = inputPassword.value;

    if (!isSecurePassword(password)) {
        setErrorMessage('Insecure password! Choose one that is over 12 characters long.');
        return;
    }
    
    if (password !== inputReEnterPassword.value) {
        setErrorMessage('Passwords do not match!');
        return;
    }

    toggleInputDisabled(true);

    hash(password)
        .then(passwordHash => postCreateAccount(username, passwordHash))
        .then(() => window.location.replace('login'))
        .catch((err) => {
            toggleInputDisabled(false);
            console.log(err);
            setErrorMessage(err.reason || 'Internal server error');
        });
});