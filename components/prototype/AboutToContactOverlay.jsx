"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContactMainStage, ContactClosing } from "./ContactStage";

// Fase 5 — terceira passada: mesma arquitetura de cortina (preservada,
// não mexida — ver histórico do arquivo), refinamento visual dos
// frames intermediários + microentrada tipográfica do Contact. Arquivo
// NOVO — não é AboutToContactTransition.jsx reescrito no lugar, porque
// aquele arquivo também é usado por /prototype/hero-to-contact (rota
// antiga, fora de escopo). Este componente só existe em
// /prototype/final.
//
// Modelo (inalterado): as células só SOBEM (cobrem o About que está
// saindo, bordas primeiro). `#contact` começa oculto (opacity:0). Só
// quando a cobertura chega a 100% é que o Contact é revelado, com o
// canvas escondido no frame seguinte — `FILL_COLOR` idêntico ao bg-ink
// real, troca imperceptível.
//
// Refinamentos 1–4 (densidade/ruído/ranqueamento/janela) — mesmos de
// HowIBuildToAboutOverlay.jsx, ver comentários lá pro raciocínio
// completo. Aqui só os números mudam (grid um pouco menos denso que o
// lado About, que é mais rico em detalhe fino — Contact é um fundo mais
// liso).
//
// Refinamento 5 — microentrada tipográfica: antes, todo o conteúdo do
// Contact (headline inteira + subtexto + CTA + system lines) aparecia
// de uma vez, junto com a troca do overlay — "sem personalidade". Agora
// o WRAPPER (`#contact`, bg-ink) continua trocando instantaneamente
// junto com a cortina (tem que ser instantâneo — é o que torna a troca
// imperceptível, a cor bate exata). Mas o CONTEÚDO tipográfico por
// dentro dele ganha uma entrada própria, só disparada DEPOIS que a
// cortina já sumiu por completo: linha por linha do headline (clip via
// overflow-hidden + yPercent 100→0 + fechamento de letter-spacing),
// stagger curto entre linhas, depois subtexto, depois CTA, depois
// system-lines como detalhe final. Nada disso é scroll-scrubbed — é uma
// timeline GSAP de um tiro, exatamente como pedido ("a microanimação só
// começa depois que o dither já saiu completamente").
const FILL_COLOR = "#0A0B0D";
const EFFECT_START = 0.4;
const COVER_DONE_AT = 0.9;
const COVERAGE_BASELINE = 0.12;
const COVERAGE_GAMMA = 0.55;

function hash(col, row) {
  const s = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function coverageAt(p) {
  const t = gsap.utils.clamp(0, 1, (p - EFFECT_START) / (COVER_DONE_AT - EFFECT_START));
  if (t <= 0) return 0;
  return COVERAGE_BASELINE + (1 - COVERAGE_BASELINE) * Math.pow(t, COVERAGE_GAMMA);
}

export default function AboutToContactOverlay({ reducedMotion }) {
  const canvasRef = useRef(null);
  const gridRef = useRef(null);
  const stRef = useRef(null);
  const revealedRef = useRef(false);
  const entranceTlRef = useRef(null);
  const contactWrapRef = useRef(null);

  const eyebrowRef = useRef(null);
  const headlineRef = useRef(null);
  const headlineLineRefs = useRef([]);
  const subtextRef = useRef(null);
  const ctaRef = useRef(null);
  const systemLinesRef = useRef(null);
  const ambientRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) {
      gsap.set(contactWrapRef.current, { opacity: 1 });
      gsap.set(headlineRef.current, { opacity: 1 });
      gsap.set(headlineLineRefs.current, { yPercent: 0, opacity: 1, letterSpacing: "0em" });
      gsap.set([eyebrowRef.current, subtextRef.current, ctaRef.current, systemLinesRef.current, ambientRef.current], { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(contactWrapRef.current, { opacity: 0 });
    gsap.set(headlineRef.current, { opacity: 1 });
    gsap.set(headlineLineRefs.current, { yPercent: 100, opacity: 0, letterSpacing: "0.05em" });
    gsap.set([subtextRef.current, ctaRef.current], { y: 12 });
    gsap.set([eyebrowRef.current, subtextRef.current, ctaRef.current, systemLinesRef.current, ambientRef.current], { opacity: 0 });

    function resetEntrance() {
      entranceTlRef.current?.kill();
      gsap.set(headlineLineRefs.current, { yPercent: 100, opacity: 0, letterSpacing: "0.05em" });
      gsap.set(subtextRef.current, { y: 12 });
      gsap.set(ctaRef.current, { y: 12 });
      gsap.set([eyebrowRef.current, subtextRef.current, ctaRef.current, systemLinesRef.current, ambientRef.current], { opacity: 0 });
    }

    function playEntrance() {
      entranceTlRef.current?.kill();
      const tl = gsap.timeline();
      tl.to(eyebrowRef.current, { opacity: 1, duration: 0.25, ease: "power1.out" })
        .to(
          headlineLineRefs.current,
          { yPercent: 0, opacity: 1, letterSpacing: "0em", duration: 0.5, stagger: 0.08, ease: "power3.out" },
          ">-0.1",
        )
        .to(subtextRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, ">-0.15")
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, ">-0.12")
        .to(systemLinesRef.current, { opacity: 1, duration: 0.3, ease: "power1.out" }, ">-0.05")
        .to(ambientRef.current, { opacity: 0.7, duration: 0.6, ease: "power1.out" }, "<");
      entranceTlRef.current = tl;
    }

    const ctx = gsap.context(() => {
      const canvas = canvasRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      function buildGrid() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const isDesktop = w >= 768;
        const cols = isDesktop ? 48 : 30;
        const cellSize = w / cols;
        const rows = Math.ceil(h / cellSize);
        const cx = (cols - 1) / 2;
        const cy = (rows - 1) / 2;
        const maxDist = Math.hypot(cx, cy) || 1;
        const cells = [];
        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const dist = Math.hypot(col - cx, row - cy) / maxDist;
            const threshold = (1 - dist) * 0.55 + hash(col, row) * 0.45;
            cells.push({ col, row, threshold });
          }
        }
        cells.sort((a, b) => a.threshold - b.threshold);
        gridRef.current = { cells, cellSize, cols, rows };
      }

      function setRevealed(next) {
        if (revealedRef.current === next) return;
        revealedRef.current = next;
        gsap.set(contactWrapRef.current, { opacity: next ? 1 : 0 });
        gsap.set(canvas, { opacity: next ? 0 : 1 });
        if (next) {
          playEntrance();
        } else {
          resetEntrance();
        }
      }

      function draw(p) {
        const grid = gridRef.current;
        if (!grid) return;

        const coverage = coverageAt(p);
        setRevealed(coverage >= 1);

        if (revealedRef.current) return;

        const ctx2d = canvas.getContext("2d");
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        ctx2d.save();
        ctx2d.scale(dpr, dpr);
        ctx2d.fillStyle = FILL_COLOR;
        const cutoff = Math.round(coverage * grid.cells.length);
        for (let i = 0; i < cutoff; i += 1) {
          const cell = grid.cells[i];
          ctx2d.fillRect(cell.col * grid.cellSize, cell.row * grid.cellSize, grid.cellSize + 0.6, grid.cellSize + 0.6);
        }
        ctx2d.restore();
      }

      function computeRange() {
        const igLink = document.querySelector('#about a[href*="instagram.com"]');
        if (!igLink || !contactWrapRef.current) return null;
        const linkAbsBottom = igLink.getBoundingClientRect().bottom + window.scrollY;
        // Início: usar o fundo do link como scrollY diretamente estaria
        // errado — scrollY == linkAbsBottom é o exato instante em que o
        // fundo do link toca o TOPO da viewport (prestes a sair), não
        // enquanto ele ainda está visível. Recuar 55% de uma viewport
        // garante que o link ainda esteja confortavelmente na tela
        // (metade inferior) quando o efeito começa.
        const start = linkAbsBottom - window.innerHeight * 0.55;
        const contactTop = contactWrapRef.current.getBoundingClientRect().top + window.scrollY;
        // A troca (Contact revelado) acontece em COVER_DONE_AT (90%) do
        // progresso deste trigger. Pra ninguém perceber a troca, a
        // posição real de scroll nesse instante precisa coincidir com o
        // topo do Contact já estar no topo da viewport (+ 5% de folga).
        const targetScrollAt90 = contactTop + window.innerHeight * 0.05;
        const end = start + Math.max(200, targetScrollAt90 - start) / COVER_DONE_AT;
        return { start, end };
      }

      function createTrigger() {
        stRef.current?.kill();
        const range = computeRange();
        if (!range) return;
        stRef.current = ScrollTrigger.create({
          start: range.start,
          end: range.end,
          scrub: 0.3,
          onUpdate: (self) => draw(self.progress),
        });
        // kill() para o trigger antigo mas não desfaz o que os gsap.set()
        // dele já tinham aplicado (canvas/contactWrapRef ficam presos no
        // último estado antes da troca) — sem sincronizar aqui, recriar o
        // trigger enquanto o usuário já rolou além do reveal deixava
        // canvas e conteúdo em opacidades contraditórias (tela preta com
        // #contact já em opacity:1 por baixo).
        draw(stRef.current.progress);
      }

      buildGrid();
      draw(0);
      createTrigger();

      function handleResize() {
        buildGrid();
        createTrigger();
      }
      window.addEventListener("resize", handleResize);

      // Mesma causa raiz já tratada em SelectedWorkStage.jsx/
      // HowIBuildStage.jsx: se a fonte custom (ou o próprio pin deles)
      // ainda não tinha assentado no instante deste useLayoutEffect,
      // computeRange() mede contactTop/linkAbsBottom em cima de um layout
      // temporariamente maior/menor que o final — o trigger fica com
      // start/end errados pro resto da vida útil do componente (são
      // números fixos, não expressões "top top" que ScrollTrigger.refresh()
      // recalcularia sozinho). Sem isso, o range podia pedir um scroll que
      // o documento corrigido nunca mais alcança — o Contact nunca chega a
      // revelar (fica preso em opacity 0, tela preta).
      //
      // Um único delay fixo não é confiável aqui: SelectedWorkStage/
      // HowIBuildStage podem levar uma quantidade variável de tempo pra
      // assentar (depende de fonte, layout, dispositivo). Em vez de
      // adivinhar um número, observa a altura real do documento — se ela
      // ainda está mudando, o layout acima do Contact ainda não terminou;
      // só recalcula createTrigger() quando ela para de mudar (debounce).
      let settleTimer;
      let lastHeight = document.body.scrollHeight;
      const heightObserver = new ResizeObserver(() => {
        const height = document.body.scrollHeight;
        if (height === lastHeight) return;
        lastHeight = height;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
          buildGrid();
          createTrigger();
        }, 120);
      });
      heightObserver.observe(document.body);

      return () => {
        clearTimeout(settleTimer);
        heightObserver.disconnect();
        window.removeEventListener("resize", handleResize);
        stRef.current?.kill();
        entranceTlRef.current?.kill();
      };
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true" />
      <div id="contact" ref={contactWrapRef} className="relative h-svh w-full overflow-hidden bg-ink">
        <ContactMainStage
          eyebrowRef={eyebrowRef}
          headlineRef={headlineRef}
          headlineLineRefs={headlineLineRefs}
          subtextRef={subtextRef}
          ctaRef={ctaRef}
          systemLinesRef={systemLinesRef}
          ambientRef={ambientRef}
          reducedMotion={reducedMotion}
        />
      </div>
      <ContactClosing reducedMotion={reducedMotion} />
    </>
  );
}
