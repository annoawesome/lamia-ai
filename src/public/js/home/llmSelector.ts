const btnTopbarAiEndpoint = document.getElementById('btn-topbar-ai-endpoint') as HTMLButtonElement;

const divPopupShadow = document.getElementById('div-popup-shadow') as HTMLDivElement;
const divAiSelectorPopup = document.getElementById('div-ai-selector-popup') as HTMLDivElement;
const btnLlmSelectorExit = document.getElementById('btn-llm-selector-exit') as HTMLButtonElement;

function closePopup(htmlElement: HTMLElement) {
    divPopupShadow.style.display = 'none';

    htmlElement.classList.add('gr-hidden');
}

function openPopup(htmlElement: HTMLElement) {
    divPopupShadow.style.display = '';

    htmlElement.classList.remove('gr-hidden');
}

export function init() {
    btnTopbarAiEndpoint.addEventListener('click', () => openPopup(divAiSelectorPopup));
    btnLlmSelectorExit.addEventListener('click', () => closePopup(divAiSelectorPopup));

    console.log('init llm selector');
}