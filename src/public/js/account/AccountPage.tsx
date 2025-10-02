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
            <label htmlFor="llm-temperature" className="form-label">Temperature</label>
            <input type="range" name="llm-temperature" className="input-secondary" id="" defaultValue={llmSettings["llm-temperature"]}/>
            <label htmlFor="llm-context-length" className="form-label">Context Length</label>
            <input type="number" name="llm-context-length" className="input-secondary" defaultValue={llmSettings["llm-context-length"]}/>
            <label htmlFor="llm-response-length" className="form-label">Response Length</label>
            <input type="number" name="llm-response-length" className="input-secondary" defaultValue={llmSettings["llm-response-length"]}/>

            <label htmlFor="llm-top-p" className="form-label">Top-P</label>
            <input type="number" name="llm-top-p" id="" className="input-secondary" defaultValue={llmSettings["llm-top-p"]}/>
            <label htmlFor="llm-top-k" className="form-label">Top-K</label>
            <input type="number" name="llm-top-k" id="" className="input-secondary" defaultValue={llmSettings["llm-top-k"]}/>

            <h3>Backend Configuration</h3>
            <label htmlFor="llm-streaming-mode" className="form-label">Streaming Mode</label>
            <select name="llm-streaming-mode" id="" className="input-secondary" defaultValue={llmSettings["llm-streaming-mode"] || "none"}>
                <option value="none">None</option>
                <option value="polling">Polling</option>
                <option value="sse">{"SSE (Server Sent Event)"}</option>
            </select>
            <button type="button" className="btn btn-primary btn-large" id="btn-save-llm-settings" onClick={(ev) => {
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