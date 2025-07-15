export type KoboldCppRequestBody = {
    prompt?: string,
    max_length?: number,
    max_context_length?: number,
    rep_pen?: number,
    temperature?: number,
    top_k?: number,
    top_p?: number,
};

function extractDataFromEvent(eventChunk: string) {
    const matches = eventChunk.match(/data:\s*(.*)/);

    if (matches && matches[1]) {
        return JSON.parse(matches[1]);
    }
}

/**
 * Listens to SSE with custom request.
 * 
 * KoboldCpp API notes that to use SSE streaming, we need to create a POST request.
 * However, `EventSource` provided by vanilla JS does not allow this. This necessitates the need for a custom implementation.
 * 
 * Additionally, this implementation makes the assumption that only one event occurs at a time. This is only true for KoboldCpp's API endpoint
 * as a consequence of LLMs being inherently slow.
 */
async function listenToSse(request: Request, callback: (json: any) => void) {
    const response = await fetch(request);

    if (!response.ok || !response.body) {
        console.error('Failed to fetch SSE: ' + response.status);
        throw new Error(String(response.status));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    do {
        const readValueResult = await reader.read();
        const chunk = decoder.decode(readValueResult.value, { stream: true });
        done = readValueResult.done;
        
        const json = extractDataFromEvent(chunk);

        if (json) {
            callback(json);
        }
    } while (!done);
};

/**
 * Send request to llm to continue the text.
 * @param {string} text Prompt to give to the llm.
 * @param {string} url The url to send the request to.
 * @returns {Object}
 */
export async function postRequestGenerate(text: string, url: string, body: KoboldCppRequestBody) {
    console.log("Requesting ai generation");

    body.prompt = text;

    // koboldai api request
    const request = new Request(`${url}/api/v1/generate`, {
        method: 'POST',
        body: JSON.stringify(body)
    });

    const res = await fetch(request);
    const json = await res.json();

    return json;
}

export async function postRequestGenerateSse(text: string, baseUrl: string, body: KoboldCppRequestBody, callback: (data: any) => void) {
    console.log("Requesting ai generation with sse");

    body.prompt = text;

    const request = new Request(`${baseUrl}/api/extra/generate/stream`, {
        method: 'POST',
        headers: {
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify(body)
    });

    await listenToSse(request, callback);
}

/**
 * Returns version number of the koboldai backend. Is empty when no backend
 * @param baseUri 
 * @returns
 */
export async function getKoboldCppBackendVersion(baseUri: string) {
    const request = new Request(`${baseUri}/api/v1/version/info/version`, {
        method: 'GET'
    });

    const response = await fetch(request);

    if (response.ok) {
        const json = await response.json();
        return json.result;
    } else {
        return '';
    }
}

/**
 * Gets the current loaded model
 */
export async function getLoadedModel(baseUri: string): Promise<string> {
    const request = new Request(`${baseUri}/api/v1/model`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    const response = await fetch(request);

    if (response.ok) {
        return (await response.json()).result;
    } else {
        return '';
    }
}