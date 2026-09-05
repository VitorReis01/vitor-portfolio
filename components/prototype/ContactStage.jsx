"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// Fase 5 — correção de geometria: o Instagram já foi um componente à
// parte (ContactClosing), em fluxo normal DEPOIS do statement principal
// — isso adicionava altura própria ao documento (h-svh/min-height),
// deixando sobrar scroll depois do enquadramento final aprovado. Removido:
// o link agora vive DENTRO do próprio ContactMainStage, absolute, sem
// nenhuma altura própria — o statement principal (headline/subtexto/CTA/
// system-lines/Instagram) é literalmente o último frame possível da
// página, porque não existe mais nenhum elemento em fluxo normal depois
// dele.
//
// ContactMainStage vive DENTRO da cena pinada de AboutToContactOverlay.jsx,
// absoluto/inset-0 sobre o canvas — a entrada dele é 100% dirigida pelas
// refs vindas de fora (mesmo `self.progress` que desenha o dither), nunca
// anima sozinho.

const HEADLINE_LINES = ["VAMOS CONSTRUIR", "ALGO QUE FUNCIONE", "DE VERDADE?"];
const SUBTEXT = "Se você tem uma ideia, um problema ou um processo que pode funcionar melhor, vamos conversar.";
const SYSTEM_LINES = ["SINAL.............. ADQUIRIDO", "CANAL................ ABERTO", "STATUS............. PRONTO"];
const THREAD_COLOR = "150, 225, 255";

const AMBIENT_COUNT_DESKTOP = 14;
const AMBIENT_COUNT_MOBILE = 6;
const AMBIENT_DOTS = Array.from({ length: AMBIENT_COUNT_DESKTOP }, (_, i) => ({
  x: (i * 53) % 100,
  y: (i * 29) % 100,
  cyan: i % 5 === 0,
  delay: ((i * 11) % 40) / 10,
  size: 1.3 + ((i * 7) % 4) * 0.3,
}));

function TerminalCTA({ reducedMotion }) {
  const btnRef = useRef(null);
  const innerRef = useRef(null);
  const cursorRef = useRef(null);
  const sliceRefs = useRef([]);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || reducedMotion || !cursorRef.current) return undefined;
    const tween = gsap.to(cursorRef.current, { opacity: 0, duration: 0.53, repeat: -1, yoyo: true, ease: "none" });
    return () => tween.kill();
  }, [reducedMotion]);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return undefined;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const btn = btnRef.current;
    if (!canHover || !btn) return undefined;

    const RADIUS = 90;
    const moveX = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
    const moveY = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
    const innerX = gsap.quickTo(innerRef.current, "x", { duration: 0.5, ease: "power3.out" });
    const innerY = gsap.quickTo(innerRef.current, "y", { duration: 0.5, ease: "power3.out" });

    function handleMove(event) {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < RADIUS) {
        const pull = 1 - dist / RADIUS;
        moveX(dx * 0.25 * pull);
        moveY(dy * 0.25 * pull);
        innerX(dx * 0.15 * pull);
        innerY(dy * 0.15 * pull);
      } else {
        moveX(0);
        moveY(0);
        innerX(0);
        innerY(0);
      }
    }
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [reducedMotion]);

  function handleEnter() {
    if (reducedMotion) return;
    gsap
      .timeline()
      .set(sliceRefs.current, { opacity: 1, scaleX: 0 })
      .to(sliceRefs.current, { scaleX: 1, duration: 0.06, stagger: 0.02, ease: "none" })
      .to(sliceRefs.current, { opacity: 0, duration: 0.12 }, ">0.02");
  }

  return (
    <a
      ref={btnRef}
      href="https://www.instagram.com/vitor.systems/"
      target="_blank"
      rel="noreferrer"
      data-cursor="label"
      data-cursor-label="abrir"
      onMouseEnter={handleEnter}
      className="relative inline-flex items-center gap-2 rounded-full border border-paper/15 px-7 py-3.5 transition-colors duration-200 hover:border-[rgba(150,225,255,0.5)]"
    >
      <span ref={innerRef} className="font-mono-label text-label inline-flex items-center gap-1 text-paper transition-colors duration-200 [a:hover_&]:text-[rgb(150,225,255)]">
        <span>&gt; iniciar projeto</span>
        <span ref={cursorRef} className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.1em] bg-current" />
      </span>
      {[0, 1].map((i) => (
        <span
          key={i}
          ref={(el) => (sliceRefs.current[i] = el)}
          className="pointer-events-none absolute inset-x-3 h-px opacity-0"
          style={{ top: `${32 + i * 36}%`, background: `rgba(${THREAD_COLOR}, 0.8)`, transformOrigin: "left" }}
        />
      ))}
    </a>
  );
}

export function ContactMainStage({
  eyebrowRef,
  headlineRef,
  headlineLineRefs,
  subtextRef,
  ctaRef,
  systemLinesRef,
  instagramRef,
  ambientRef,
  reducedMotion,
}) {
  const particleRefs = useRef([]);

  // Partículas ambiente — poucas, sutis. Loop próprio (opacidade indo e
  // voltando), independente do progresso do pin; quem liga/desliga a
  // presença GERAL delas é o `ambientRef` (controlado de fora, junto com
  // o resto do statement).
  useLayoutEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return undefined;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const active = particleRefs.current.slice(0, isDesktop ? AMBIENT_COUNT_DESKTOP : AMBIENT_COUNT_MOBILE);
    const tweens = active.map((el, i) => {
      if (!el) return null;
      gsap.set(el, { opacity: 0.15 });
      return gsap.to(el, {
        opacity: 0.02 + (i % 3) * 0.12,
        duration: 3 + (i % 5) * 0.7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: AMBIENT_DOTS[i]?.delay || 0,
      });
    });
    return () => tweens.forEach((t) => t?.kill());
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-7 px-[var(--gutter)] text-center">
      <div ref={ambientRef} className="pointer-events-none absolute inset-0">
        {AMBIENT_DOTS.map((dot, i) => (
          <span
            key={i}
            ref={(el) => (particleRefs.current[i] = el)}
            className="absolute rounded-full"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size,
              height: dot.size,
              background: dot.cyan ? `rgba(${THREAD_COLOR}, 0.8)` : "rgba(243,241,234,0.6)",
            }}
          />
        ))}
      </div>

      <span ref={eyebrowRef} className="font-mono-label text-label relative z-10 text-graphite">
        contato
      </span>

      <h2 ref={headlineRef} className="font-display text-display relative z-10 max-w-[18ch] font-semibold uppercase leading-[0.95] text-paper">
        {HEADLINE_LINES.map((line, i) => (
          <span key={line} className="block overflow-hidden">
            <span
              ref={(el) => {
                if (headlineLineRefs) headlineLineRefs.current[i] = el;
              }}
              className="block"
            >
              {line}
            </span>
          </span>
        ))}
      </h2>

      <p ref={subtextRef} className="text-body relative z-10 max-w-[46ch] text-paper/60">
        {SUBTEXT}
      </p>

      <div ref={ctaRef} className="relative z-10">
        <TerminalCTA reducedMotion={reducedMotion} />
      </div>

      <div ref={systemLinesRef} className="font-mono-label text-label relative z-10 flex flex-col items-center gap-1 text-graphite/50">
        {SYSTEM_LINES.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>

      {/*
        Único canal de contato real confirmado no projeto todo — mesma
        regra do ContactSection.jsx aprovado da página principal. Nada
        inventado: sem WhatsApp/e-mail/GitHub/LinkedIn até existir um
        valor real. `absolute` dentro do mesmo wrapper (que já é
        `absolute inset-0`) — não adiciona nenhuma altura ao documento,
        só ocupa um canto do frame que já existe.
      */}
      <a
        ref={instagramRef}
        href="https://www.instagram.com/vitor.systems/"
        target="_blank"
        rel="noreferrer"
        data-cursor="label"
        data-cursor-label="abrir"
        className="font-mono-label text-label absolute bottom-8 right-[var(--gutter)] z-10 text-paper/70 transition-colors duration-150 hover:text-paper"
      >
        Instagram — @vitor.systems
      </a>
    </div>
  );
}

export default ContactMainStage;
