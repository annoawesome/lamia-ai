import { generateStoryObjectFromGui } from "./homeViewUtil.js";

const btnExportText = document.getElementById('btn-export-text') as HTMLButtonElement;
const btnExportJson = document.getElementById('btn-export-json') as HTMLButtonElement;
const divEditorContent = document.getElementById('div-editor-content') as HTMLDivElement;

function exportFile(fileName: string, contents: string) {
    const fileDownloadElement = document.createElement('a');
    fileDownloadElement.href = 'data:text/plain,' + encodeURIComponent(contents);
    fileDownloadElement.download = fileName;
    document.body.appendChild(fileDownloadElement);
    fileDownloadElement.click();
    document.body.removeChild(fileDownloadElement);
}

export function init() {
    btnExportText.addEventListener('click', () => exportFile('story.txt', divEditorContent.innerText));
    btnExportJson.addEventListener('click', () => exportFile('story.json', JSON.stringify(generateStoryObjectFromGui())));
}