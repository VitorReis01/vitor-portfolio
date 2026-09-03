"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fase 5 — terceira passada: mesma arquitetura de cortina (preservada,
// não mexida — ver histórico do arquivo), só refinamento visual dos
// frames intermediários. Arquivo NOVO — não é
// HowIBuildToAboutTransition.jsx reescrito no lugar, porque aquele
// arquivo também é usado por /prototype/hero-to-about e
// /prototype/hero-to-contact (rotas antigas, fora de escopo). Este
// componente só existe em /prototype/final.
//
// Modelo (inalterado): as células só SOBEM (cobrem ENTREGAR, bordas
// primeiro). O `#about` real começa oculto (opacity:0, controlado
// daqui). Só quando a cobertura chega a 100% é que o About é revelado,
// no MESMO onUpdate, com o canvas escondido no frame seguinte —
// `FILL_COLOR` idêntico ao bg-paper real (`#F3F1EA`), troca
// imperceptível.
//
// Refinamento 1 — densidade: 22 colunas (desktop) gerava fragmentos
// grandes, leitura de tabuleiro/checkerboard. Subiu pra 52 (desktop) /
// 32 (mobile) — fragmentos bem menores, leitura de "dado se
// materializando".
//
// Refinamento 2 — ruído orgânico: o noise anterior (`(col*13+row*29)%17`)
// é aritmética modular — período curto, gera diagonais visíveis em
// escada. Trocado por hash pseudo-aleatório (seno de alta frequência,
// técnica clássica de shader) — sem periodicidade perceptível, clusters
// mais orgânicos.
//
// Refinamento 3 — cobertura por RANQUEAMENTO, não por comparação direta
// de threshold: célula por célula com `rise >= cell.threshold` (versão
// anterior) faz o primeiro frame perceptível depender de quantas
// células têm threshold baixíssimo — normalmente poucas, isoladas (lia
// como "1 quadrado, depois 2, depois 3"). Agora as células são
// ORDENADAS por threshold uma vez (grid-build), e a cada frame revela
// as primeiras N = coverage% do total — controle EXATO da % de tela
// coberta, independente de como os thresholds se distribuem. Com
// `COVERAGE_BASELINE`, o primeiro frame em que o efeito aparece já
// revela ~12% das células de uma vez (bloco perceptível), não 1 célula
// isolada — e o expoente (`COVERAGE_GAMMA` < 1) faz o resto subir
// rápido, achatando perto do fim.
//
// Refinamento 4 — janela de rampa comprimida: EFFECT_START subiu de
// 0.1 pra 0.4 (COVER_DONE_AT continua 0.9 — mesma posição de troca,
// mesmo cálculo de sincronização com o About real). O trecho em que o
// dither está "parcialmente formado" agora é 0.5 do progresso do
// trigger (era 0.8) — mesma distância física de scroll (ainda calibrada
// pra bater com a posição real do About), mas a transição visual em si
// é mais curta e decisiva dentro dela.
const FILL_COLOR = "#F3F1EA";
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

export default function HowIBuildToAboutOverlay({ reducedMotion }) {
  const canvasRef = useRef(null);
  const gridRef = useRef(null);
  const stRef = useRef(null);
  const revealedRef = useRef(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const aboutEl = document.getElementById("about");

    if (reducedMotion) {
      if (aboutEl) gsap.set(aboutEl, { opacity: 1 });
      return undefined;
    }

    if (aboutEl) gsap.set(aboutEl, { opacity: 0 });

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
        const cols = isDesktop ? 52 : 32;
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
        // Ordenadas uma vez — bordas primeiro (threshold baixo), centro
        // por último — permite revelar por ranqueamento (ver coverageAt).
        cells.sort((a, b) => a.threshold - b.threshold);
        gridRef.current = { cells, cellSize, cols, rows };
      }

      function setRevealed(next) {
        if (revealedRef.current === next) return;
        revealedRef.current = next;
        if (aboutEl) gsap.set(aboutEl, { opacity: next ? 1 : 0 });
        gsap.set(canvas, { opacity: next ? 0 : 1 });
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
        const howBuildPin = ScrollTrigger.getAll().find((st) => st.pin && st.pin.id === "how-i-build");
        if (!howBuildPin || !aboutEl) return null;
        // Início: ainda DENTRO do pin de HowIBuildStage — a linha de
        // fechamento ("De uma ideia a um sistema funcionando.") termina
        // de entrar em 82–100% do progresso dele (ver
        // HowIBuildStage.jsx, closingRef), então 88% garante ENTREGAR +
        // linha de fechamento já totalmente visíveis quando o efeito
        // começa — sobreposição real, não um handoff no fim do pin.
        const start = howBuildPin.start + (howBuildPin.end - howBuildPin.start) * 0.88;
        const aboutTop = aboutEl.getBoundingClientRect().top + window.scrollY;
        // A troca (About revelado) acontece em COVER_DONE_AT (90%) do
        // progresso deste trigger. Pra ninguém perceber a troca, a
        // posição real de scroll nesse instante precisa coincidir com o
        // topo do About já estar no topo da viewport (+ 5% de folga) —
        // resolvendo scrollY(0.9) = aboutTop + innerHeight*0.05 pra
        // `end`.
        const targetScrollAt90 = aboutTop + window.innerHeight * 0.05;
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
      }

      buildGrid();
      draw(0);
      createTrigger();

      function handleResize() {
        buildGrid();
        createTrigger();
      }
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        stRef.current?.kill();
      };
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true" />;
}
