const toastNotifications = document.getElementById('toast-notifications') as HTMLDivElement;

const alertSvgPath = 'M2.725 21q-.275 0-.5-.137t-.35-.363t-.137-.488t.137-.512l9.25-16q.15-.25.388-.375T12 3t.488.125t.387.375l9.25 16q.15.25.138.513t-.138.487t-.35.363t-.5.137zm1.725-2h15.1L12 6zM12 18q.425 0 .713-.288T13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18m0-3q.425 0 .713-.288T13 14v-3q0-.425-.288-.712T12 10t-.712.288T11 11v3q0 .425.288.713T12 15m0-2.5';

export function popToastNotif(message: string) {
    const toastNotif = document.createElement('button');
    toastNotif.classList.add('toast-notification');

    const innerHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" style="fill: #ffffff; float: left">
            <path d="${alertSvgPath}"/>
        </svg>
        <p>${message}</p>
    `;

    toastNotif.innerHTML = innerHtml;
    toastNotifications.appendChild(toastNotif);

    toastNotif.addEventListener('click', () => {
        if (toastNotif.parentElement === toastNotifications) {
            toastNotifications.removeChild(toastNotif);
        }
    });

    setInterval(() => toastNotif.click(), 5000);
}