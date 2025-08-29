import React from "react";
import LamiaAiTopbar from "../components/LamiaAiTopbar";

function UserPreferences() {
    return (
        <form className="account-panel" action="#">
            <h2>Default LLM Settings</h2>
            <h3>Samplers</h3>
            <label htmlFor="llm-temperature">Temperature</label>
            <input type="range" name="llm-temperature" id="" />
            <label htmlFor="llm-context-length">Context Length</label>
            <input type="number" name="llm-context-length" />
            <label htmlFor="llm-response-length">Response Length</label>
            <input type="number" name="llm-response-length" />

            <label htmlFor="llm-top-p">Top-P</label>
            <input type="number" name="llm-top-p" id="" />
            <label htmlFor="llm-top-k">Top-K</label>
            <input type="number" name="llm-top-k" id="" />

            <h3>Backend Configuration</h3>
            <label htmlFor="llm-streaming-mode">Streaming Mode</label>
            <select name="llm-streaming-mode" id="" defaultValue={"none"}>
                <option value="none">None</option>
                <option value="polling">Polling</option>
                <option value="sse">{"SSE (Server Sent Event)"}</option>
            </select>
            <input type="submit" value="Save Settings" />
        </form>
    );
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