"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/lib/motion/useReducedMotion";
import CustomCursor from "./CustomCursor";
import SelectedWorkStage from "./SelectedWorkStage";

function IntroFiller() {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-4 bg-ink px-[var(--gutter)] text-center">
      <span className="font-mono-label text-label text-graphite">scroll to begin</span>
      <h1 className="font-display text-heading max-w-[20ch] font-semibold uppercase text-paper/90">
        Selected Work — Motion Prototype
      </h1>
      <p className="text-body max-w-[46ch] text-paper/55">
        Um único media shell que se reconfigura — 16:9 → 9:16 → 16:9 — conforme IMESUL, SYNTRA e LOOKOUT assumem o
        palco, um de cada vez.
      </p>
    </section>
  );
}

function OutroFiller() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-2 bg-ink px-[var(--gutter)] text-center">
      <span className="font-mono-label text-label text-graphite">end of prototype</span>
      <p className="text-body max-w-[40ch] text-paper/55">Isolado da página principal — nada aqui foi integrado ainda.</p>
    </section>
  );
}

// Protótipo isolado 01 — só o palco do Selected Work (arquitetura aprovada
// em SelectedWorkStage.jsx). Fase 4 seguinte (Hero→Selected Work) reaproveita
// o mesmo SelectedWorkStage sem duplicar nada daqui.
export default function SelectedWorkMotionPrototype() {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) return undefined;

    let tick;
    let cancelled = false;
    // Loop unificado: o tick do Lenis roda dentro do ticker do GSAP em vez
    // de ter seu próprio requestAnimationFrame. (Revisão pendente antes da
    // integração final — a página principal deve usar uma única instância
    // de Lenis, não uma por seção.)
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      lenisRef.current = lenis;
      tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    });

    return () => {
      cancelled = true;
      if (tick) gsap.ticker.remove(tick);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <main className="relative bg-ink text-paper">
      <CustomCursor />

      <div className="fixed left-4 top-4 z-[90] flex items-center gap-3">
        <span className="font-mono-label text-label rounded-full border border-graphite/30 bg-ink/80 px-3 py-1.5 text-graphite backdrop-blur">
          prototype — selected work motion
        </span>
        <a
          href="/prototype/vitor"
          data-cursor="label"
          data-cursor-label="back"
          className="font-mono-label text-label text-graphite hover:text-paper"
        >
          ← vitor
        </a>
      </div>

      <IntroFiller />
      <SelectedWorkStage reducedMotion={reducedMotion} lenisRef={lenisRef} />
      <OutroFiller />
    </main>
  );
}
