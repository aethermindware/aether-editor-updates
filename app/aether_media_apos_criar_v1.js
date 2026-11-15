(() => {
    "use strict";

    if (window.AETHER_MEDIA_APOS_CRIAR_V1) return;

    window.AETHER_MEDIA_APOS_CRIAR_V1 = true;

    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    function botaoCriar(botao) {
        const ids = [
            "createProject",
            "criarProjeto",
            "btnCriarProjeto",
            "confirmarCriacaoProjeto"
        ];

        if (ids.includes(botao.id)) return true;

        const nome = normalizar(botao.textContent);

        if (
            nome === "criar projeto" ||
            nome === "criar e editar"
        ) {
            return true;
        }

        if (
            nome === "criar" &&
            botao.closest(
                "#newProject, #novoProjeto, [data-page='novo-projeto']"
            )
        ) {
            return true;
        }

        return false;
    }

    function visivel(elemento) {
        return !!elemento &&
            !elemento.hidden &&
            elemento.getClientRects().length > 0;
    }

    document.addEventListener("click", (evento) => {
        if (!(evento.target instanceof Element)) return;

        const botao = evento.target.closest(
            "button, [role='button']"
        );

        if (!botao || !botaoCriar(botao)) return;

        // O projeto deve estar aberto antes de importar.
        const editor = [
            document.getElementById("editor"),
            document.getElementById("editorPage")
        ].find(visivel);

        if (!editor) return;

        const seletor =
            document.getElementById("arquivo") ||
            document.getElementById("pickVideo");

        if (!seletor || seletor.type !== "file") return;

        // Permitir selecionar o mesmo arquivo novamente.
        seletor.value = "";

        // Aproveitar o clique do usuario para abrir a midia.
        seletor.click();
    });

    console.log(
        "AETHER: IMPORTACAO APOS CRIAR PROJETO ATIVADA"
    );
})();