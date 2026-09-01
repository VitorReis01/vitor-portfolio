"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Cloud é client-only (TagCanvas precisa de canvas real) e não deve
// bloquear o carregamento inicial do Hero — dynamic import sem SSR.
const InteractiveIconCloud = dynamic(() => import("@/components/ui/interactive-icon-cloud"), { ssr: false });

const STEPS = ["Discover", "Design", "Build", "Connect", "Ship", "Improve"];
const CLOSING_LINE = "From an idea to a working system.";

// Processo (esquerda) + icon cloud 3D das tecnologias (direita) — o
// mecanismo de scroll pinado com a linha preenchendo e os passos ganhando
// foco continua o mesmo de antes; só a composição virou duas colunas pra
// abrir espaço pra cloud como elemento visual real, não só texto.
export default function HowIBuildSection({ reducedMotion }) {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const stepRefs = useRef([]);
  const closingRef = useRef(null);
  const cloudWrapRef = useRef(null);
  const cloudGlowRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const steps = stepRefs.current;

      if (reducedMotion) {
        gsap.set(lineRef.current, { scaleX: 1 });
        gsap.set(steps, { opacity: 1, y: 0 });
        gsap.set(closingRef.current, { opacity: 1 });
        gsap.set(cloudWrapRef.current, { opacity: 1, scale: 1 });
        return;
      }

      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left" });
      gsap.set(steps, { opacity: 0.15, y: 6 });
      gsap.set(closingRef.current, { opacity: 0 });
      gsap.set(cloudWrapRef.current, { opacity: 0, scale: 0.9 });

      // Entrada da cloud: um evento próprio, uma vez, quando a seção
      // aparece — independente do progresso do pin (que só controla os
      // passos à esquerda). Depois disso ela só continua girando sozinha.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(cloudWrapRef.current, { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" });
        },
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=130%",
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(lineRef.current, { scaleX: p });

          const raw = p * steps.length;
          steps.forEach((el, index) => {
            const focus = gsap.utils.clamp(0, 1, raw - index + 0.5);
            gsap.set(el, { opacity: 0.15 + focus * 0.85, y: 6 - focus * 6 });
          });

          gsap.set(closingRef.current, { opacity: gsap.utils.clamp(0, 1, (p - 0.82) / 0.18) });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Pulso da cloud quando a energia do EnergyThread chega nesta seção —
  // reage a um evento genérico (a seção opta em ouvir, o sistema global
  // não sabe nada sobre a cloud). Curto, discreto, nunca uma "explosão".
  useEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return undefined;

    function handleArrival(event) {
      if (event.detail?.id !== "how-i-build") return;
      const wrap = cloudWrapRef.current;
      if (!wrap) return;

      gsap.timeline().to(cloudGlowRef.current, { opacity: 0.6, duration: 0.15, ease: "power1.out" }).to(
        cloudGlowRef.current,
        { opacity: 0, duration: 0.6, ease: "sine.out" },
        ">-0.05"
      );

      const icons = Array.from(wrap.querySelectorAll("img"));
      const sample = icons.sort(() => Math.random() - 0.5).slice(0, Math.min(4, icons.length));
      sample.forEach((img) => {
        gsap
          .timeline()
          .to(img, { filter: "brightness(1.8)", duration: 0.12, ease: "power1.out" })
          .to(img, { filter: "brightness(1)", duration: 0.5, ease: "sine.out" });
      });
    }

    window.addEventListener("energy-thread-node", handleArrival);
    return () => window.removeEventListener("energy-thread-node", handleArrival);
  }, [reducedMotion]);

  return (
    <section
      id="how-i-build"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col items-center gap-14 overflow-hidden bg-paper px-[var(--gutter)] py-24 text-ink lg:flex-row lg:items-center lg:justify-between lg:gap-8"
    >
      <span className="font-mono-label text-label absolute left-[var(--gutter)] top-10 text-ink/50">how I build</span>

      <div className="flex w-full flex-col gap-8 lg:w-[56%]">
        <div className="h-px w-full bg-ink/15">
          <div ref={lineRef} className="h-full w-full bg-signal" />
        </div>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 lg:justify-between">
          {STEPS.map((step, index) => (
            <span
              key={step}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className="font-display text-heading font-medium"
            >
              {step}
            </span>
          ))}
        </div>

        <p ref={closingRef} className="text-body max-w-[32ch] text-ink/70">
          {CLOSING_LINE}
        </p>
      </div>

      <div ref={cloudWrapRef} className="relative aspect-square w-full max-w-[280px] lg:w-[42%] lg:max-w-[420px]">
        <div
          ref={cloudGlowRef}
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(111,233,228,0.5) 0%, transparent 70%)" }}
        />
        <InteractiveIconCloud reducedMotion={reducedMotion} />
      </div>
    </section>
  );
}
