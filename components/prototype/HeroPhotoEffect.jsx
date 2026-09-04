"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { adjustColor, luminance } from "@/lib/canvasArt/imageAdjustments";
import { RENDER_MODES } from "@/lib/canvasArt/renderModes";
import { applyVignette, applyBloom, applyGrain, applyGlitchSlices } from "@/lib/canvasArt/postEffects";
import { cellShimmer, flicker as flickerAt, damp } from "@/lib/canvasArt/animation";

// Hero visual do site — a arte final já pronta e aprovada
// (`minha-foto-dev.webp`: rosto, fundo preto, partículas e linha ciano já
// compostos) é usada como ÚNICA fonte. Este componente não recorta, não
// reposiciona e não recria nada da composição — só reinterpreta os
// pixels dessa imagem numa grade de dither fina e adiciona vida em cima:
// shimmer lento, partículas próprias, glitch raro e reveal por cursor.
//
// WebP lossless, não PNG: pixels decodificados 100% idênticos (verificado
// byte a byte em RGBA), 38,9% menor (1008KB → 616KB), zero metadata.

const PHOTO_SRC = "/media/hero/minha-foto-dev.webp";

// Resolução de processamento (grade de células) — desacoplada da
// resolução de exibição. Cells em ~4px nesse espaço já lêem como "dither
// fino" quando escalado pro tamanho real do Hero.
const PROCESS_WIDTH = 900;

// A base pontilhada não é redesenhada inteira a cada frame (caro demais
// numa grade de ~30 mil células) nem só de vez em quando (isso lia como
// "slideshow" — um snapshot novo a cada ~200ms, sem shimmer contínuo de
// verdade). Em vez disso, cada frame atualiza só uma fatia rotativa das
// células (clear+redesenho pontual, não o canvas inteiro): a cada
// CELL_BATCH_CYCLE frames o grid inteiro já passou por uma atualização,
// mas como fatias diferentes atualizam em momentos diferentes, o efeito
// visual é de shimmer contínuo, não de "piscar" em bloco.
const CELL_BATCH_CYCLE = 9;

const PARAMS = {
  renderMode: "dither",
  cellSize: 4,
  brightness: 0,
  contrast: 108,
  saturation: 100,
  grayscale: 0,
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function buildCellGrid(sourceCtx, srcW, srcH, cellSize) {
  const cols = Math.floor(srcW / cellSize);
  const rows = Math.floor(srcH / cellSize);
  const { data } = sourceCtx.getImageData(0, 0, srcW, srcH);

  function sampleAvg(x0, y0, w, h) {
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    const xEnd = Math.min(x0 + w, srcW);
    const yEnd = Math.min(y0 + h, srcH);
    for (let yy = y0; yy < yEnd; yy += 1) {
      for (let xx = x0; xx < xEnd; xx += 1) {
        const idx = (yy * srcW + xx) * 4;
        r += data[idx];
        g += data[idx + 1];
        b += data[idx + 2];
        n += 1;
      }
    }
    return n === 0 ? [0, 0, 0] : [r / n, g / n, b / n];
  }

  const cells = new Array(cols * rows);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellSize;
      const y = row * cellSize;
      const full = sampleAvg(x, y, cellSize, cellSize);
      cells[row * cols + col] = { col, row, x, y, full, lum: luminance(...full) / 255 };
    }
  }
  return { cells, cols, rows };
}

function buildAmbientDots(count) {
  const dots = new Array(count);
  for (let i = 0; i < count; i += 1) {
    dots[i] = {
      xFrac: Math.random(),
      yFrac: Math.random(),
      size: 0.5 + Math.random() * 1.2,
      speed: 0.02 + Math.random() * 0.05,
      drift: Math.random() * Math.PI * 2,
    };
  }
  return dots;
}

export default function HeroPhotoEffect({ reducedMotion, heroSectionRef }) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    let cancelled = false;
    let cleanupInner = () => {};

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const params = { ...PARAMS };
    if (isMobile) params.cellSize = Math.max(params.cellSize, 7);

    loadImage(PHOTO_SRC)
      .then((img) => {
        if (cancelled) return;

        const imgAspect = img.naturalWidth / img.naturalHeight;
        const rect = container.getBoundingClientRect();
        const displayWidth = rect.width || 1440;
        const displayHeight = rect.height || Math.round(displayWidth / imgAspect);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Fit "cover": preenche o Hero inteiro, sem barras de letterbox e
        // sem recortar o rosto — só o excedente (mínimo, a imagem já é
        // quase 16:9) sai fora nas bordas.
        const coverScale = Math.max(displayWidth / img.naturalWidth, displayHeight / img.naturalHeight);
        const drawnW = img.naturalWidth * coverScale;
        const drawnH = img.naturalHeight * coverScale;
        const offsetX = (displayWidth - drawnW) / 2;
        const offsetY = (displayHeight - drawnH) / 2;

        // Canvas fonte: a composição inteira, já no enquadramento final,
        // numa resolução de processamento própria (independente da
        // resolução de exibição).
        const processHeight = Math.round(PROCESS_WIDTH / (displayWidth / displayHeight));
        const sourceCanvas = document.createElement("canvas");
        sourceCanvas.width = PROCESS_WIDTH;
        sourceCanvas.height = processHeight;
        const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
        const processScale = PROCESS_WIDTH / displayWidth;
        sourceCtx.drawImage(img, offsetX * processScale, offsetY * processScale, drawnW * processScale, drawnH * processScale);

        const grid = buildCellGrid(sourceCtx, PROCESS_WIDTH, processHeight, params.cellSize);
        const cellScale = displayWidth / PROCESS_WIDTH;
        const drawMode = RENDER_MODES[params.renderMode] || RENDER_MODES.dither;

        const displayCanvas = document.createElement("canvas");
        displayCanvas.className = "block h-full w-full";
        displayCanvas.width = displayWidth * dpr;
        displayCanvas.height = displayHeight * dpr;
        displayCanvas.style.width = "100%";
        displayCanvas.style.height = "100%";
        container.appendChild(displayCanvas);
        const ctx = displayCanvas.getContext("2d");
        ctx.scale(dpr, dpr);

        // Base pontilhada em cache — atualizada em fatias rotativas, não
        // inteira a cada frame (ver comentário no topo do arquivo).
        const baseCanvas = document.createElement("canvas");
        baseCanvas.width = displayWidth;
        baseCanvas.height = displayHeight;
        const baseCtx = baseCanvas.getContext("2d");

        const adj = { brightness: params.brightness, contrast: params.contrast, saturation: params.saturation, grayscale: params.grayscale };

        // Célula "ciano" (linha dos olhos, reflexos azulados) — detectada
        // por cor, não por coordenada fixa (a linha é parte da imagem, não
        // um elemento sintético). Essas células recebem um pulso extra de
        // intensidade, lento, por cima do shimmer geral — é isso que lê
        // como "a linha respirando".
        function isCyanish(full) {
          return full[2] > full[0] + 14 && full[1] >= full[0] - 6;
        }

        function drawCell(cell, t) {
          // Sem gate de densidade aleatória aqui — o renderMode "dither" já
          // decide sozinho quais sub-células acendem (limiar de Bayer por
          // luminância). Uma segunda camada de corte estocástico por cima
          // disso, sobre uma imagem-fonte que já é esparsa por natureza, só
          // perdia dado (queixo/pescoço quase somem).
          const px = cell.x * cellScale;
          const py = cell.y * cellScale;
          const size = params.cellSize * cellScale;
          baseCtx.clearRect(px - 1, py - 1, size + 2, size + 2);
          if (cell.lum < 0.015) return;

          const shimmer = reducedMotion ? 0 : cellShimmer(t, cell.col, cell.row, 0.45, 0.065);
          const pulse = !reducedMotion && isCyanish(cell.full) ? Math.sin(t * 1.3 + cell.col * 0.05) * 0.14 : 0;
          const boost = (shimmer + pulse) * 255;

          // O shimmer/pulso afeta a LUMINÂNCIA usada no limiar de Bayer
          // (não só a cor) — é o que faz o padrão de pontos realmente
          // cintilar (sub-células acendendo/apagando), não só uma leve
          // variação de tom sobre um padrão sempre idêntico.
          const effectiveLum = Math.max(0, Math.min(1, cell.lum + shimmer + pulse));
          const [r, g, b] = adjustColor(...cell.full, adj);
          const finalColor = [
            Math.max(0, Math.min(255, r + boost)),
            Math.max(0, Math.min(255, g + boost)),
            Math.max(0, Math.min(255, b + boost)),
          ];

          drawMode(baseCtx, px, py, size, finalColor, effectiveLum);
        }

        function renderDitherBaseFull(t) {
          baseCtx.clearRect(0, 0, displayWidth, displayHeight);
          for (let i = 0; i < grid.cells.length; i += 1) drawCell(grid.cells[i], t);
        }

        let batchCursor = 0;
        function updateCellBatch(t) {
          const total = grid.cells.length;
          const batchSize = Math.ceil(total / CELL_BATCH_CYCLE);
          for (let n = 0; n < batchSize; n += 1) {
            drawCell(grid.cells[(batchCursor + n) % total], t);
          }
          batchCursor = (batchCursor + batchSize) % total;
        }

        // Subconjunto pequeno (a linha dos olhos, reflexos azulados) —
        // filtrado uma vez por cor, nunca por coordenada. Desenhado à
        // parte, todo frame (não na fatia rotativa), porque é o elemento
        // que mais precisa ler como "vivo": pulso + jitter horizontal +
        // faíscas raras.
        const cyanCells = grid.cells.filter((cell) => isCyanish(cell.full));

        const ambientDots = buildAmbientDots(isMobile ? 70 : 150);
        const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: 0, targetActive: 0 };

        // Interferência horizontal curta — distinta do glitch raro/maior
        // (applyGlitchSlices): mais frequente, bem mais breve, só um par
        // de faixas finas piscando, não um corte de imagem.
        const interference = { active: false, until: 0, y: 0, timer: 0, nextAt: 2.4 + Math.random() * 3 };

        function drawFrame(t) {
          ctx.clearRect(0, 0, displayWidth, displayHeight);
          ctx.fillStyle = "#040506";
          ctx.fillRect(0, 0, displayWidth, displayHeight);
          ctx.drawImage(baseCanvas, 0, 0);

          const cursorPxX = (pointer.x + 0.5) * displayWidth;
          const cursorPxY = (pointer.y + 0.5) * displayHeight;

          // Linha ciano dos olhos, viva todo frame (não na fatia rotativa):
          // respiração + jitter horizontal curto + faíscas raras. Continua
          // sem qualquer coordenada fixa — é literalmente o subconjunto de
          // células já detectadas como ciano por cor.
          if (!reducedMotion && cyanCells.length) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            for (let i = 0; i < cyanCells.length; i += 1) {
              const cell = cyanCells[i];
              const px = cell.x * cellScale;
              const py = cell.y * cellScale;
              const size = params.cellSize * cellScale;
              const breathe = 0.5 + 0.5 * Math.sin(t * 1.6 + cell.col * 0.08);
              const jitterX = Math.sin(t * 3.4 + i * 0.73) * 1.3;
              const sparkPhase = flickerAt(t, i, 2.1);
              const spark = sparkPhase > 0.94 ? (sparkPhase - 0.94) / 0.06 : 0;
              const alpha = 0.08 + breathe * 0.14 + spark * 0.55;
              ctx.fillStyle = `rgba(150,225,255,${alpha})`;
              ctx.fillRect(px + jitterX, py, size, size);
            }
            ctx.restore();
          }

          // Partículas ambiente — camada própria, discreta, deriva lenta +
          // pequeno deslocamento perto do cursor.
          ambientDots.forEach((dot, i) => {
            const baseX = dot.xFrac * displayWidth;
            const baseY = dot.yFrac * displayHeight;
            const driftX = reducedMotion ? 0 : Math.sin(t * dot.speed + dot.drift) * 5;
            const driftY = reducedMotion ? 0 : Math.cos(t * dot.speed * 0.8 + dot.drift) * 3;
            const dxToCursor = baseX - cursorPxX;
            const dyToCursor = baseY - cursorPxY;
            const distToCursor = Math.hypot(dxToCursor, dyToCursor);
            const push = pointer.active > 0.02 && distToCursor < 90 ? (90 - distToCursor) / 90 : 0;
            const tw = reducedMotion ? 0.5 : flickerAt(t, i, 0.45);
            // Cubo do flicker: passa mais tempo perto de 0 (quase some) do
            // que uma senoide crua — lê como "aparece/desaparece", não só
            // "pisca um pouco".
            const twSharp = tw * tw * tw;
            ctx.fillStyle = `rgba(180,215,235,${0.015 + twSharp * 0.22 + push * 0.22})`;
            ctx.fillRect(
              baseX + driftX + (dxToCursor / (distToCursor || 1)) * push * 6,
              baseY + driftY + (dyToCursor / (distToCursor || 1)) * push * 6,
              dot.size,
              dot.size
            );
          });

          // Reveal suave perto do cursor: mostra a imagem-fonte em fidelidade
          // total (não a versão pontilhada) numa máscara circular com borda
          // macia — não move nem recompõe nada, só "foca" localmente.
          if (pointer.active > 0.02) {
            const revealRadius = Math.min(displayWidth, displayHeight) * 0.16;
            const rings = 5;
            ctx.save();
            for (let i = rings; i >= 1; i -= 1) {
              const r = revealRadius * (i / rings);
              const alpha = pointer.active * 0.35 * (1 - i / rings) ** 1.6;
              if (alpha < 0.01) continue;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(cursorPxX, cursorPxY, r, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(img, offsetX, offsetY, drawnW, drawnH);
            }
            ctx.restore();
          }

          if (interference.active) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            const flick = 0.6 + 0.4 * Math.sin(t * 90);
            ctx.fillStyle = `rgba(170,230,255,${0.14 * flick})`;
            ctx.fillRect(0, interference.y, displayWidth, 1.4);
            ctx.fillStyle = `rgba(170,230,255,${0.07 * flick})`;
            ctx.fillRect(0, interference.y + 6, displayWidth, 1);
            ctx.restore();
          }

          applyVignette(ctx, displayWidth, displayHeight, 0.16);
          if (!reducedMotion) {
            applyBloom(ctx, displayCanvas, displayWidth, displayHeight, 0.1, 6);
            applyGrain(ctx, displayWidth, displayHeight, 0.03, t);
          }
        }

        // Primeiro frame sempre síncrono — não espera o primeiro rAF pra
        // mostrar algo. Reduced motion usa sempre o pass cheio (pose final
        // completa e estável, sem fatias desatualizadas de um loop que
        // nunca vai rodar).
        renderDitherBaseFull(0);
        drawFrame(0);

        if (reducedMotion) {
          cleanupInner = () => {
            container.removeChild(displayCanvas);
          };
          return;
        }

        let frameId = null;
        let visible = true;
        let running = true;
        // Pausado de fora (TransitionLayer.jsx) quando o Hero já está
        // 100% coberto pelas faixas do handoff pra Selected Work —
        // opacity:0 sozinho não tira o elemento da interseção do
        // IntersectionObserver abaixo (o container continua geometricamente
        // no viewport, só visualmente invisível), então sem isso o loop
        // continuava desenhando ~30 mil células + bloom/grain todo frame
        // atrás de faixas totalmente fechadas. Nenhuma linha de desenho
        // muda — só para/retoma o mesmo loop.
        let paused = false;
        const timer = { start: performance.now(), last: performance.now() };

        const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        const interactionTarget = heroSectionRef?.current;
        let removeListeners;
        if (canHover && interactionTarget && !isMobile) {
          const handleMove = (event) => {
            const r = interactionTarget.getBoundingClientRect();
            pointer.targetX = (event.clientX - r.left) / r.width - 0.5;
            pointer.targetY = (event.clientY - r.top) / r.height - 0.5;
            pointer.targetActive = 1;
          };
          const handleLeave = () => {
            pointer.targetActive = 0;
          };
          interactionTarget.addEventListener("mousemove", handleMove, { passive: true });
          interactionTarget.addEventListener("mouseleave", handleLeave, { passive: true });
          removeListeners = () => {
            interactionTarget.removeEventListener("mousemove", handleMove);
            interactionTarget.removeEventListener("mouseleave", handleLeave);
          };
        }

        let nextGlitchAt = 8 + Math.random() * 9;
        let glitchTimer = 0;

        const io = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (visible && running && frameId === null) frameId = requestAnimationFrame(tick);
          },
          { threshold: 0.05 }
        );
        io.observe(container);

        function tick(now) {
          frameId = null;
          if (!running || !visible || paused) return;

          const dt = Math.min((now - timer.last) / 1000, 0.05);
          timer.last = now;
          const t = (now - timer.start) / 1000;

          pointer.x = damp(pointer.x, pointer.targetX, 0.08);
          pointer.y = damp(pointer.y, pointer.targetY, 0.08);
          pointer.active = damp(pointer.active, pointer.targetActive, 0.08);

          interference.timer += dt;
          if (!interference.active && interference.timer > interference.nextAt) {
            interference.timer = 0;
            interference.nextAt = 2.2 + Math.random() * 3.4;
            interference.active = true;
            interference.until = t + 0.09 + Math.random() * 0.08;
            interference.y = Math.random() * displayHeight;
          }
          if (interference.active && t > interference.until) interference.active = false;

          updateCellBatch(t);
          drawFrame(t);

          glitchTimer += dt;
          if (glitchTimer > nextGlitchAt) {
            glitchTimer = 0;
            nextGlitchAt = 7 + Math.random() * 10;
            applyGlitchSlices(ctx, displayWidth, displayHeight, 2, 5);
          }

          frameId = requestAnimationFrame(tick);
        }
        frameId = requestAnimationFrame(tick);

        function handleCanvasPause(event) {
          paused = !!event.detail?.paused;
          if (!paused && running && visible && frameId === null) {
            timer.last = performance.now();
            frameId = requestAnimationFrame(tick);
          }
        }
        window.addEventListener("hero-canvas-pause", handleCanvasPause);

        let scrollTrigger;
        if (heroSectionRef?.current) {
          gsap.registerPlugin(ScrollTrigger);
          scrollTrigger = ScrollTrigger.create({
            trigger: heroSectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.4,
            onUpdate: (self) => {
              const p = self.progress;
              gsap.set(container, { opacity: 1 - p, scale: 1 + p * 0.04 });
            },
          });
        }

        cleanupInner = () => {
          running = false;
          if (frameId !== null) cancelAnimationFrame(frameId);
          io.disconnect();
          window.removeEventListener("hero-canvas-pause", handleCanvasPause);
          if (removeListeners) removeListeners();
          if (scrollTrigger) scrollTrigger.kill();
          container.removeChild(displayCanvas);
        };
      })
      .catch((err) => {
        console.error("HeroPhotoEffect failed", err);
      });

    return () => {
      cancelled = true;
      cleanupInner();
    };
  }, [reducedMotion, heroSectionRef]);

  return <div ref={containerRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}
