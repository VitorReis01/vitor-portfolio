"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// Placa HUD flutuante — elemento secundário, perto da cabeça (canto
// superior direito, acima da linha ciano, sem tocar o rosto). Alterna
// competência + stack a cada 3s, com uma falha de sinal curta antes de
// cada troca. Cor ciano é local (mesma família da linha do efeito),
// nunca o --signal laranja do resto do site.

const BADGE_ITEMS = [
  { title: "BACKEND", tags: ["Node.js", "TypeScript", "PostgreSQL", "REST APIs"] },
  { title: "CONSTRUTOR DE SISTEMAS", tags: ["Next.js", "React", "Tailwind", "GSAP"] },
  { title: "FULL STACK", tags: ["Next.js", "Node.js", "PostgreSQL", "Git"] },
  { title: "AUTOMAÇÃO", tags: ["Node.js", "REST APIs", "PostgreSQL"] },
  { title: "ENGENHARIA DE UI", tags: ["React", "Tailwind", "GSAP"] },
  { title: "RESOLVEDOR DE PROBLEMAS", tags: ["Sistemas", "Arquitetura", "Desempenho"] },
];

const CYCLE_INTERVAL = 3000;
const BASE_ROTATE = -5;

// Pontos ao longo do perímetro (viewBox 0..100) onde uma descarga pode
// aparecer — cantos e meios de aresta, onde uma "faísca" de circuito lê
// como intencional, não aleatória.
const SPARK_POINTS = [
  { x: 4, y: 4 },
  { x: 96, y: 4 },
  { x: 96, y: 96 },
  { x: 4, y: 96 },
  { x: 50, y: 2 },
  { x: 50, y: 98 },
];

export default function HeroBadge({ reducedMotion }) {
  const wrapRef = useRef(null);
  const floatRef = useRef(null);
  const borderGroupRef = useRef(null);
  const traceRef = useRef(null);
  const sparkRefs = useRef([]);
  const contentRef = useRef(null);
  const noiseRef = useRef(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);

  // Flutuação idle: sobe/desce + rotação oscilando — pose base sempre via
  // gsap.set (nunca um transform CSS cru), senão a string estática e o
  // tween de rotate brigam pela mesma propriedade.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.set(floatRef.current, { rotate: BASE_ROTATE, y: 0 });
    gsap.set(borderGroupRef.current, { opacity: 0.75 });
    if (reducedMotion) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(floatRef.current, { y: -11, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(floatRef.current, {
        rotate: BASE_ROTATE + 2.4,
        duration: 4.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Borda energizada: traço curto correndo pelo contorno (pathLength
      // normaliza o perímetro pra 100 unidades, então dasharray/offset
      // funcionam igual não importa o tamanho real do painel).
      gsap.to(traceRef.current, { strokeDashoffset: -100, duration: 3.2, ease: "none", repeat: -1 });
      gsap.to(borderGroupRef.current, { opacity: 1, duration: 2.1, ease: "sine.inOut", yoyo: true, repeat: -1 });

      // Descargas rápidas em pontos aleatórios da borda — raras, curtas,
      // nunca todas ao mesmo tempo.
      sparkRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, scale: 0.6, transformOrigin: "center" });
        gsap.to(el, {
          opacity: 1,
          scale: 1.6,
          duration: 0.12,
          ease: "power1.out",
          repeat: -1,
          repeatDelay: 2.6 + Math.random() * 3.4 + i * 0.5,
          yoyo: true,
          delay: 0.4 + i * 0.35,
        });
      });
    }, wrapRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Troca de conteúdo a cada 3s, com falha de sinal curta (~350ms) antes.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let tl;

    function advance() {
      indexRef.current = (indexRef.current + 1) % BADGE_ITEMS.length;
      setIndex(indexRef.current);
    }

    function triggerGlitch() {
      if (reducedMotion) {
        advance();
        return;
      }
      tl = gsap.timeline();
      tl.to(noiseRef.current, { opacity: 0.55, duration: 0.045 })
        .to(contentRef.current, { opacity: 0.2, x: -3, duration: 0.045 }, "<")
        .to(contentRef.current, { x: 3, duration: 0.05 })
        .to(contentRef.current, { x: -2, opacity: 0.5, duration: 0.05 })
        .to(noiseRef.current, { opacity: 0.3, duration: 0.05 })
        .call(advance)
        .to(contentRef.current, { x: 2, duration: 0.05 })
        .to(contentRef.current, { x: 0, opacity: 1, duration: 0.11 })
        .to(noiseRef.current, { opacity: 0, duration: 0.13 }, "<");
    }

    const id = setInterval(triggerGlitch, CYCLE_INTERVAL);
    return () => {
      clearInterval(id);
      if (tl) tl.kill();
    };
  }, [reducedMotion]);

  const item = BADGE_ITEMS[index];

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute z-10 hidden sm:block"
      style={{ top: "13%", right: "8%", width: "min(15vw, 224px)" }}
      aria-hidden="true"
    >
      <div ref={floatRef} className="relative">
        <div
          className="relative overflow-visible rounded-2xl px-4 py-3 backdrop-blur-md"
          style={{
            background: "rgba(8,13,17,0.6)",
            border: "1px solid rgba(130,224,255,0.16)",
          }}
        >
          {/* Borda energizada: contorno fino em SVG (não CSS border) —
              trilha de energia correndo + descargas pontuais + respiração
              geral, tudo colado exatamente na moldura do painel. */}
          <svg
            ref={borderGroupRef}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -inset-[1px] h-[calc(100%+2px)] w-[calc(100%+2px)] overflow-visible"
          >
            <defs>
              <filter id="badge-edge-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="1.6" />
              </filter>
            </defs>
            {/* contorno base, quase invisível — só pra fechar a moldura */}
            <rect
              x="1"
              y="1"
              width="98"
              height="98"
              rx="9"
              vectorEffect="non-scaling-stroke"
              fill="none"
              stroke="rgba(120,215,255,0.22)"
              strokeWidth="1"
            />
            {/* glow difuso atrás da trilha */}
            <rect
              x="1"
              y="1"
              width="98"
              height="98"
              rx="9"
              pathLength="100"
              vectorEffect="non-scaling-stroke"
              fill="none"
              stroke="rgba(120,220,255,0.9)"
              strokeWidth="2.4"
              strokeDasharray="7 30"
              filter="url(#badge-edge-glow)"
              opacity="0.55"
            />
            {/* trilha nítida — os "segmentos de energia" correndo */}
            <rect
              ref={traceRef}
              x="1"
              y="1"
              width="98"
              height="98"
              rx="9"
              pathLength="100"
              vectorEffect="non-scaling-stroke"
              fill="none"
              stroke="rgba(190,240,255,0.95)"
              strokeWidth="1"
              strokeDasharray="7 30"
            />
            {SPARK_POINTS.map((p, i) => (
              <circle
                key={`${p.x}-${p.y}`}
                ref={(el) => {
                  sparkRefs.current[i] = el;
                }}
                cx={p.x}
                cy={p.y}
                r="2.1"
                fill="rgba(200,245,255,0.95)"
                filter="url(#badge-edge-glow)"
              />
            ))}
          </svg>

          <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-[rgba(150,230,255,0.55)]" />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 border-r border-t border-[rgba(150,230,255,0.55)]" />
          <span className="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l border-[rgba(150,230,255,0.55)]" />
          <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-[rgba(150,230,255,0.55)]" />

          <div ref={contentRef} className="relative">
            <p className="font-mono-label text-[0.62rem] tracking-[0.14em] text-[rgba(150,230,255,0.9)]">
              {item.title}
            </p>
            <p className="mt-1.5 text-[0.68rem] leading-snug text-paper/55">{item.tags.join(" • ")}</p>
          </div>

          <div
            ref={noiseRef}
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{
              background:
                "repeating-linear-gradient(0deg, rgba(150,230,255,0.55) 0px, transparent 1px, transparent 3px)",
              mixBlendMode: "screen",
            }}
          />
        </div>
      </div>
    </div>
  );
}
