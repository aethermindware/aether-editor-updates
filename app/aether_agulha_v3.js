(() => {
"use strict";

if (window.AETHER_AGULHA_V3) return;

function iniciar() {
    const video = document.getElementById("video");
    const scroll = document.getElementById("timelineScroll");
    const timeline = scroll?.querySelector(".ae-timeline");
    const ruler = timeline?.querySelector(".ae-ruler");
    const head = timeline?.querySelector("#playhead");

    if (!video || !scroll || !timeline || !ruler || !head) {
        console.warn("AETHER AGULHA V3: elementos ausentes");
        return;
    }

    window.AETHER_AGULHA_V3 = true;

    const css = document.createElement("style");

    css.textContent = `
        #playhead {
            cursor: ew-resize !important;
            touch-action: none !important;
            pointer-events: auto !important;
            z-index: 60 !important;
        }

        #playhead .aether-hitbox-v3 {
            position: absolute;
            left: -15px;
            top: -15px;
            width: 32px;
            height: 48px;
            cursor: ew-resize;
            touch-action: none;
        }

        #playhead .aether-etiqueta-v3 {
            position: absolute;
            left: 18px;
            top: -27px;
            padding: 3px 7px;
            border-radius: 5px;
            background: #d83959;
            color: white;
            font: 12px Arial, sans-serif;
            white-space: nowrap;
            pointer-events: none;
            display: none;
        }

        #playhead.aether-arrastando-v3 .aether-etiqueta-v3,
        #playhead:hover .aether-etiqueta-v3,
        #playhead:focus-visible .aether-etiqueta-v3 {
            display: block;
        }

        .ae-ruler {
            cursor: crosshair;
            touch-action: none;
        }
    `;

    document.head.appendChild(css);

    if (getComputedStyle(timeline).position === "static") {
        timeline.style.position = "relative";
    }

    const hit = document.createElement("span");
    hit.className = "aether-hitbox-v3";
    hit.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "aether-etiqueta-v3";

    head.append(hit, label);

    head.tabIndex = 0;
    head.setAttribute("role", "slider");
    head.setAttribute("aria-label", "Agulha de reproducao");
    head.setAttribute("aria-valuemin", "0");

    const limitar = (n, a, b) =>
        Math.max(a, Math.min(b, n));

    const duracao = () =>
        Number.isFinite(video.duration) && video.duration > 0
            ? video.duration
            : 0;

    function formatar(n) {
        const s = Math.floor(Math.max(0, n || 0));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const ss = String(s % 60).padStart(2, "0");

        return h
            ? h + ":" + String(m).padStart(2, "0") + ":" + ss
            : String(m).padStart(2, "0") + ":" + ss;
    }

    let arrastando = false;
    let retomar = false;
    let frame = 0;

    function geometria() {
        const r = ruler.getBoundingClientRect();
        const t = timeline.getBoundingClientRect();

        return {
            inicio: r.left - t.left,
            largura: r.width
        };
    }

    function atualizar() {
        const d = duracao();
        const g = geometria();

        if (g.largura <= 0) return;

        const atual = limitar(video.currentTime || 0, 0, d);

        const x = g.inicio +
            (d ? atual / d : 0) * g.largura;

        head.style.left = x + "px";

        label.textContent =
            formatar(atual) + " / " + formatar(d);

        head.setAttribute(
            "aria-valuemax", String(Math.ceil(d))
        );

        head.setAttribute(
            "aria-valuenow", String(Math.round(atual))
        );

        head.setAttribute(
            "aria-valuetext", formatar(atual)
        );

        if (!arrastando && !video.paused) {
            const esquerda = scroll.scrollLeft;
            const direita = esquerda + scroll.clientWidth;

            if (x > direita - 35 || x < esquerda + 25) {
                scroll.scrollLeft = Math.max(
                    0, x - scroll.clientWidth * 0.4
                );
            }
        }
    }

    function posicionar(e) {
        const d = duracao();
        const r = ruler.getBoundingClientRect();

        if (!d || !r.width) return;

        const percentual = limitar(
            (e.clientX - r.left) / r.width,
            0,
            1
        );

        try {
            video.currentTime = percentual * d;
        } catch (erro) {
            console.warn(erro);
        }

        atualizar();
    }

    function comecar(e) {
        if (e.pointerType === "mouse" && e.button !== 0) {
            return;
        }

        if (!duracao()) return;

        e.preventDefault();
        e.stopPropagation();

        arrastando = true;
        retomar = !video.paused;

        if (retomar) video.pause();

        head.classList.add("aether-arrastando-v3");

        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (_) {}

        posicionar(e);
    }

    function mover(e) {
        if (!arrastando) return;

        e.preventDefault();
        posicionar(e);
    }

    function terminar() {
        if (!arrastando) return;

        arrastando = false;

        head.classList.remove("aether-arrastando-v3");

        if (retomar) {
            video.play().catch(() => {});
        }

        retomar = false;
        atualizar();
    }

    [head, ruler].forEach(el => {
        el.addEventListener("pointerdown", comecar);
        el.addEventListener("pointermove", mover);
        el.addEventListener("pointerup", terminar);
        el.addEventListener("pointercancel", terminar);
        el.addEventListener("lostpointercapture", terminar);
    });

    head.addEventListener("keydown", e => {
        let destino = null;

        if (e.key === "ArrowRight") {
            destino = (video.currentTime || 0) +
                (e.shiftKey ? 5 : 1);
        }

        if (e.key === "ArrowLeft") {
            destino = (video.currentTime || 0) -
                (e.shiftKey ? 5 : 1);
        }

        if (e.key === "Home") destino = 0;
        if (e.key === "End") destino = duracao();

        if (destino === null || !duracao()) return;

        e.preventDefault();

        video.currentTime = limitar(
            destino, 0, duracao()
        );

        atualizar();
    });

    function animar() {
        frame = 0;

        if (video.paused || video.ended) return;

        atualizar();
        frame = requestAnimationFrame(animar);
    }

    video.addEventListener("play", () => {
        if (!frame) {
            frame = requestAnimationFrame(animar);
        }
    });

    video.addEventListener("pause", () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        atualizar();
    });

    [
        "timeupdate",
        "seeking",
        "loadedmetadata",
        "durationchange",
        "ended"
    ].forEach(nome => {
        video.addEventListener(nome, atualizar);
    });

    window.addEventListener("resize", atualizar);

    if (typeof ResizeObserver !== "undefined") {
        new ResizeObserver(atualizar).observe(ruler);
    }

    atualizar();

    console.log("AETHER AGULHA V3 ATIVADA");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
} else {
    iniciar();
}
})();