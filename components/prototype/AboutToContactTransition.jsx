"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContactMainStage, ContactClosing } from "./ContactStage";

// Fase 4 — protótipo 05, revisão de geometria. Correção pedida: o About
// que o dark consome precisa estar PINADO ocupando 100% da viewport, com
// um Canvas2D full-viewport por cima desenhando as células escuras
// progressivamente sobre ele — não uma seção preta em fluxo normal
// subindo por trás de uma clara.
//
// Correção seguinte (esta): a primeira versão desse "pano de fundo"
// repetia a composição inteira do About real (retrato + "Designer.
// Developer. Problem solver." + corpo) — no scroll real isso lia como o
// About aparecendo DUAS vezes. O usuário só pode ver aquele texto uma
// vez. Por isso o pano de fundo agora é uma superfície lisa (bg-paper,
// sem texto, sem retrato) — só a cor que o dither consome, sem repetir
// nenhum conteúdo do About verdadeiro.
//
// Como AboutStage.jsx/PolarityTransition.jsx são congelados (não podem
// ser editados) e o #about real já rolou pra fora da tela normalmente
// antes deste pin começar, essa superfície não é uma referência ao About
// real — é só a cor de fundo dele. Nota para integração futura: quando
// isto virar parte da página principal de verdade, o ideal é que o
// About real permaneça fisicamente pinado nessa cena (via prop/ref
// direto), em vez de qualquer substituto — nem texto duplicado, nem
// superfície lisa.
//
// Estrutura da cena pinada — uma só, altura fixa em 100vh, tudo o resto
// absoluto dentro dela: superfície off-white lisa → canvas (transparente
// até as células desenharem) → ContactMainStage (headline/CTA, só entra
// depois que o canvas já cobriu tudo). O encerramento (ContactClosing)
// vive FORA do pin, em fluxo normal — só aparece depois que o pin solta,
// deliberadamente um beat narrativo separado da entrada do CTA.
//
// Correção de zona morta (auditoria pós-integração, simétrica à mesma
// correção em HowIBuildToAboutTransition.jsx): depois que o About real
// termina (link @vitor.systems), sobrava o padding inferior dele (ver
// pb-12 em AboutStage.jsx) seguido de um hold "About intacto" de 15% da
// distância deste pin — uma faixa off-white estática, sem nenhuma
// mudança visível, antes da primeira célula escura acender. Mesma
// técnica de fechamento usada do outro lado: mede em runtime o respiro
// vazio real abaixo do conteúdo de `#about` (id estável) e puxa este
// wrapper pra cima só nessa medida, com teto de segurança — nunca
// alcança o texto/link real. O hold em si também foi encurtado (15% →
// 3%) já que o About mostrado aqui é o real, já lido pelo usuário, não
// precisa de uma pausa extra pra "assentar".

const GRID_COLS_DESKTOP = 34;
const GRID_COLS_MOBILE = 18;
const FILL_COLOR = "#0b0d10";

export default function AboutToContactTransition({ reducedMotion }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const ctaRef = useRef(null);
  const systemLinesRef = useRef(null);
  const ambientRef = useRef(null);
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) {
      gsap.set(
        [eyebrowRef.current, headlineRef.current, subtextRef.current, ctaRef.current, systemLinesRef.current, ambientRef.current],
        { opacity: 1, y: 0 },
      );
      return undefined;
    }

    function closeTrailingGap() {
      const aboutEl = document.getElementById("about");
      if (!aboutEl || !wrapRef.current) return;
      const sectionRect = aboutEl.getBoundingClientRect();
      // O label "about" é o primeiro filho; o grid foto+texto é o
      // último — cobre a coluna mais alta das duas automaticamente
      // (altura de linha de grid = a maior das colunas).
      const content = aboutEl.lastElementChild;
      const contentRect = content ? content.getBoundingClientRect() : sectionRect;
      const trailingGap = sectionRect.bottom - contentRect.bottom;
      const pullUp = Math.max(0, Math.min(trailingGap, sectionRect.height * 0.3));
      gsap.set(wrapRef.current, { marginTop: pullUp > 0 ? -pullUp : 0 });
    }

    const ctx = gsap.context(() => {
      closeTrailingGap();

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const canvas = canvasRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      function buildGrid() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const cols = isDesktop ? GRID_COLS_DESKTOP : GRID_COLS_MOBILE;
        const cellSize = w / cols;
        const rows = Math.ceil(h / cellSize);
        const cx = (cols - 1) / 2;
        const cy = (rows - 1) / 2;
        const maxDist = Math.hypot(cx, cy) || 1;
        const cells = [];
        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const dist = Math.hypot(col - cx, row - cy) / maxDist; // 0 centro, 1 borda
            const noise = ((col * 13 + row * 29) % 17) / 17;
            // limiar baixo perto da borda (acende cedo), alto no centro
            // (acende por último) — bordas consomem primeiro, centro por
            // último, exatamente a leitura pedida.
            const threshold = (1 - dist) * 0.55 + noise * 0.45;
            cells.push({ col, row, threshold });
          }
        }
        gridRef.current = { cells, cellSize, cols, rows };
      }

      function draw(p) {
        const grid = gridRef.current;
        if (!grid) return;
        const ctx2d = canvas.getContext("2d");
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        ctx2d.save();
        ctx2d.scale(dpr, dpr);
        ctx2d.fillStyle = FILL_COLOR;
        for (let i = 0; i < grid.cells.length; i += 1) {
          const cell = grid.cells[i];
          if (p >= cell.threshold) {
            ctx2d.fillRect(cell.col * grid.cellSize, cell.row * grid.cellSize, grid.cellSize + 0.6, grid.cellSize + 0.6);
          }
        }
        ctx2d.restore();
      }

      buildGrid();
      draw(0);

      gsap.set(eyebrowRef.current, { opacity: 0 });
      gsap.set(headlineRef.current, { opacity: 0, y: 24 });
      gsap.set(subtextRef.current, { opacity: 0, y: 18 });
      gsap.set(ctaRef.current, { opacity: 0, y: 14 });
      gsap.set(systemLinesRef.current, { opacity: 0 });
      gsap.set(ambientRef.current, { opacity: 0 });

      // 150vh desktop / 110vh mobile — distância mantida, só a
      // redistribuição das fases mudou (plateau final alongado).
      const distance = Math.round(window.innerHeight * (isDesktop ? 1.5 : 1.1));

      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: `+=${distance}`,
        pin: true,
        scrub: 0.4,
        onUpdate: (self) => {
          const p = self.progress;

          // 0–3%    About intacto — hold quase instantâneo, só o
          //         suficiente pra não escurecer no exato frame em que
          //         o pin trava.
          // 3–65%   clusters escuros consomem o About pelas bordas.
          // 65–72%  full dark, silêncio — nada mais muda.
          const fillT = gsap.utils.clamp(0, 1, (p - 0.03) / (0.65 - 0.03));
          draw(fillT);

          // 72–84%  headline + subtexto + CTA entram (Contact Main).
          // 84–100% landing moment — plateau alongado. Nenhuma
          //         propriedade visual importante continua interpolando;
          //         o pin só segura o scroll até o gesto do usuário
          //         terminar, dando tempo real de leitura antes do
          //         ContactClosing.
          const contentT = gsap.utils.clamp(0, 1, (p - 0.72) / (0.84 - 0.72));
          gsap.set(eyebrowRef.current, { opacity: contentT });
          gsap.set(headlineRef.current, { opacity: contentT, y: 24 * (1 - contentT) });
          gsap.set(subtextRef.current, { opacity: contentT, y: 18 * (1 - contentT) });
          gsap.set(ctaRef.current, { opacity: contentT, y: 14 * (1 - contentT) });
          gsap.set(systemLinesRef.current, { opacity: contentT });
          gsap.set(ambientRef.current, { opacity: contentT * 0.7 });
        },
      });

      function handleResize() {
        closeTrailingGap();
        buildGrid();
        ScrollTrigger.refresh();
      }
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, wrapRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="relative">
      <div id="contact" className="relative h-svh w-full overflow-hidden bg-ink">
        <div className="absolute inset-0 bg-paper" aria-hidden="true" />

        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20" aria-hidden="true" />

        <ContactMainStage
          eyebrowRef={eyebrowRef}
          headlineRef={headlineRef}
          subtextRef={subtextRef}
          ctaRef={ctaRef}
          systemLinesRef={systemLinesRef}
          ambientRef={ambientRef}
          reducedMotion={reducedMotion}
        />
      </div>

      <ContactClosing reducedMotion={reducedMotion} />
    </div>
  );
}
