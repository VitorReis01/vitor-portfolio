"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { cellShimmer, flicker } from "@/lib/canvasArt/animation";
import { applyGlitchSlices } from "@/lib/canvasArt/postEffects";

// Globo tipográfico do SystemBootLoader.
//
// ATENÇÃO — atribuição verificada, não presumida: a técnica de projeção
// aqui é adaptada do estudo "05 / BALL" (pontos uniformes numa esfera
// abstrata, sem geografia — rotação por matriz, profundidade ->
// escala/opacidade, sort back-to-front), de "Text on a Path — Three
// Studies in Motion", de Meng To —
// https://github.com/MengTo/threeui/blob/main/src/shaders/text-path-studies/sources/text-on-a-path.html
// (repositório ThreeUI, https://github.com/MengTo/threeui), licenciado MIT.
//
// NÃO é o estudo "06 / GLOBE" — esse é um arquivo DIFERENTE do mesmo
// projeto (text-on-a-path-ii.html) e uma técnica bem mais elaborada: mapa-
// múndi real (bitmap de terra/mar por lat/lon), litorais em halftone,
// arrastar/zoom/pinos. Nada disso foi usado ou adaptado aqui — o nome do
// componente ("BootGlobe") é só a intenção visual do boot ("globo"), não
// uma referência ao estudo GLOBE. Registrando isso explicitamente porque a
// confusão entre os dois nomes já aconteceu uma vez nesta conversa; o
// código abaixo continua sendo o do BALL, verificado linha a linha contra
// o arquivo original antes desta nota ser escrita — não é provenance
// presumida.
//
// Licença do estudo BALL adaptado aqui:
//
//   MIT License
//   Copyright (c) 2026 Meng To
//
//   Permission is hereby granted, free of charge, to any person obtaining a copy
//   of this software and associated documentation files (the "Software"), to deal
//   in the Software without restriction, including without limitation the rights
//   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be included in all
//   copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.
//
// Nada além dessa matemática foi reaproveitado: sem iframe/srcDoc, sem HTML
// ou CSS do estudo original, sem WebGL/Three.js (o estudo de referência já
// usava Canvas 2D puro, então a técnica é diretamente portável). O
// vocabulário visual (cores, fonte, charset, densidade progressiva ligada
// ao boot real, sequência de "sinal adquirido") é próprio deste projeto.

const NEUTRAL_RGB = "231,229,221"; // mesmo off-white de useTechIcons.js/techIconsData.js
const SIGNAL_RGB = "150,225,255"; // mesmo ciano da linha dos olhos em HeroPhotoEffect.jsx
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/·×+-=";
const BASE_POINTS = 720;
const SIGNAL_RATIO = 0.035; // fração de pontos "raríssimos sinais ciano"
const TILT = 0.19;
const MIN_DENSITY = 0.32; // fração de pontos visível logo no início do boot

// PRNG determinístico (LCG) — mesma pontuação toda vez que o boot roda,
// sem depender de Math.random() espalhado pelo loop de frame.
function makeRng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function rng() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildPoints(count) {
  const rand = makeRng(90125);
  const points = [];
  for (let i = 0; i < count; i += 1) {
    // Uniforme na esfera (não uma grade lat/long — isso mostraria "faixas").
    const y = 1 - 2 * rand();
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = rand() * Math.PI * 2;
    points.push({
      x: Math.cos(theta) * rad,
      y,
      z: Math.sin(theta) * rad,
      char: CHARS.charAt(Math.floor(rand() * CHARS.length)),
      signal: rand() < SIGNAL_RATIO,
    });
  }
  return points;
}

function resolveMonoFont() {
  if (typeof window === "undefined") return "monospace";
  const value = getComputedStyle(document.body).getPropertyValue("--font-mono").trim();
  return value ? `${value}, monospace` : "monospace";
}

const BootGlobe = forwardRef(function BootGlobe({ size, reducedMotion }, ref) {
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const finaleRef = useRef(null); // { t, glitchedFrames } enquanto a sequência final roda
  const rafRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      setProgress(value) {
        progressRef.current = Math.max(0, Math.min(1, value));
      },
      triggerFinale(onComplete, opts = {}) {
        const fast = !!opts.fast;
        if (reducedMotion) {
          // Sem coreografia — só um corte rápido, como pedido pra reduced motion.
          const state = { t: 0 };
          gsap.to(state, {
            t: 1,
            duration: 0.18,
            ease: "power1.out",
            onUpdate: () => {
              finaleRef.current = { t: state.t, reduced: true };
            },
            onComplete: () => {
              finaleRef.current = { t: 1, reduced: true, done: true };
              onComplete?.();
            },
          });
          return;
        }
        const state = { t: 0 };
        finaleRef.current = { t: 0, glitchedUntil: 0 };
        gsap.to(state, {
          t: 1,
          duration: fast ? 0.42 : 1.05,
          ease: "power2.inOut",
          onUpdate: () => {
            finaleRef.current.t = state.t;
          },
          onComplete: () => {
            finaleRef.current.t = 1;
            finaleRef.current.done = true;
            onComplete?.();
          },
        });
      },
    }),
    [reducedMotion]
  );

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    const canvas = canvasRef.current;
    if (!canvas || !size) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const points = buildPoints(BASE_POINTS);
    const proj = new Float32Array(BASE_POINTS * 4); // x, y, scale, depth
    const order = new Array(BASE_POINTS);
    const font = resolveMonoFont();

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.34;
    const fs = size * 0.032;
    const ct = Math.cos(TILT);
    const st = Math.sin(TILT);

    let spin = 0;
    let vel = reducedMotion ? 0 : 0.065;
    let prevTime = performance.now();
    let elapsed = 0;

    function drawFinale(t2, ctx2d, activeCount, cs, sn) {
      const finale = finaleRef.current;
      const t = finale.t;

      // 0.00–0.30: desacelera e acende os caracteres.
      const brighten = Math.min(1, t / 0.3);
      // 0.22–0.62: linha de sinal ciano atravessa o centro.
      const signalWindow = Math.max(0, Math.min(1, (t - 0.22) / 0.4));
      const signalStrength = Math.sin(signalWindow * Math.PI); // sobe e desce
      // 0.55–0.68: glitch curto.
      const inGlitch = t >= 0.55 && t <= 0.68;
      // 0.6–1.0: desmaterialização horizontal.
      const dematerialize = Math.max(0, Math.min(1, (t - 0.6) / 0.4));

      for (let i = 0; i < activeCount; i += 1) {
        const p = points[i];
        const x1 = p.x * cs - p.z * sn;
        const z1 = p.x * sn + p.z * cs;
        const y2 = p.y * ct - z1 * st;
        const z2 = p.y * st + z1 * ct;
        const depth = (z2 + 1) * 0.5;
        const scale = 0.1 + 0.9 * Math.pow(depth, 1.8);
        let px = cx + x1 * R;
        const py = cy + y2 * R;

        if (dematerialize > 0) {
          px += (px - cx) * dematerialize * dematerialize * 2.4;
        }

        let alpha = 0.5 + 0.5 * Math.pow(depth, 1.1);
        alpha = alpha + (1 - alpha) * brighten;
        if (dematerialize > 0) alpha *= Math.max(0, 1 - dematerialize);
        if (alpha <= 0.01) continue;

        const isSignalChar = p.signal;
        const rgb = isSignalChar ? SIGNAL_RGB : NEUTRAL_RGB;
        ctx2d.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
        ctx2d.font = `${Math.max(6, fs * scale).toFixed(1)}px ${font}`;
        ctx2d.fillText(p.char, px, py);
      }

      if (signalStrength > 0.02) {
        const bandHeight = size * 0.05 * signalStrength;
        const gradient = ctx2d.createLinearGradient(0, cy - bandHeight, 0, cy + bandHeight);
        gradient.addColorStop(0, `rgba(${SIGNAL_RGB},0)`);
        gradient.addColorStop(0.5, `rgba(${SIGNAL_RGB},${(0.5 * signalStrength).toFixed(3)})`);
        gradient.addColorStop(1, `rgba(${SIGNAL_RGB},0)`);
        ctx2d.fillStyle = gradient;
        ctx2d.fillRect(0, cy - bandHeight, size, bandHeight * 2);
        ctx2d.fillStyle = `rgba(${SIGNAL_RGB},${(0.85 * signalStrength).toFixed(3)})`;
        ctx2d.fillRect(0, cy - 0.6, size, 1.2);
      }

      if (inGlitch) {
        applyGlitchSlices(ctx2d, size, size, 2, 2);
      }
    }

    function frame(now) {
      const dt = Math.min(64, now - prevTime);
      prevTime = now;
      elapsed += dt;
      const t = elapsed / 1000;

      const finale = finaleRef.current;
      if (finale && finale.reduced) {
        ctx.clearRect(0, 0, size, size);
        ctx.globalAlpha = Math.max(0, 1 - finale.t);
        drawStatic();
        ctx.globalAlpha = 1;
        if (!finale.done) rafRef.current = requestAnimationFrame(frame);
        return;
      }

      if (!finale || !finale.done) {
        if (finale) {
          // Desacelera durante a janela inicial da sequência final.
          vel *= 0.9;
        }
        spin += vel * (dt / 1000);
      }

      ctx.clearRect(0, 0, size, size);

      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      const density = finale ? 1 : MIN_DENSITY + (1 - MIN_DENSITY) * progressRef.current;
      const activeCount = Math.max(24, Math.round(BASE_POINTS * density));

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (finale) {
        drawFinale(t, ctx, activeCount, cs, sn);
      } else {
        for (let i = 0; i < activeCount; i += 1) {
          const p = points[i];
          const x1 = p.x * cs - p.z * sn;
          const z1 = p.x * sn + p.z * cs;
          const y2 = p.y * ct - z1 * st;
          const z2 = p.y * st + z1 * ct;
          const depth = (z2 + 1) * 0.5;
          const scale = 0.1 + 0.9 * Math.pow(depth, 1.8);
          proj[i * 4] = cx + x1 * R;
          proj[i * 4 + 1] = cy + y2 * R;
          proj[i * 4 + 2] = scale;
          proj[i * 4 + 3] = depth;
          order[i] = i;
        }
        // Ordena in-place — sem slice() (que alocaria um array novo por
        // frame): encolhe order pro tamanho ativo, sort() só toca esse
        // intervalo, depois devolve pro tamanho cheio pra caber o próximo
        // frame (mesmo array reutilizado, nunca uma alocação nova).
        order.length = activeCount;
        order.sort((a, b) => proj[a * 4 + 3] - proj[b * 4 + 3]);
        order.length = BASE_POINTS;

        for (let k = 0; k < activeCount; k += 1) {
          const i = order[k];
          const p = points[i];
          const depth = proj[i * 4 + 3];
          const scale = proj[i * 4 + 2];
          let alpha = 0.5 + 0.5 * Math.pow(depth, 1.1);
          if (!reducedMotion) {
            alpha += cellShimmer(t, i, 0, 0.5, 0.05);
            if (p.signal) alpha *= 0.75 + 0.5 * flicker(t, i, 0.35);
          }
          alpha = Math.max(0, Math.min(1, alpha));
          if (alpha <= 0.02) continue;

          const rgb = p.signal ? SIGNAL_RGB : NEUTRAL_RGB;
          ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
          ctx.font = `${Math.max(6, fs * scale).toFixed(1)}px ${font}`;
          ctx.fillText(p.char, proj[i * 4], proj[i * 4 + 1]);
        }
      }

      if (!finale || !finale.done) {
        rafRef.current = requestAnimationFrame(frame);
      }
    }

    function drawStatic() {
      // Usado só no corte rápido de reduced motion: um frame simples, sem
      // recalcular a projeção inteira a cada tick (spin já é ~0).
      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      const activeCount = Math.round(BASE_POINTS * (MIN_DENSITY + (1 - MIN_DENSITY) * progressRef.current));
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < activeCount; i += 1) {
        const p = points[i];
        const x1 = p.x * cs - p.z * sn;
        const z1 = p.x * sn + p.z * cs;
        const y2 = p.y * ct - z1 * st;
        const z2 = p.y * st + z1 * ct;
        const depth = (z2 + 1) * 0.5;
        const scale = 0.1 + 0.9 * Math.pow(depth, 1.8);
        const alpha = 0.5 + 0.5 * Math.pow(depth, 1.1);
        const rgb = p.signal ? SIGNAL_RGB : NEUTRAL_RGB;
        ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
        ctx.font = `${Math.max(6, fs * scale).toFixed(1)}px ${font}`;
        ctx.fillText(p.char, cx + x1 * R, cy + y2 * R);
      }
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [size, reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden="true" className="block" />;
});

export default BootGlobe;
