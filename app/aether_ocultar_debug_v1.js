(() => {
    "use strict";

    if (window.AETHER_OCULTAR_DEBUG_V1) return;
    window.AETHER_OCULTAR_DEBUG_V1 = true;

    function ocultarDebug() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        let node;
        const candidatos = [];

        while ((node = walker.nextNode())) {
            const valor = (node.nodeValue || "").toUpperCase();

            if (!valor.includes("CLIQUE DETECTADO")) {
                continue;
            }

            let elemento = node.parentElement;
            let escolhido = null;

            while (
                elemento &&
                elemento !== document.body &&
                elemento !== document.documentElement
            ) {
                const texto = elemento.textContent.toUpperCase();
                const rect = elemento.getBoundingClientRect();

                if (
                    texto.includes("CLIQUE DETECTADO") &&
                    texto.includes("ERROS:") &&
                    rect.height > 0 &&
                    rect.height <= 120 &&
                    rect.width >= 100 &&
                    rect.top < 200 &&
                    !elemento.querySelector(
                        "button,input,video,canvas"
                    )
                ) {
                    escolhido = elemento;
                }

                elemento = elemento.parentElement;
            }

            if (escolhido) {
                candidatos.push(escolhido);
            }
        }

        for (const elemento of candidatos) {
            elemento.style.setProperty(
                "display", "none", "important"
            );
        }
    }

    let agendado = false;

    function verificar() {
        if (agendado) return;

        agendado = true;

        requestAnimationFrame(() => {
            agendado = false;
            ocultarDebug();
        });
    }

    function iniciar() {
        ocultarDebug();

        new MutationObserver(verificar).observe(
            document.body,
            {
                childList: true,
                subtree: true,
                characterData: true
            }
        );

        console.log("AETHER: painel visual de debug ocultado");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();