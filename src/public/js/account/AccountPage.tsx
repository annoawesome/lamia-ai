import React, { useEffect, useState } from "react";
import LamiaAiTopbar from "../components/LamiaAiTopbar";

function UserPreferences() {
    const [llmSettings, setLlmSettings] = useState<Record<string, string> | null>(null);
    console.log(llmSettings);

    useEffect(() => {
        const request = new Request("/api/v1/config/user/llm-config", {
            method: "GET",
        });

        fetch(request)
            .then(res => res.json())
            .then(json => setLlmSettings(json))
            .catch(() => console.log("Failed!"));
    }, []);
    
    // TODO: set value for each input
    // If input has not loaded yet, then show a loading screen first
    if (llmSettings) {
        return <form className="account-panel" action="#">
            <h2>Default LLM Settings</h2>
            <h3>Samplers</h3>
            <label htmlFor="llm-temperature">Temperature</label>
            <input type="range" name="llm-temperature" id="" defaultValue={llmSettings["llm-temperature"]}/>
            <label htmlFor="llm-context-length">Context Length</label>
            <input type="number" name="llm-context-length" defaultValue={llmSettings["llm-context-length"]}/>
            <label htmlFor="llm-response-length">Response Length</label>
            <input type="number" name="llm-response-length" defaultValue={llmSettings["llm-response-length"]}/>

            <label htmlFor="llm-top-p">Top-P</label>
            <input type="number" name="llm-top-p" id="" defaultValue={llmSettings["llm-top-p"]}/>
            <label htmlFor="llm-top-k">Top-K</label>
            <input type="number" name="llm-top-k" id="" defaultValue={llmSettings["llm-top-k"]}/>

            <h3>Backend Configuration</h3>
            <label htmlFor="llm-streaming-mode">Streaming Mode</label>
            <select name="llm-streaming-mode" id="" defaultValue={llmSettings["llm-streaming-mode"] || "none"}>
                <option value="none">None</option>
                <option value="polling">Polling</option>
                <option value="sse">{"SSE (Server Sent Event)"}</option>
            </select>
            <button type="button" onClick={(ev) => {
                const formData = Object.fromEntries(new FormData(ev.currentTarget.parentElement as HTMLFormElement));
                const request = new Request("/api/v1/config/user/llm-config", {
                    method: "POST",
                    body: JSON.stringify({
                        formData: formData
                    })
                });

                console.log(JSON.stringify({
                        formData: formData
                    }));

                fetch(request)
                    .then(res => {
                        if (res.ok) {
                            setLlmSettings(formData as Record<string, string>);
                        }
                    });
            }}>Save Settings</button>
        </form>;
    }
}

export default function AccountPage() {
    return <>
        <LamiaAiTopbar />
        <div className="pref-flexbox">
            <div id="preference-categories">
                <button className="btn btn-tertiary btn-medium">User Profile</button>
                <button className="btn btn-tertiary btn-medium">Preferences</button>
                <button className="btn btn-tertiary btn-medium">Templates</button>
            </div>
            <UserPreferences />
        </div>
    </>;
}