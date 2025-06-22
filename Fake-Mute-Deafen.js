(() => {
    const originalSend = WebSocket.prototype.send;
    let spoofMute = false;
    let spoofDeafen = false;

    const panel = document.createElement("div");
    panel.style.position = "fixed";
    panel.style.bottom = "20px";
    panel.style.right = "20px";
    panel.style.background = "#2f3136";
    panel.style.border = "1px solid #555";
    panel.style.padding = "10px";
    panel.style.borderRadius = "8px";
    panel.style.zIndex = 9999;
    panel.style.color = "white";
    panel.style.fontFamily = "sans-serif";
    panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    panel.innerHTML = `
        <div style="font-weight:bold;margin-bottom:5px;">🎭 Fake Mute/Deafen</div>
        <button id="fakeMuteBtn">🎤 Mute: OFF</button>
        <button id="fakeDeafenBtn">🎧 Deafen: OFF</button>
    `;
    document.body.appendChild(panel);

    const muteBtn = panel.querySelector("#fakeMuteBtn");
    const deafenBtn = panel.querySelector("#fakeDeafenBtn");

    const updateButtons = () => {
        muteBtn.textContent = `🎤 Mute: ${spoofMute ? "ON" : "OFF"}`;
        deafenBtn.textContent = `🎧 Deafen: ${spoofDeafen ? "ON" : "OFF"}`;
    };

    muteBtn.onclick = () => {
        spoofMute = !spoofMute;
        updateButtons();
    };

    deafenBtn.onclick = () => {
        spoofDeafen = !spoofDeafen;
        updateButtons();
    };

    WebSocket.prototype.send = function (data) {
        try {
            if (typeof data === "string") {
                const json = JSON.parse(data);
                if (json && json.op === 4 && json.d) {
                    if (typeof json.d.self_mute === "boolean") {
                        json.d.self_mute = spoofMute;
                    }
                    if (typeof json.d.self_deaf === "boolean") {
                        json.d.self_deaf = spoofDeafen;
                    }
                    data = JSON.stringify(json);
                    console.log("[FakeMuteDeafen] send:", data);
                }
            }
        } catch (err) {
            console.warn("[FakeMuteDeafen] Packages cannot be faked:", err);
        }

        return originalSend.call(this, data);
    };

    console.log("%c[FakeMuteDeafen] Ready (WebSocket v9+)", "color: lime; font-weight: bold;");
})();
