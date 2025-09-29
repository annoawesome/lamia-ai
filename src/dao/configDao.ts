import { getLamiaUserDirectory } from "../service/lamiadbService.js";
import { readDocumentWithDefaults } from "../util/fsdb.js";


export async function getUserConfig(username: string) {
    const userDirectory = await getLamiaUserDirectory(username);

    if (typeof(userDirectory) !== 'string') {
        return "";
    }

    const configStr = readDocumentWithDefaults(userDirectory, "llm_config.json", JSON.stringify({
        "llm-temperature": 1.15,
        "llm-context-length": 2048,
        "llm-response-length": 256,
        "llm-top-p": 0.9,
        "llm-top-k": 40,
        "llm-streaming-mode": "none"
    }));

    return JSON.parse(configStr);
}