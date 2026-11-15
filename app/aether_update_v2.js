/* AETHER UPDATE V2 - VERIFICADOR DE VERSOES */

(() => {
"use strict";

const VERSAO_ATUAL = "0.1.0";
const CHAVE = "aether_update_config_v2";

const padrao = {
    url: "",
    verificar: true
};

function carregar() {
    try {
        return {...padrao, ...JSON.parse(
            localStorage.getItem(CHAVE) || "{}"
        )};
    } catch (_) {
        return {...padrao};
    }
}

let config = carregar();
let atualizacao = null;

const estilo = document.createElement("style");

estilo.textContent = `
#aeUpdateBtn {
 background:#2563eb;color:white;
 padding:9px;border:0;border-radius:9px;
 cursor:pointer;font:inherit
}
#aeUpdatePainel {
 position:fixed;inset:0;z-index:9999;
 background:#000b;display:none;
 align-items:center;justify-content:center;
 padding:16px;color:white;font-family:Arial,sans-serif
}
#aeUpdatePainel.aberto {display:flex}
#aeUpdateCard {
 width:min(440px,100%);max-height:90vh;
 overflow:auto;background:#172033;
 border:1px solid #40516d;border-radius:16px;
 padding:22px
}
#aeUpdateCard input[type=url] {
 width:100%;padding:11px;margin:10px 0;
 color:white;background:#0e1728;
 border:1px solid #465675;border-radius:8px
}
#aeUpdateCard button {
 padding:11px;margin:5px 4px 5px 0;
 background:#2563eb;border:0;border-radius:8px;
 color:white;cursor:pointer
}
#aeUpdateCard p {line-height:1.5}
`;

document.head.appendChild(estilo);

const botao = document.createElement("button");
botao.id = "aeUpdateBtn";
botao.textContent = "Atualizações";

const cabecalho = document.querySelector("header");

if (cabecalho) {
    cabecalho.appendChild(botao);
} else {
    document.body.prepend(botao);
}

const fundo = document.createElement("div");
fundo.id = "aeUpdatePainel";

fundo.innerHTML = `
<div id="aeUpdateCard" role="dialog"
 aria-modal="true" aria-label="Atualizações">
 <h2>Aether Update V2</h2>
 <p>Versão instalada: <strong>0.1.0</strong></p>
 <p id="aeUpdateStatus">Aguardando verificação.</p>

 <label for="aeUpdateUrl">
 Endereço HTTPS do manifesto de atualizações
 </label>
 <input id="aeUpdateUrl" type="url"
 placeholder="https://exemplo.com/versao.json">

 <label>
 <input id="aeUpdateAuto" type="checkbox">
 Verificar automaticamente ao abrir
 </label>

 <div style="margin-top:16px">
 <button id="aeUpdateSalvar">Salvar</button>
 <button id="aeUpdateVerificar">Verificar agora</button>
 <button id="aeUpdateBaixar" hidden>Baixar atualização</button>
 <button id="aeUpdateFechar">Fechar</button>
 </div>
</div>
`;

document.body.appendChild(fundo);

const $ = id => document.getElementById(id);

$("aeUpdateUrl").value = config.url;
$("aeUpdateAuto").checked = config.verificar;

function status(mensagem) {
    $("aeUpdateStatus").textContent = mensagem;
}

function versaoValida(valor) {
    return typeof valor === "string" &&
        /^\d+\.\d+\.\d+$/.test(valor);
}

function comparar(a,b) {
    const x = a.split(".").map(Number);
    const y = b.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
        if (x[i] > y[i]) return 1;
        if (x[i] < y[i]) return -1;
    }
    return 0;
}

async function verificar() {
    $("aeUpdateBaixar").hidden = true;
    atualizacao = null;

    const url = config.url.trim();

    if (!url) {
        status("Configure o endereço do servidor de atualizações.");
        return;
    }

    if (!url.startsWith("https://")) {
        status("O servidor precisa utilizar HTTPS.");
        return;
    }

    status("Verificando atualizações...");

    try {
        const resposta = await fetch(url, {
            cache:"no-store",
            redirect:"error"
        });

        if (!resposta.ok) {
            throw new Error("HTTP " + resposta.status);
        }

        const dados = await resposta.json();

        if (!versaoValida(dados.versao)) {
            throw new Error("Versão inválida no manifesto.");
        }

        if (comparar(dados.versao, VERSAO_ATUAL) <= 0) {
            status("Você já está na versão mais recente.");
            return;
        }

        const destino = new URL(dados.apk_url, url);

        if (destino.protocol !== "https:") {
            throw new Error("Link do APK precisa usar HTTPS.");
        }

        atualizacao = destino.href;

        status("Nova versão disponível: " + dados.versao);
        $("aeUpdateBaixar").hidden = false;

    } catch (erro) {
        status("Falha na verificação: " + erro.message);
    }
}

$("aeUpdateSalvar").onclick = () => {
    config.url = $("aeUpdateUrl").value.trim();
    config.verificar = $("aeUpdateAuto").checked;

    try {
        localStorage.setItem(CHAVE, JSON.stringify(config));
        status("Configurações salvas.");
    } catch (_) {
        status("Não foi possível salvar as configurações.");
    }
};

$("aeUpdateVerificar").onclick = verificar;

$("aeUpdateBaixar").onclick = () => {
    if (atualizacao) {
        window.open(atualizacao, "_blank", "noopener,noreferrer");
    }
};

botao.onclick = () => fundo.classList.add("aberto");

$("aeUpdateFechar").onclick = () => {
    fundo.classList.remove("aberto");
};

fundo.addEventListener("click", evento => {
    if (evento.target === fundo) {
        fundo.classList.remove("aberto");
    }
});

if (config.verificar && config.url) {
    verificar();
}

})();
