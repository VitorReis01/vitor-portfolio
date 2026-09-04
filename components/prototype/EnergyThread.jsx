"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fio condutor global — nasce visualmente na mesma zona de energia do
// Hero (ciano, margem esquerda, altura da linha dos olhos) e desce pela
// página inteira como um único traço, revelado conforme o scroll (não
// antes). Uma cabeça brilhante marca a ponta revelada; nós discretos em
// cada seção pulsam uma vez quando o traço "chega" ali. Sistema único
// montado uma vez em PrototypeExperience — nenhuma seção individual
// precisa saber que ele existe (lidas só pelo id que já têm).
//
// Seções com fundo claro (bg-paper) diluem o traço pra ciano brilhante
// não brigar com texto escuro sobre fundo claro — ver LIGHT_SECTION_IDS.
const SECTION_IDS = ["hero", "work", "capabilities", "how-i-build", "about", "contact"];
const DEFAULT_LIGHT_SECTION_IDS = new Set(["how-i-build", "about"]);
const THREAD_COLOR = "150, 225, 255";

// lightSectionIds é opcional — sem ele, comportamento idêntico ao de
// sempre (usado pela página principal, onde How I Build ainda é claro).
// Protótipos que já migraram How I Build pro universo dark (Fase 4)
// passam seu próprio Set (ex.: só "about") sem precisar tocar aqui.
export default function EnergyThread({ reducedMotion, lightSectionIds = DEFAULT_LIGHT_SECTION_IDS }) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const nodesRootRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    // Resolvido por travessia do próprio DOM (não por um ref passado do
    // pai): o ref do wrapper às vezes ainda não está anexado quando este
    // layout effect roda (a árvore do App Router intercala o commit de
    // formas que não garantem a ordem entre componentes irmãos/pai aqui),
    // mas o nó do próprio EnergyThread sempre está — subir a partir dele
    // é garantido.
    const wrapper = svgRef.current?.closest("[data-experience-root]");
    if (!wrapper) return undefined;

    let removeResize;
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      function measure() {
        const wrapperRect = wrapper.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const totalHeight = wrapper.scrollHeight;
        const gutterPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gutter")) || 24;
        const threadX = gutterPx * 0.42;

        const sections = SECTION_IDS.map((id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const top = rect.top + scrollY - (wrapperRect.top + scrollY);
          return { id, top, bottom: top + rect.height, light: lightSectionIds.has(id) };
        }).filter(Boolean);

        return { totalHeight, threadX, sections };
      }

      function buildPathD(totalHeight, threadX) {
        // Leve ondulação (não uma régua reta) — um traço de energia, não
        // uma linha técnica rígida. Amplitude pequena, período longo.
        const amplitude = 9;
        const step = 140;
        const points = [];
        for (let y = 0; y <= totalHeight; y += step) {
          const x = threadX + Math.sin(y / 260) * amplitude;
          points.push([x, y]);
        }
        if (points[points.length - 1][1] < totalHeight) points.push([threadX, totalHeight]);

        let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
        for (let i = 1; i < points.length; i += 1) {
          const [px, py] = points[i - 1];
          const [cx, cy] = points[i];
          const midY = (py + cy) / 2;
          d += ` Q ${px.toFixed(1)} ${midY.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
        }
        return d;
      }

      function build() {
        const svg = svgRef.current;
        const path = pathRef.current;
        // O próprio SVG é absolute inset-0 sem overflow:hidden no
        // ancestral, então sua altura conta para wrapper.scrollHeight —
        // se não zerarmos antes de medir, um refresh só re-lê a altura
        // (possivelmente errada) que ELE MESMO deixou no build anterior e
        // nunca consegue encolher de volta, só crescer.
        svg.setAttribute("height", "0");
        const { totalHeight, threadX, sections } = measure();
        svg.setAttribute("height", totalHeight);
        svg.setAttribute("viewBox", `0 0 100 ${totalHeight}`);
        path.setAttribute("d", buildPathD(totalHeight, threadX));

        // Gradiente do stroke: ciano nas seções escuras, quase apagado nas
        // seções claras (how-i-build + about) — computado em frações do
        // comprimento total, não hardcoded.
        const gradient = svgRef.current.querySelector("#thread-gradient");
        gradient.innerHTML = "";
        const stops = [];
        stops.push({ offset: 0, alpha: 0.55 });
        sections.forEach((s) => {
          if (!s.light) return;
          const fadeIn = Math.max(0, (s.top - 40) / totalHeight);
          const start = s.top / totalHeight;
          const end = s.bottom / totalHeight;
          const fadeOut = Math.min(1, (s.bottom + 40) / totalHeight);
          stops.push({ offset: fadeIn, alpha: 0.55 }, { offset: start, alpha: 0.06 }, { offset: end, alpha: 0.06 }, { offset: fadeOut, alpha: 0.55 });
        });
        stops.push({ offset: 1, alpha: 0.55 });
        stops
          .sort((a, b) => a.offset - b.offset)
          .forEach(({ offset, alpha }) => {
            const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop.setAttribute("offset", `${(offset * 100).toFixed(2)}%`);
            stop.setAttribute("stop-color", `rgba(${THREAD_COLOR}, ${alpha})`);
            gradient.appendChild(stop);
          });

        return { totalHeight, threadX, sections };
      }

      let { totalHeight, threadX, sections } = build();

      if (reducedMotion) {
        // Pose final: traço inteiro já revelado, sem loop, sem nós
        // animados — só a forma, estática.
        gsap.set(pathRef.current, { opacity: 1 });
        pathRef.current.style.strokeDasharray = "none";
        gsap.set(headRef.current, { opacity: 0 });
        return;
      }

      const pathLength = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength, opacity: 1 });

      const scrollProgress = ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
        onUpdate: (self) => {
          const offset = pathLength * (1 - self.progress);
          pathRef.current.style.strokeDashoffset = offset;
          const point = pathRef.current.getPointAtLength(pathLength - offset);
          gsap.set(headRef.current, { x: point.x, y: point.y });
        },
      });

      // Respiração da cabeça luminosa — sempre viva, independente do scroll.
      gsap.to(headRef.current, { scale: 1.3, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "center" });

      // Nós por seção: pulso + partículas, uma vez, quando o scroll chega ali.
      // Guardado por id pra o refresh de fontes (abaixo) poder reposicionar
      // cada nó sem recriá-lo.
      const nodeBySectionId = {};
      sections.forEach((s) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const node = document.createElement("div");
        node.style.position = "absolute";
        node.style.left = `${threadX}px`;
        node.style.top = "0px";
        node.style.width = "0px";
        node.style.height = "0px";
        node.style.pointerEvents = "none";
        nodesRootRef.current.appendChild(node);
        gsap.set(node, { y: s.top + 6 });
        nodeBySectionId[s.id] = node;

        const glow = document.createElement("div");
        glow.style.position = "absolute";
        glow.style.left = "-7px";
        glow.style.top = "-7px";
        glow.style.width = "14px";
        glow.style.height = "14px";
        glow.style.borderRadius = "9999px";
        glow.style.background = `radial-gradient(circle, rgba(${THREAD_COLOR},0.9) 0%, rgba(${THREAD_COLOR},0) 70%)`;
        node.appendChild(glow);
        gsap.set(glow, { opacity: 0, scale: 0.4 });

        const particles = Array.from({ length: 4 }, (_, i) => {
          const p = document.createElement("div");
          p.style.position = "absolute";
          p.style.left = "-1.5px";
          p.style.top = "-1.5px";
          p.style.width = "3px";
          p.style.height = "3px";
          p.style.borderRadius = "9999px";
          p.style.background = `rgba(${THREAD_COLOR},0.9)`;
          node.appendChild(p);
          gsap.set(p, { opacity: 0 });
          return { el: p, angle: (Math.PI * 2 * i) / 4 + Math.random() * 0.6 };
        });

        ScrollTrigger.create({
          trigger: el,
          start: "top 68%",
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            tl.to(glow, { opacity: 1, scale: 1, duration: 0.18, ease: "power2.out" })
              .to(glow, { opacity: 0.5, scale: 1.6, duration: 0.7, ease: "sine.out" }, ">-0.05");
            particles.forEach(({ el: p, angle }) => {
              tl.to(
                p,
                {
                  opacity: 1,
                  x: Math.cos(angle) * 16,
                  y: Math.sin(angle) * 16,
                  duration: 0.55,
                  ease: "power2.out",
                },
                "<"
              ).to(p, { opacity: 0, duration: 0.3 }, ">-0.15");
            });

            // Evento genérico — qualquer seção pode escutar e reagir do
            // seu próprio jeito (ex.: HowIBuildSection pulsa a icon cloud).
            // O EnergyThread continua não sabendo nada sobre o conteúdo
            // de cada seção.
            window.dispatchEvent(new CustomEvent("energy-thread-node", { detail: { id: s.id } }));
          },
        });
      });

      // Reconstrói tudo que depende de totalHeight/sections (SVG, path,
      // gradiente e a posição de cada nó) e reposiciona os nós já criados
      // acima pros novos s.top — sem isso, um refresh só corrigia o SVG e
      // deixava os nós de pulso presos na posição antiga.
      function refreshLayout() {
        const rebuilt = build();
        totalHeight = rebuilt.totalHeight;
        threadX = rebuilt.threadX;
        sections = rebuilt.sections;
        sections.forEach((s) => {
          const node = nodeBySectionId[s.id];
          if (node) gsap.set(node, { y: s.top + 6 });
        });
        ScrollTrigger.refresh();
      }

      let resizeTimer;
      function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refreshLayout, 200);
      }
      window.addEventListener("resize", handleResize);

      // Mesma causa raiz do refresh defensivo já usado em
      // SelectedWorkStage.jsx/HowIBuildStage.jsx: se a fonte custom
      // (--font-display) ou os pins deles ainda não tinham assentado no
      // instante deste useLayoutEffect, o "+=300%" dos pins de Selected
      // Work/How I Build é calculado em cima de uma altura temporariamente
      // errada — o SVG do EnergyThread tinha sua altura (medida de
      // `wrapper.scrollHeight` naquele instante) congelada no `build()`
      // inicial e nunca reagia à correção. Sendo um `absolute inset-0` sem
      // overflow:hidden no ancestral, ficava maior que o documento real e
      // por isso passava a DITAR o scrollHeight da página inteira.
      //
      // Um único `document.fonts.ready` não é suficiente — o tempo até os
      // pins de outros componentes assentarem varia. Em vez de adivinhar
      // um delay, observa a altura real do wrapper: só refaz o layout
      // quando ela muda de verdade, e para sozinho quando estabiliza
      // (build() já zera a própria altura do SVG antes de medir, então
      // não conta a si mesmo — sem isso o observer nunca convergiria,
      // só cresceria).
      let settleTimer;
      let lastHeight = wrapper.scrollHeight;
      const heightObserver = new ResizeObserver(() => {
        const height = wrapper.scrollHeight;
        if (height === lastHeight) return;
        lastHeight = height;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(refreshLayout, 120);
      });
      heightObserver.observe(wrapper);

      removeResize = () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(resizeTimer);
        clearTimeout(settleTimer);
        heightObserver.disconnect();
      };
    }, wrapper);

    return () => {
      if (removeResize) removeResize();
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      <svg
        ref={svgRef}
        className="absolute left-0 top-0 h-full w-[100px] overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="thread-gradient" x1="0" y1="0" x2="0" y2="1" />
          <filter id="thread-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>
        <path
          ref={pathRef}
          fill="none"
          stroke="url(#thread-gradient)"
          strokeWidth="1.2"
          strokeLinecap="round"
          filter="url(#thread-glow)"
          opacity="0"
        />
        <circle ref={headRef} r="3.2" fill={`rgba(${THREAD_COLOR},0.95)`} filter="url(#thread-glow)" />
      </svg>
      <div ref={nodesRootRef} className="absolute left-0 top-0 h-full w-full" />
    </div>
  );
}
