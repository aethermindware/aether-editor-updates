/* AETHER_EXCLUIR_PROJETO_V1 */

(() => {
    "use strict";

    const CHAVE = "aether_editor_projetos_v2";
    const BACKUP = "aether_editor_backup_exclusao_v1";

    function iniciar() {
        const lista = document.getElementById("projetos");

        if (!lista) return;

        const botao = document.createElement("button");

        botao.id = "aetherExcluirProjeto";
        botao.textContent = "🗑 Excluir projeto";
        botao.type = "button";

        botao.style.cssText = [
            "background:#a62235",
            "color:white",
            "padding:11px 16px",
            "border:1px solid #d55365",
            "border-radius:10px",
            "margin:12px 0",
            "cursor:pointer"
        ].join(";");

        lista.parentElement.insertBefore(botao, lista);

        botao.addEventListener("click", () => {
            let dados;

            try {
                dados = JSON.parse(
                    localStorage.getItem(CHAVE) || "[]"
                );
            } catch (_) {
                alert("Os projetos salvos possuem dados invalidos.");
                return;
            }

            let projetos;
            let formato;

            if (Array.isArray(dados)) {
                projetos = dados;
                formato = "array";
            } else if (
                dados &&
                Array.isArray(dados.projetos)
            ) {
                projetos = dados.projetos;
                formato = "objeto";
            } else {
                alert("Formato dos projetos nao reconhecido.");
                return;
            }

            if (!projetos.length) {
                alert("Nenhum projeto salvo.");
                return;
            }

            const nomes = projetos.map((projeto, i) => {
                const nome = (
                    projeto &&
                    typeof projeto === "object"
                ) ? (
                    projeto.nome ||
                    projeto.name ||
                    projeto.titulo ||
                    "Sem nome"
                ) : String(projeto);

                return `${i + 1} - ${nome}`;
            });

            const escolha = prompt(
                "QUAL PROJETO DESEJA EXCLUIR?\n\n" +
                nomes.join("\n") +
                "\n\nDigite o numero:"
            );

            if (escolha === null) return;

            const valor = escolha.trim();

            if (!/^\d+$/.test(valor)) {
                alert("Digite um numero valido.");
                return;
            }

            const indice = Number(valor) - 1;

            if (
                !Number.isSafeInteger(indice) ||
                indice < 0 ||
                indice >= projetos.length
            ) {
                alert("Projeto nao encontrado.");
                return;
            }

            const projeto = projetos[indice];

            const nome = (
                projeto &&
                typeof projeto === "object"
            ) ? (
                projeto.nome ||
                projeto.name ||
                projeto.titulo ||
                "Sem nome"
            ) : String(projeto);

            if (!confirm(
                `Excluir definitivamente o projeto "${nome}"?\n\n` +
                "Esta operacao nao pode ser desfeita pelo editor."
            )) return;

            try {
                // Preserva um backup local antes de excluir.
                localStorage.setItem(
                    BACKUP,
                    localStorage.getItem(CHAVE) || "[]"
                );

                projetos.splice(indice, 1);

                const resultado =
                    formato === "array"
                    ? projetos
                    : { ...dados, projetos };

                localStorage.setItem(
                    CHAVE,
                    JSON.stringify(resultado)
                );

                alert(
                    `Projeto "${nome}" excluido.\n` +
                    "Backup local criado."
                );

                location.reload();
            } catch (erro) {
                alert(
                    "Nao foi possivel excluir: " + erro.message
                );
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded", iniciar
        );
    } else {
        iniciar();
    }
})();