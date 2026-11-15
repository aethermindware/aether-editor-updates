/* AETHER_AUTO_UPDATE_V1 */
(() => {
    "use strict";

    const VERSAO = "0.1.0";
    const CHAVE = "aether_auto_manifest_url_v1";

    function versaoValida(v) {
        return /^\d+\.\d+\.\d+$/.test(String(v));
    }

    function comparar(a, b) {
        const x = a.split(".").map(Number);
        const y = b.split(".").map(Number);

        for (let i = 0; i < 3; i++) {
            if (x[i] !== y[i]) return x[i] - y[i];
        }

        return 0;
    }

    function enderecoSeguro(valor) {
        try {
            const url = new URL(valor);
            return url.protocol === "https:";
        } catch (_) {
            return false;
        }
    }

    function aviso(texto, link) {
        const anterior = document.getElementById("aeAutoAviso");
        if (anterior) anterior.remove();

        const caixa = document.createElement("div");
        caixa.id = "aeAutoAviso";
        caixa.style.cssText =
            "position:fixed;top:12px;right:12px;z-index:999999;" +
            "background:#14243b;color:white;padding:16px;" +
            "border:1px solid #4a78bc;border-radius:12px;" +
            "max-width:320px;box-shadow:0 8px 24px #0008";

        const mensagem = document.createElement("p");
        mensagem.textContent = texto;
        caixa.appendChild(mensagem);

        if (link) {
            const baixar = document.createElement("button");
            baixar.textContent = "Baixar atualizacao";
            baixar.onclick = () => {
                window.open(link, "_blank", "noopener,noreferrer");
            };
            caixa.appendChild(baixar);
        }

        const fechar = document.createElement("button");
        fechar.textContent = "Fechar";
        fechar.style.marginLeft = "8px";
        fechar.onclick = () => caixa.remove();
        caixa.appendChild(fechar);

        document.body.appendChild(caixa);
    }

    async function verificar(manual = false) {
        /* AETHER_AUTO_UPDATE_HTTPS_V12 */
        const endereco = "https://aethermindware.github.io/aether-editor-updates/versao.json";

        if (!endereco) {
            if (manual) {
                aviso("Configure primeiro o endereco HTTPS das atualizacoes.");
            }
            return;
        }

        if (!enderecoSeguro(endereco)) {
            aviso("Endereco de atualizacoes invalido.");
            return;
        }

        try {
            const resposta = await fetch(endereco, {
                cache: "no-store"
            });

            if (!resposta.ok) {
                throw new Error("HTTP " + resposta.status);
            }

            const dados = await resposta.json();
            const nova = String(dados.versao || "");
            const apk = String(dados.apk_url || dados.apk || "");

            if (!versaoValida(nova)) {
                throw new Error("Versao invalida no manifesto.");
            }

            if (comparar(nova, VERSAO) > 0) {
                if (!enderecoSeguro(apk)) {
                    throw new Error("Link HTTPS do APK ausente ou invalido.");
                }

                aviso(
                    "Nova versao do Aether Editor: " + nova +
                    "\nVersao atual: " + VERSAO,
                    apk
                );
            } else if (manual) {
                aviso("O Aether Editor esta atualizado: " + VERSAO);
            }
        } catch (erro) {
            if (manual) {
                aviso("Falha ao verificar atualizacoes: " + erro.message);
            }
            console.warn("Aether Auto Update:", erro);
        }
    }

    function configurar() {
        const atual = localStorage.getItem(CHAVE) || "";

        const novo = prompt(
            "Endereco HTTPS do arquivo versao.json:",
            atual
        );

        if (novo === null) return;

        if (!enderecoSeguro(novo.trim())) {
            aviso("Informe um endereco HTTPS valido.");
            return;
        }

        localStorage.setItem(CHAVE, novo.trim());
        aviso("Atualizacoes automaticas configuradas.");
        verificar(true);
    }

    function iniciar() {
        const botao = document.createElement("button");
        botao.textContent = "Atualizacoes automaticas";
        botao.title = "Configurar e verificar atualizacoes";
        botao.style.cssText =
            "position:fixed;bottom:14px;right:14px;" +
            "z-index:9990;background:#205cba;color:white;" +
            "padding:10px;border-radius:9px;border:1px solid #7daafa";

        botao.addEventListener("click", configurar);
        document.body.appendChild(botao);

        verificar(false);

        // Verificacao a cada 6 horas enquanto aberto
        setInterval(() => verificar(false), 6 * 60 * 60 * 1000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();