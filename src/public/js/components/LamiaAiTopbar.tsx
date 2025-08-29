import React from "react";

export default function LamiaAiTopbar() {
    return (
        <nav className="flex-flow-right" id="lamia-topbar">
            <a className="btn btn-medium flex-flow-right" href="/"><img src="assets/favicon-32x32.png" alt="Lamia AI Logo"></img><h2>LamiaAI</h2></a>
            <a className="btn btn-tertiary btn-medium" href="/account">Account</a>
            <a className="btn btn-tertiary btn-medium">Pricing</a>
            <a className="btn btn-tertiary btn-medium">Blog</a>
            <a className="btn btn-tertiary btn-medium">GitHub</a>
            <a className="btn btn-tertiary btn-medium">FAQ</a>
        </nav>
    );
}