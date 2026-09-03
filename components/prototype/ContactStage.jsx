"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fase 4 — protótipo 05 (revisão de geometria). Dois componentes, dois
// beats narrativos distintos, de propósito não fundidos num só:
//
// ContactMainStage — o statement principal (headline/subtexto/CTA +
// system-returns pequeno perto do CTA). Vive DENTRO da cena pinada de
// AboutToContactTransition.jsx, absoluto/inset-0 sobre o canvas — a
// entrada dele é 100% dirigida pelas refs vindas de fora (mesmo
// `self.progress` que desenha o dither), nunca anima sozinho.
//
// ContactClosing — o encerramento (Instagram → SYSTEM READY → AWAITING
// INPUT_). Vive FORA do pin, em fluxo normal, com sua própria entrada
// simples ligada à própria posição de scroll — deliberadamente
// desacoplado do statement principal, pra não misturar "CTA chegou" com
// "site terminou".

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
    </div>
  );
}

export function ContactClosing({ reducedMotion }) {
  const closingRef = useRef(null);
  const linkRef = useRef(null);
  const awaitingRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) {
      gsap.set([linkRef.current, awaitingRef.current], { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(linkRef.current, { opacity: 0, y: 12 });
    gsap.set(awaitingRef.current, { opacity: 0, y: 10 });

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: closingRef.current,
        start: "top 80%",
        end: "top 20%",
        scrub: 0.4,
        onUpdate: (self) => {
          const p = self.progress;
          const linkT = gsap.utils.clamp(0, 1, p / 0.55);
          const awaitT = gsap.utils.clamp(0, 1, (p - 0.45) / 0.55);
          gsap.set(linkRef.current, { opacity: linkT, y: 12 * (1 - linkT) });
          gsap.set(awaitingRef.current, { opacity: awaitT, y: 10 * (1 - awaitT) });
        },
      });
      return () => st.kill();
    }, closingRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={closingRef} className="relative flex min-h-[60vh] flex-col items-center justify-center gap-10 bg-ink px-[var(--gutter)] py-24 text-center">
      {/*
        Único canal de contato real confirmado no projeto todo — mesma
        regra do ContactSection.jsx aprovado da página principal. Nada
        inventado: sem WhatsApp/e-mail/GitHub/LinkedIn até existir um
        valor real.
      */}
      <a
        ref={linkRef}
        href="https://www.instagram.com/vitor.systems/"
        target="_blank"
        rel="noreferrer"
        data-cursor="label"
        data-cursor-label="abrir"
        className="font-mono-label text-label text-paper/70 transition-colors duration-150 hover:text-paper"
      >
        Instagram — @vitor.systems
      </a>

      <div ref={awaitingRef} className="flex flex-col items-center gap-1">
        <span className="font-mono-label text-label text-graphite/40">SISTEMA PRONTO</span>
        <span className="font-mono-label text-label text-paper/60">AGUARDANDO ENTRADA_</span>
      </div>
    </div>
  );
}

export default ContactMainStage;
