const btnRegisterAccount = document.getElementById('btn-register-account');

const inputUsername = document.getElementById('input-username');
const inputPassword = document.getElementById('input-password');
const inputReEnterPassword = document.getElementById('input-re-enter-password');

async function hash(str) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(hashBuffer))
        .map(char => char.toString(16).padStart(2, '0'))
        .join('');
}

function postCreateAccount(username, password) {
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
        .then(res => res.json())
        .then(res => {
            console.log(res);
        });
}

function setInput(bool) {
    inputUsername.disabled = bool;
    inputPassword.disabled = bool;
    inputReEnterPassword.disabled = bool;
    btnRegisterAccount.disabled = bool;
}

btnRegisterAccount.addEventListener('click', () => {
    const username = inputUsername.value;
    const password = inputPassword.value;
    
    if (password !== inputReEnterPassword.value) {
        alert("Passwords do not match!");
    }

    setInput(false);

    hash(password)
        .then(passwordHash => postCreateAccount(username, passwordHash))
        .then(() => window.location.replace('login.html'))
        .catch(() => {
            setInput(true);
            document.getElementById('warn-register-error').style.display = '';
        });
});