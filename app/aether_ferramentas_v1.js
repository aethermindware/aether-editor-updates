(() => {
    "use strict";

    if (window.AETHER_FERRAMENTAS_V1) return;
    window.AETHER_FERRAMENTAS_V1 = true;

    function removerDebug() {
        if (!document.body) return;

        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        let node;

        while ((node = walker.nextNode())) {
            const texto = (node.nodeValue || "").toUpperCase();

            if (!texto.includes("CLIQUE DETECTADO")) continue;

            let elemento = node.parentElement;

            while (elemento && elemento !== document.body) {
                const conteudo = (
                    elemento.textContent || ""
                ).toUpperCase();

                const rect = elemento.getBoundingClientRect();

                if (
                    conteudo.includes("CLIQUE DETECTADO") &&
                    conteudo.includes("ERROS:") &&
                    rect.width >= 150 &&
                    rect.height > 0 &&
                    rect.height <= 130 &&
                    !elemento.querySelector(
                        "button,input,video,canvas,textarea"
                    )
                ) {
                    elemento.remove();
                    return;
                }

                elemento = elemento.parentElement;
            }
        }
    }

    function iniciar() {
        removerDebug();

        let programado = false;

        new MutationObserver(() => {
            if (programado) return;

            programado = true;

            requestAnimationFrame(() => {
                programado = false;
                removerDebug();
            });
        }).observe(document.body, {
            subtree: true,
            childList: true,
            characterData: true
        });

        const editor = document.getElementById("editor");
        const video = document.getElementById("video");

        if (!editor || !video) {
            console.warn("Aether: editor ou video ausente");
            return;
        }

        if (document.getElementById("ae-extra-v1")) return;

        const estilo = document.createElement("style");

        estilo.textContent = `
            #ae-extra-v1 {
                position: fixed;
                right: 12px;
                bottom: 12px;
                z-index: 10000;
                font: 13px system-ui,Arial,sans-serif;
                color: #f3f7ff;
            }

            #ae-extra-v1 button,
            #ae-extra-v1 select {
                font: inherit;
                cursor: pointer;
                color: #f3f7ff;
                background: #263650;
                border: 1px solid #516481;
                border-radius: 8px;
                padding: 8px;
            }

            #ae-extra-v1 .ae-extra-toggle {
                background: #2865d2;
                border: 1px solid #538dff;
                box-shadow: 0 4px 18px #0008;
            }

            #ae-extra-v1 .ae-extra-panel {
                display: none;
                position: absolute;
                right: 0;
                bottom: 47px;
                width: min(320px,calc(100vw - 24px));
                max-height: min(70vh,580px);
                overflow: auto;
                background: #141d2c;
                border: 1px solid #526784;
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 12px 32px #000b;
            }

            #ae-extra-v1.aberto .ae-extra-panel {
                display: block;
            }

            #ae-extra-v1 .ae-extra-h {
                font-weight: 700;
                font-size: 14px;
                margin: 0 0 6px;
            }

            #ae-extra-v1 .ae-extra-row {
                display: flex;
                gap: 7px;
                align-items: center;
                margin: 9px 0;
                flex-wrap: wrap;
            }

            #ae-extra-v1 .ae-extra-row button {
                flex: 1;
            }

            #ae-extra-v1 label {
                display: block;
                margin-top: 10px;
                color: #ccd8ee;
            }

            #ae-extra-v1 input[type=range] {
                width: 100%;
                accent-color: #4e99ff;
            }

            #ae-extra-v1 .ae-extra-note {
                color: #9db0c8;
                font-size: 11px;
                margin-top: 10px;
                line-height: 1.35;
            }

            #ae-extra-v1 .ae-extra-status {
                color: #93e4bd;
                min-height: 17px;
                font-size: 11px;
                margin-top: 6px;
            }
        `;

        document.head.appendChild(estilo);

        const raiz = document.createElement("div");
        raiz.id = "ae-extra-v1";

        raiz.innerHTML = `
            <button type="button"
                class="ae-extra-toggle"
                aria-expanded="false">
                ✂ Ferramentas
            </button>

            <div class="ae-extra-panel">
                <div class="ae-extra-h">
                    Edição e reprodução
                </div>

                <label for="ae-vel-v1">
                    Velocidade de prévia
                </label>

                <select id="ae-vel-v1" style="width:100%">
                    <option value="0.5">0,5×</option>
                    <option value="0.75">0,75×</option>
                    <option value="1" selected>1× normal</option>
                    <option value="1.25">1,25×</option>
                    <option value="1.5">1,5×</option>
                    <option value="2">2×</option>
                </select>

                <label for="ae-vol-v1">
                    Volume:
                    <span id="ae-vol-txt-v1">100%</span>
                </label>

                <input id="ae-vol-v1"
                    type="range" min="0" max="100"
                    value="100">

                <div class="ae-extra-row">
                    <button id="ae-mudo-v1">
                        Silenciar
                    </button>
                    <button id="ae-foto-v1">
                        Capturar PNG
                    </button>
                </div>

                <div class="ae-extra-h">
                    Ajustes da prévia
                </div>

                <label for="ae-brilho-v1">
                    Brilho:
                    <span id="ae-brilho-txt-v1">100%</span>
                </label>

                <input id="ae-brilho-v1"
                    type="range" min="40" max="180"
                    value="100">

                <label for="ae-contraste-v1">
                    Contraste:
                    <span id="ae-contraste-txt-v1">100%</span>
                </label>

                <input id="ae-contraste-v1"
                    type="range" min="40" max="180"
                    value="100">

                <label for="ae-sat-v1">
                    Saturação:
                    <span id="ae-sat-txt-v1">100%</span>
                </label>

                <input id="ae-sat-v1"
                    type="range" min="0" max="200"
                    value="100">

                <div class="ae-extra-row">
                    <button id="ae-reset-v1">
                        Restaurar visual
                    </button>
                </div>

                <div class="ae-extra-h">
                    Intervalo de reprodução
                </div>

                <div class="ae-extra-row">
                    <button id="ae-in-v1">
                        Marcar IN
                    </button>
                    <button id="ae-out-v1">
                        Marcar OUT
                    </button>
                </div>

                <div id="ae-intervalo-v1">
                    IN: --:-- / OUT: --:--
                </div>

                <div class="ae-extra-row">
                    <button id="ae-playtrecho-v1">
                        Reproduzir trecho
                    </button>
                    <button id="ae-limpar-v1">
                        Limpar
                    </button>
                </div>

                <div id="ae-status-v1"
                    class="ae-extra-status">
                </div>

                <div class="ae-extra-note">
                    Ferramentas de prévia.
                    Os ajustes e as marcas ainda
                    não são exportados no MP4.
                </div>
            </div>
        `;

        editor.appendChild(raiz);

        const $ = id => raiz.querySelector("#" + id);

        const informar = mensagem => {
            $("ae-status-v1").textContent = mensagem;
        };

        const duracao = () =>
            Number.isFinite(video.duration) && video.duration > 0
                ? video.duration
                : 0;

        function formatar(segundos) {
            const s = Math.floor(Math.max(0, segundos || 0));

            return String(Math.floor(s / 60)).padStart(2, "0") +
                ":" + String(s % 60).padStart(2, "0");
        }

        const botaoMenu = raiz.querySelector(".ae-extra-toggle");

        botaoMenu.addEventListener("click", () => {
            const aberto = raiz.classList.toggle("aberto");

            botaoMenu.setAttribute(
                "aria-expanded",
                String(aberto)
            );
        });

        $("ae-vel-v1").addEventListener("change", e => {
            video.playbackRate = Number(e.target.value);
            informar("Velocidade alterada.");
        });

        $("ae-vol-v1").addEventListener("input", e => {
            video.volume = Number(e.target.value) / 100;

            if (video.volume > 0) {
                video.muted = false;
            }

            $("ae-vol-txt-v1").textContent =
                Math.round(video.volume * 100) + "%";

            $("ae-mudo-v1").textContent =
                video.muted ? "Ativar som" : "Silenciar";
        });

        $("ae-mudo-v1").addEventListener("click", () => {
            video.muted = !video.muted;

            $("ae-mudo-v1").textContent =
                video.muted ? "Ativar som" : "Silenciar";
        });

        function atualizarFiltro() {
            const b = $("ae-brilho-v1").value;
            const c = $("ae-contraste-v1").value;
            const s = $("ae-sat-v1").value;

            video.style.filter =
                "brightness(" + b + "%) " +
                "contrast(" + c + "%) " +
                "saturate(" + s + "%)";

            $("ae-brilho-txt-v1").textContent = b + "%";
            $("ae-contraste-txt-v1").textContent = c + "%";
            $("ae-sat-txt-v1").textContent = s + "%";
        }

        [
            "ae-brilho-v1",
            "ae-contraste-v1",
            "ae-sat-v1"
        ].forEach(id => {
            $(id).addEventListener("input", atualizarFiltro);
        });

        $("ae-reset-v1").addEventListener("click", () => {
            [
                "ae-brilho-v1",
                "ae-contraste-v1",
                "ae-sat-v1"
            ].forEach(id => {
                $(id).value = "100";
            });

            atualizarFiltro();
            informar("Visual restaurado.");
        });

        $("ae-foto-v1").addEventListener("click", () => {
            if (!video.videoWidth || !video.videoHeight) {
                informar("Importe um vídeo primeiro.");
                return;
            }

            try {
                const canvas = document.createElement("canvas");

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext("2d");

                ctx.filter = getComputedStyle(video).filter || "none";
                ctx.drawImage(video, 0, 0);

                canvas.toBlob(blob => {
                    if (!blob) {
                        informar("Captura indisponível.");
                        return;
                    }

                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");

                    link.href = url;
                    link.download =
                        "aether-frame-" + Date.now() + ".png";

                    document.body.appendChild(link);
                    link.click();
                    link.remove();

                    setTimeout(() => {
                        URL.revokeObjectURL(url);
                    }, 10000);

                    informar("Verifique seus downloads.");
                }, "image/png");
            }
            catch (erro) {
                informar("Captura não permitida neste dispositivo.");
            }
        });

        let inicio = null;
        let fim = null;
        let reproduzirTrecho = false;

        function atualizarMarcas() {
            $("ae-intervalo-v1").textContent =
                "IN: " +
                (inicio === null ? "--:--" : formatar(inicio)) +
                " / OUT: " +
                (fim === null ? "--:--" : formatar(fim));
        }

        $("ae-in-v1").addEventListener("click", () => {
            if (!duracao()) {
                informar("Importe um vídeo primeiro.");
                return;
            }

            inicio = video.currentTime;

            if (fim !== null && fim <= inicio) {
                fim = null;
            }

            atualizarMarcas();
            informar("IN marcado.");
        });

        $("ae-out-v1").addEventListener("click", () => {
            if (!duracao()) {
                informar("Importe um vídeo primeiro.");
                return;
            }

            if (inicio === null) {
                informar("Marque primeiro o IN.");
                return;
            }

            if (video.currentTime <= inicio) {
                informar("OUT deve ficar depois do IN.");
                return;
            }

            fim = video.currentTime;

            atualizarMarcas();
            informar("OUT marcado.");
        });

        $("ae-playtrecho-v1").addEventListener("click", () => {
            if (inicio === null || fim === null) {
                informar("Marque IN e OUT primeiro.");
                return;
            }

            reproduzirTrecho = true;
            video.currentTime = inicio;

            video.play().catch(() => {
                informar("Não foi possível reproduzir.");
            });
        });

        $("ae-limpar-v1").addEventListener("click", () => {
            inicio = null;
            fim = null;
            reproduzirTrecho = false;

            atualizarMarcas();
            informar("Marcas removidas.");
        });

        video.addEventListener("timeupdate", () => {
            if (
                reproduzirTrecho &&
                fim !== null &&
                video.currentTime >= fim
            ) {
                reproduzirTrecho = false;
                video.pause();
                video.currentTime = fim;

                informar("Fim do trecho.");
            }
        });

        video.addEventListener("loadedmetadata", () => {
            inicio = null;
            fim = null;
            reproduzirTrecho = false;

            atualizarMarcas();
        });

        console.log("AETHER FERRAMENTAS V1 ATIVADAS");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();