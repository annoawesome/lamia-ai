
/**
 * Send request to llm to continue the text.
 * @param {string} text Prompt to give to the llm.
 * @param {string} url The url to send the request to.
 * @returns {Object}
 */
export async function postRequestGenerate(text, url) {
    console.log("Requesting ai generation");

    // koboldai api request
    const request = new Request(`${url}/api/v1/generate`, {
        method: 'POST',
        body: JSON.stringify({
            max_length: 128,
            prompt: text,
        })
    });

    const res = await fetch(request);
    const json = await res.json();

    return json;
}