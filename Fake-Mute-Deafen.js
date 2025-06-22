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
    panel.style.cursor = "grab"; 
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

    let isDragging = false;
    let offsetX, offsetY;

    panel.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - panel.getBoundingClientRect().left;
        offsetY = e.clientY - panel.getBoundingClientRect().top;
        panel.style.cursor = "grabbing"; 
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        panel.style.left = `${e.clientX - offsetX}px`;
        panel.style.top = `${e.clientY - offsetY}px`;
        panel.style.right = "auto"; 
        panel.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        panel.style.cursor = "grab"
    });

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
                    console.log("[FakeMuteDeafen] Sending spoofed data:", data);
                }
            }
        } catch (err) {
            console.warn("[FakeMuteDeafen] Failed to spoof packet:", err);
        }

        return originalSend.call(this, data);
    };

    console.log("%c[FakeMuteDeafen] Ready (WebSocket v9+)", "color: lime; font-weight: bold;");
})();
