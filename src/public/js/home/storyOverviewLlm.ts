const inputLlmCtxLen = document.getElementById('input-llm-ctx-len') as HTMLInputElement;
const inputLlmResLen = document.getElementById('input-llm-res-len') as HTMLInputElement;
const inputLlmTemp = document.getElementById('input-llm-temp') as HTMLInputElement;
const inputLlmRepPen = document.getElementById('input-llm-rep-pen') as HTMLInputElement;
const inputLlmTopP = document.getElementById('input-llm-top-p') as HTMLInputElement;
const inputLlmTopK = document.getElementById('input-llm-top-k') as HTMLInputElement;
const selectLlmStreamType = document.getElementById('select-llm-stream-type') as HTMLSelectElement;

function whenFinishWriting(domElement: HTMLElement, callback: () => void) {
    domElement.addEventListener('blur', () => {
        callback();
    });

    domElement.addEventListener('keypress', ev => {
        if (ev.key === 'Enter') {
            domElement.blur();
        }
    });
}

// No separation of logic and user interface yet, too simple
export const llmSettings = {
    uri: 'http://localhost:5001',
    contextLength: 2048,
    responseLength: 120,
    temperature: 1.15,
    repetitionPenalty: 1.07,
    topP: 0.92,
    topK: 100,
    streamingMode: 'sse',
};

export function init() {
    whenFinishWriting(inputLlmCtxLen, () => llmSettings.contextLength = +inputLlmCtxLen.value);
    whenFinishWriting(inputLlmResLen, () => llmSettings.responseLength = +inputLlmResLen.value);
    whenFinishWriting(inputLlmTemp, () => llmSettings.temperature = +inputLlmTemp.value);
    whenFinishWriting(inputLlmRepPen, () => llmSettings.repetitionPenalty = +inputLlmRepPen.value);
    whenFinishWriting(inputLlmTopP, () => llmSettings.topP = +inputLlmTopP.value);
    whenFinishWriting(inputLlmTopK, () => llmSettings.topK = +inputLlmTopK.value);
    selectLlmStreamType.addEventListener('change', () => llmSettings.streamingMode = selectLlmStreamType.value);
}
