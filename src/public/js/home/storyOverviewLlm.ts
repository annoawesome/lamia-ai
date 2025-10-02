import { whenFinishWriting } from "./homeViewUtil.js";

const inputLlmCtxLen = document.getElementById('input-llm-ctx-len') as HTMLInputElement;
const inputLlmResLen = document.getElementById('input-llm-res-len') as HTMLInputElement;
const inputLlmTemp = document.getElementById('input-llm-temp') as HTMLInputElement;
const inputLlmRepPen = document.getElementById('input-llm-rep-pen') as HTMLInputElement;
const inputLlmTopP = document.getElementById('input-llm-top-p') as HTMLInputElement;
const inputLlmTopK = document.getElementById('input-llm-top-k') as HTMLInputElement;
const selectLlmStreamType = document.getElementById('select-llm-stream-type') as HTMLSelectElement;

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

// Converts llm-settings data format from server into compatible one following the above exported constant
function updateLlmSettings(defaultLlmSettings: Record<string, string>) {
    llmSettings.temperature = +defaultLlmSettings["llm-temperature"];
    llmSettings.contextLength = +defaultLlmSettings["llm-context-length"];
    llmSettings.responseLength = +defaultLlmSettings["llm-response-length"];
    llmSettings.topP = +defaultLlmSettings["llm-top-p"];
    llmSettings.topK = +defaultLlmSettings["llm-top-k"];
    llmSettings.streamingMode = defaultLlmSettings["llm-streaming-mode"] as string;
}

function renderLlmSettings(llmSettings: Record<string, string | number>) {
    inputLlmCtxLen.value = llmSettings.contextLength.toString();
    inputLlmResLen.value = llmSettings.responseLength.toString();
    inputLlmTemp.value = llmSettings.temperature.toString();
    inputLlmRepPen.value = llmSettings.repetitionPenalty.toString();
    inputLlmTopP.value = llmSettings.topP.toString();
    inputLlmTopK.value = llmSettings.topK.toString();
    selectLlmStreamType.value = llmSettings.streamingMode.toString();
}

function requestLlmSettingsFromServer() {
    const request = new Request('/api/v1/config/user/llm-config', {
        method: 'GET'
    });

    fetch(request)
        .then(res => res.json())
        .then(res => {
            updateLlmSettings(res);
            renderLlmSettings(llmSettings);
        });
}

export function init() {
    requestLlmSettingsFromServer();

    whenFinishWriting(inputLlmCtxLen, () => llmSettings.contextLength = +inputLlmCtxLen.value);
    whenFinishWriting(inputLlmResLen, () => llmSettings.responseLength = +inputLlmResLen.value);
    whenFinishWriting(inputLlmTemp, () => llmSettings.temperature = +inputLlmTemp.value);
    whenFinishWriting(inputLlmRepPen, () => llmSettings.repetitionPenalty = +inputLlmRepPen.value);
    whenFinishWriting(inputLlmTopP, () => llmSettings.topP = +inputLlmTopP.value);
    whenFinishWriting(inputLlmTopK, () => llmSettings.topK = +inputLlmTopK.value);
    selectLlmStreamType.addEventListener('change', () => llmSettings.streamingMode = selectLlmStreamType.value);
}
