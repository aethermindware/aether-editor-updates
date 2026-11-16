(() => {
    "use strict";

    if (window.AETHER_AUDIO_PLAYBACK_V1) return;

    const video = document.getElementById("video");
    if (!video) return;

    window.AETHER_AUDIO_PLAYBACK_V1 = true;

    let musica = null;
    let urlMusica = null;

    function avisar(mensagem) {
        console.log("Aether Audio:", mensagem);

        const status =
            document.getElementById("ae-ref-status") ||
            document.getElementById("status");

        if (status) status.textContent = mensagem;
    }

    function ehAudio(arquivo) {
        return !!arquivo &&
            (
                arquivo.type.startsWith("audio/") ||
                /\.(mp3|m4a|wav|ogg|aac|webm)$/i
                    .test(arquivo.name)
            );
    }

    function sincronizar(forcar = false) {
        if (!musica) return;

        const tempo = Number(video.currentTime) || 0;
        const duracao = musica.duration;

        if (!Number.isFinite(duracao) || duracao <= 0) {
            return;
        }

        if (tempo >= duracao) {
            musica.pause();
            return;
        }

        const diferenca = Math.abs(
            musica.currentTime - tempo
        );

        if (forcar || diferenca > 0.35) {
            try {
                musica.currentTime = Math.max(0, tempo);
            } catch (_) {}
        }

        const velocidade =
            Number(video.playbackRate) || 1;

        if (velocidade > 0) {
            musica.playbackRate = velocidade;
        }
    }

    function reproduzirMusica() {
        if (!musica) return;

        sincronizar();

        if (
            Number.isFinite(musica.duration) &&
            video.currentTime >= musica.duration
        ) {
            return;
        }

        if (!musica.paused) return;

        musica.play().catch(erro => {
            console.warn("Aether Audio:", erro);

            avisar(
                "A musica nao iniciou. Toque em Play novamente."
            );
        });
    }

    function pausarMusica() {
        if (musica) musica.pause();
    }

    function carregarMusica(arquivo) {
        if (musica) {
            musica.pause();
            musica.removeAttribute("src");
            musica.load();
        }

        if (urlMusica) {
            URL.revokeObjectURL(urlMusica);
        }

        urlMusica = URL.createObjectURL(arquivo);

        musica = new Audio();
        musica.preload = "auto";
        musica.volume = 1;
        musica.muted = false;
        musica.src = urlMusica;

        musica.addEventListener(
            "loadedmetadata",
            () => {
                sincronizar(true);

                avisar(
                    "Musica pronta: " + arquivo.name
                );

                if (!video.paused) {
                    reproduzirMusica();
                }
            }
        );

        musica.addEventListener(
            "error",
            () => {
                avisar(
                    "Erro ao abrir o audio. Verifique o formato."
                );
            }
        );

        musica.load();

        avisar(
            "Carregando musica: " + arquivo.name
        );
    }

    // Captura o arquivo antes do importador original
    // limpar o campo de selecao.
    document.addEventListener(
        "change",
        evento => {
            const entrada = evento.target;

            if (
                !(entrada instanceof HTMLInputElement) ||
                entrada.type !== "file"
            ) return;

            const arquivos = Array.from(
                entrada.files || []
            );

            const audio = arquivos.find(ehAudio);

            if (audio) carregarMusica(audio);
        },
        true
    );

    // A musica acompanha a reproducao do video.
    video.addEventListener(
        "play", reproduzirMusica
    );

    video.addEventListener(
        "playing", reproduzirMusica
    );

    video.addEventListener(
        "pause", pausarMusica
    );

    video.addEventListener(
        "waiting", pausarMusica
    );

    video.addEventListener(
        "ended", pausarMusica
    );

    video.addEventListener(
        "timeupdate",
        () => sincronizar()
    );

    video.addEventListener(
        "seeking",
        () => sincronizar(true)
    );

    video.addEventListener(
        "seeked",
        () => {
            sincronizar(true);

            if (!video.paused) {
                reproduzirMusica();
            }
        }
    );

    video.addEventListener(
        "ratechange",
        () => sincronizar()
    );

    video.addEventListener(
        "emptied", pausarMusica
    );

    // Ajuda os navegadores que exigem
    // um toque do usuario para liberar audio.
    document.addEventListener(
        "click",
        evento => {
            if (!(evento.target instanceof Element)) {
                return;
            }

            const botao = evento.target.closest(
                "#ae-play-inferior-v1, " +
                "#aether-km-play-v1, " +
                "#playBtn, [data-act='play']"
            );

            if (
                botao &&
                video.paused &&
                musica &&
                (video.currentSrc || video.src)
            ) {
                reproduzirMusica();
            }
        },
        true
    );

    window.addEventListener(
        "pagehide",
        () => {
            if (musica) musica.pause();

            if (urlMusica) {
                URL.revokeObjectURL(urlMusica);
                urlMusica = null;
            }
        }
    );

    console.log(
        "AETHER: AUDIO PLAYBACK V1 ATIVO"
    );
})();