"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import useTechIcons from "./useTechIcons";

// Fase 4 — nova direção do How I Build. "Chuva de meteoros tecnológica":
// símbolos das ferramentas atravessam a cena em diagonal enquanto cada
// etapa está em foco. Tudo é 100% função do progresso do scroll — não
// existe loop de tempo/rAF próprio aqui. O pai (HowIBuildStage) chama
// `update(raw)` uma vez por tick do SEU onUpdate já existente; esta
// função só recalcula `left/top/opacity` de um punhado de elementos via
// gsap.set (transform+opacity, GPU-friendly). Nenhum meteoro tem timeline
// própria — a "trajetória" de cada um é só uma interpolação linear entre
// dois pontos, function do progresso local dentro da janela de vida dele.

const ALL_SLUGS = [
  "javascript",
  "react",
  "nextdotjs",
  "html5",
  "css3",
  "tailwindcss",
  "nodedotjs",
  "postgresql",
  "git",
  "github",
  "vercel",
  "figma",
];

// depth: fg (poucos, maiores, passam rápido) / mid (maioria) / bg
// (menores, baixa opacidade, mais lentos — janela [start,end] mais larga
// já É o "mais lento": a mesma distância percorrida ao longo de mais
// progresso lê como velocidade menor).
const DEPTH_STYLE = {
  fg: { opacityMul: 0.95, blurPx: 0 },
  mid: { opacityMul: 0.68, blurPx: 0 },
  bg: { opacityMul: 0.38, blurPx: 0.5 },
};

function m(slug, depth, x0, y0, x1, y1, start, end, opts = {}) {
  const angle = Math.atan2(y1 - y0, x1 - x0) * (180 / Math.PI);
  return {
    slug,
    depth,
    x0,
    y0,
    x1,
    y1,
    start,
    end,
    angle,
    size: opts.size ?? (depth === "fg" ? 52 : depth === "mid" ? 36 : 22),
    signal: !!opts.signal,
  };
}

// Direção principal coerente: majoritariamente superior-esquerda →
// inferior-direita ("corrente de dados"), com algumas trajetórias
// pontualmente invertidas (INTEGRAR/ENTREGAR) representando cruzamento e
// convergência.
const STEP_METEOR_SETS = [
  // ENTENDER — esparso, mais espaçado, como coleta de sinais.
  [
    m("figma", "mid", -12, -18, 52, 58, 0.06, 0.5),
    m("github", "bg", 15, -22, 92, 50, 0.28, 0.88),
    m("html5", "bg", -18, 45, 55, 112, 0.5, 0.96),
    m("css3", "fg", 58, -22, 118, 42, 0.58, 0.92, { signal: true }),
  ],
  // ARQUITETAR — trajetórias começam a se organizar.
  [
    m("nextdotjs", "fg", -12, -12, 58, 52, 0.05, 0.42, { signal: true }),
    m("nodedotjs", "mid", -2, -22, 68, 58, 0.18, 0.56),
    m("postgresql", "mid", 28, -16, 100, 58, 0.32, 0.7),
    m("nextdotjs", "bg", -22, 32, 52, 100, 0.48, 0.9),
    m("nodedotjs", "bg", 8, 42, 88, 112, 0.6, 0.98),
  ],
  // CONSTRUIR — a mais intensa da sequência.
  [
    m("javascript", "fg", -18, -22, 52, 48, 0, 0.34, { signal: true }),
    m("react", "fg", 8, -26, 78, 42, 0.1, 0.44),
    m("nextdotjs", "mid", -22, 0, 42, 62, 0.2, 0.56),
    m("tailwindcss", "mid", 18, -12, 92, 52, 0.3, 0.66),
    m("nodedotjs", "mid", -12, 22, 58, 88, 0.42, 0.78),
    m("javascript", "bg", 28, -22, 98, 42, 0.5, 0.86),
    m("react", "bg", -28, 26, 48, 98, 0.58, 0.96),
    m("tailwindcss", "fg", 38, 12, 108, 74, 0.66, 0.98, { signal: true }),
  ],
  // INTEGRAR — cruzamentos: algumas trajetórias invertidas.
  [
    m("postgresql", "mid", -15, -15, 58, 55, 0.05, 0.44),
    m("nodedotjs", "mid", 112, -10, 32, 58, 0.16, 0.52),
    m("github", "fg", -12, 18, 62, 88, 0.3, 0.62, { signal: true }),
    m("postgresql", "bg", 92, 30, 18, 98, 0.42, 0.86),
    m("github", "bg", -22, -5, 52, 58, 0.56, 0.96),
  ],
  // ENTREGAR — a chuva converge e estabiliza.
  [
    m("git", "mid", -15, -20, 46, 50, 0.05, 0.4),
    m("github", "mid", 112, -14, 54, 50, 0.14, 0.48),
    m("vercel", "fg", -22, 30, 48, 52, 0.3, 0.64, { signal: true }),
    m("git", "bg", 102, 30, 52, 54, 0.38, 0.72),
    m("vercel", "bg", 30, -26, 50, 48, 0.5, 0.84),
  ],
];

// Mobile: trajetórias mais curtas (squeeze em x) e inteiramente contidas
// numa faixa segura acima ou abaixo do centro vertical (onde a palavra
// ativa vive) — não um empurrão sutil, e sim recentrar o trajeto inteiro
// em torno do topo ou do rodapé, escalando o deslocamento original pra
// baixo. Garante que nenhuma trajetória cruze a faixa central por
// construção, em vez de só reduzir a chance.
function mobileAdjust(meteor) {
  const squeezeX = (v) => 50 + (v - 50) * 0.7;
  const avgY = (meteor.y0 + meteor.y1) / 2;
  const bandCenter = avgY < 50 ? 8 : 92;
  const spread = 0.3;
  const mapY = (v) => bandCenter + (v - avgY) * spread;
  return {
    ...meteor,
    x0: squeezeX(meteor.x0),
    x1: squeezeX(meteor.x1),
    y0: mapY(meteor.y0),
    y1: mapY(meteor.y1),
  };
}

const TechMeteorField = forwardRef(function TechMeteorField({ reducedMotion }, ref) {
  const fieldRef = useRef(null);
  const meteorRefs = useRef([]);
  const icons = useTechIcons(ALL_SLUGS);

  const flat = useMemo(() => {
    const list = [];
    STEP_METEOR_SETS.forEach((set, stepIndex) => {
      set.forEach((meteor, meteorIndex) => list.push({ ...meteor, stepIndex, meteorIndex }));
    });
    return list;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      update(raw, isDesktop) {
        if (reducedMotion || !icons) return;
        const half = 0.175;
        flat.forEach((meteor) => {
          const el = meteorRefs.current[`${meteor.stepIndex}-${meteor.meteorIndex}`];
          if (!el) return;

          // Mobile: menos elementos simultâneos — a camada de fundo (mais
          // numerosa e menos essencial) fica de fora inteiramente.
          if (!isDesktop && meteor.depth === "bg") {
            gsap.set(el, { opacity: 0 });
            return;
          }

          const localRaw = raw - meteor.stepIndex;
          const stepT = gsap.utils.clamp(0, 1, (localRaw + 0.5 + half) / (1 + half * 2));
          const active = stepT >= meteor.start && stepT <= meteor.end;
          if (!active) {
            gsap.set(el, { opacity: 0 });
            return;
          }

          const source = isDesktop ? meteor : mobileAdjust(meteor);
          const local = gsap.utils.clamp(0, 1, (stepT - meteor.start) / (meteor.end - meteor.start));
          const x = gsap.utils.interpolate(source.x0, source.x1, local);
          const y = gsap.utils.interpolate(source.y0, source.y1, local);
          const fadeIn = gsap.utils.clamp(0, 1, local / 0.18);
          const fadeOut = gsap.utils.clamp(0, 1, (1 - local) / 0.18);
          const opacity = Math.min(fadeIn, fadeOut) * DEPTH_STYLE[meteor.depth].opacityMul;

          gsap.set(el, { left: `${x}%`, top: `${y}%`, opacity });
        });
      },
    }),
    [flat, icons, reducedMotion]
  );

  useLayoutEffect(() => {
    if (reducedMotion) {
      flat.forEach((meteor) => {
        const el = meteorRefs.current[`${meteor.stepIndex}-${meteor.meteorIndex}`];
        if (el) gsap.set(el, { opacity: 0 });
      });
    }
  }, [reducedMotion, flat]);

  if (!icons || reducedMotion) return <div ref={fieldRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" />;

  return (
    <div ref={fieldRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {flat.map((meteor) => {
        const icon = icons[meteor.slug];
        if (!icon) return null;
        const depthStyle = DEPTH_STYLE[meteor.depth];
        return (
          <div
            key={`${meteor.stepIndex}-${meteor.meteorIndex}`}
            ref={(el) => {
              meteorRefs.current[`${meteor.stepIndex}-${meteor.meteorIndex}`] = el;
            }}
            className="absolute opacity-0"
            style={{ left: `${meteor.x0}%`, top: `${meteor.y0}%`, filter: depthStyle.blurPx ? `blur(${depthStyle.blurPx}px)` : undefined }}
          >
            <span
              className="absolute right-full top-1/2 h-px origin-right"
              style={{
                width: meteor.size * 0.9,
                transform: `translateY(-50%) rotate(${meteor.angle}deg)`,
                background: meteor.signal
                  ? "linear-gradient(to left, rgba(111,233,228,0.75), rgba(111,233,228,0))"
                  : "linear-gradient(to left, rgba(231,229,221,0.4), rgba(231,229,221,0))",
              }}
            />
            <img
              src={meteor.signal ? icon.accentSrc : icon.neutralSrc}
              alt=""
              width={meteor.size}
              height={meteor.size}
              style={{ transform: "translate(-50%, -50%)" }}
            />
          </div>
        );
      })}
    </div>
  );
});

export default TechMeteorField;
