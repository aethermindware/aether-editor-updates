(() => {
"use strict";

if (window.AETHER_MENU_VIDEO_V2) return;

function iniciar() {
    const root = document.getElementById("editor");
    const timeline = document.getElementById("timelineScroll");
    const video = document.getElementById("video");

    const menu = root?.querySelector(".aether-pro-menu-v2");

    if (!root || !timeline || !video || !menu) {
        console.warn("Aether: menu contextual indisponivel");
        return;
    }

    if (menu.querySelector(".ae-menu-video-v2")) return;

    window.AETHER_MENU_VIDEO_V2 = true;

    const estilo = document.createElement("style");

    estilo.textContent = `
        /* Remover fundo circular ao selecionar video */
        #editor .aether-pro-menu-v2.ae-video-ativo-v2 {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 270px !important;
            height: auto !important;
            min-height: 0 !important;
            aspect-ratio: auto !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
            overflow: visible !important;
        }

        /* Ocultar botoes antigos somente no modo video */
        #editor .aether-pro-menu-v2.ae-video-ativo-v2
        > button {
            display: none !important;
        }

        /* Painel substitui o circulo */
        #editor .aether-pro-menu-v2
        .ae-menu-video-v2 {
            display: none !important;
        }

        #editor .aether-pro-menu-v2.ae-video-ativo-v2
        .ae-menu-video-v2 {
            position: relative !important;
            inset: auto !important;
            transform: none !important;
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            height: auto !important;
            padding: 5px !important;
            gap: 9px !important;
            background: transparent !important;
        }

        #editor .ae-menu-video-v2 .ae-video-titulo-v2 {
            color: #d8e7ff;
            font: 600 12px system-ui, sans-serif;
            text-align: center;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        #editor .ae-menu-video-v2 .ae-video-grid-v2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
        }

        /* Sobrescrever estilos do antigo menu circular */
        #editor .aether-pro-menu-v2.ae-video-ativo-v2
        .ae-menu-video-v2 button {
            position: static !important;
            top: auto !important;
            left: auto !important;
            transform: none !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            height: 44px !important;
            min-width: 0 !important;
            min-height: 0 !important;
            padding: 6px !important;
            margin: 0 !important;
            border: 1px solid #496587 !important;
            border-radius: 10px !important;
            background: #253954 !important;
            color: white !important;
            font: 600 11px system-ui, sans-serif !important;
            cursor: pointer !important;
        }

        #editor .aether-pro-menu-v2.ae-video-ativo-v2
        .ae-menu-video-v2 .ae-voltar-v2 {
            background: #162842 !important;
            height: 34px !important;
        }

        #editor .ae-menu-video-v2 .ae-status-v2 {
            min-height: 14px;
            color: #a7c8f3;
            font: 11px system-ui, sans-serif;
            text-align: center;
        }
    `;

    document.head.appendChild(estilo);

    const painel = document.createElement("div");
    painel.className = "ae-menu-video-v2";

    const voltar = document.createElement("button");
    voltar.type = "button";
    voltar.className = "ae-voltar-v2";
    voltar.textContent = "← Voltar";

    const titulo = document.createElement("div");
    titulo.className = "ae-video-titulo-v2";
    titulo.textContent = "Vídeo selecionado";

    const grade = document.createElement("div");
    grade.className = "ae-video-grid-v2";

    const status = document.createElement("div");
    status.className = "ae-status-v2";

    function criarBotao(texto, callback) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = texto;
        botao.addEventListener("click", callback);
        grade.appendChild(botao);
        return botao;
    }

    function fechar() {
        menu.classList.remove("ae-video-ativo-v2");
        status.textContent = "";
    }

    function acionar(nome) {
        const original = root.querySelector(
            '[data-act="' + nome + '"]'
        );

        if (original) {
            original.click();
            fechar();
        } else {
            status.textContent = "Ferramenta indisponível.";
        }
    }

    criarBotao("✂ Dividir", () => acionar("split"));
    criarBotao("🗑 Excluir", () => acionar("remove"));

    const volumes = [1, 0.5, 0];
    let indiceVolume = 0;

    const botaoVolume = criarBotao("🔊 Volume", () => {
        indiceVolume = (indiceVolume + 1) % volumes.length;

        const valor = volumes[indiceVolume];

        video.volume = valor;
        video.muted = valor === 0;

        botaoVolume.textContent =
            "🔊 " + Math.round(valor * 100) + "%";

        status.textContent = "Volume da prévia";
    });

    const velocidades = [1, 1.25, 1.5, 2, 0.5];
    let indiceVelocidade = 0;

    const botaoVelocidade =
        criarBotao("⏩ 1×", () => {
            indiceVelocidade =
                (indiceVelocidade + 1) % velocidades.length;

            const valor = velocidades[indiceVelocidade];

            video.playbackRate = valor;
            botaoVelocidade.textContent = "⏩ " + valor + "×";

            status.textContent = "Velocidade da prévia";
        });

    voltar.addEventListener("click", fechar);

    painel.append(voltar, titulo, grade, status);
    menu.appendChild(painel);

    // Identificar somente clipes de video na timeline
    timeline.addEventListener("click", evento => {
        if (!(evento.target instanceof Element)) return;

        const clipe = evento.target.closest(
            "#faixa, .ae-clip, .clip"
        );

        if (!clipe || !timeline.contains(clipe)) return;

        if (clipe.closest(
            "#audioTrack, #layerTrack, #textTrack"
        )) return;

        const faixa = clipe.closest(".ae-track");

        if (faixa) {
            const rotulo = faixa.querySelector(
                ".ae-track-label"
            );

            if (rotulo) {
                const texto = rotulo.textContent
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase();

                if (!texto.includes("video")) return;
            }
        }

        const classes = String(clipe.className || "")
            .toLowerCase();

        if (/\baudio\b|\bimage\b|\btext\b/.test(classes)) {
            return;
        }

        // Ignorar clipe vazio, sem video importado.
        if (!video.currentSrc && !video.getAttribute("src")) {
            return;
        }

        titulo.textContent = (
            clipe.textContent || "Vídeo selecionado"
        ).trim().slice(0, 34);

        status.textContent = "";
        menu.classList.add("ae-video-ativo-v2");
    });

    document.addEventListener("click", evento => {
        if (!(evento.target instanceof Element)) return;

        if (evento.target.closest(
            '#homeBtn, [data-act="back"]'
        )) {
            fechar();
        }
    });

    console.log("AETHER MENU VIDEO V2 ATIVADO");
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded", iniciar, { once: true }
    );
} else {
    iniciar();
}
})();