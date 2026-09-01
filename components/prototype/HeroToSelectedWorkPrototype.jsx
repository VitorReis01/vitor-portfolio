"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/lib/motion/useReducedMotion";
import CustomCursor from "./CustomCursor";
import HeroSection from "./HeroSection";
import TransitionLayer from "./TransitionLayer";
import SelectedWorkStage from "./SelectedWorkStage";
import EnergyThread from "./EnergyThread";

// Fase 4 — protótipo 02: Hero (aprovado) → transição cinematográfica →
// Selected Work (arquitetura aprovada, reaproveitada sem alteração via
// SelectedWorkStage.jsx). Só este arquivo + TransitionLayer.jsx são novos;
// Hero e Selected Work não têm nenhuma linha mudada.
export default function HeroToSelectedWorkPrototype() {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) return undefined;

    let tick;
    let cancelled = false;
    // Uma única instância de Lenis pra página inteira (Hero + transição +
    // Selected Work) — nenhum componente cria a sua própria. Alimentada
    // pelo ticker do GSAP, não por um requestAnimationFrame próprio.
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
    <main data-experience-root className="relative bg-ink text-paper">
      <CustomCursor />

      <div className="fixed left-4 top-4 z-[90] flex items-center gap-3">
        <span className="font-mono-label text-label rounded-full border border-graphite/30 bg-ink/80 px-3 py-1.5 text-graphite backdrop-blur">
          prototype — hero to selected work
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

      {/* Hero + camada de transição, pinados juntos por TransitionLayer.
          data-transition-stage é como TransitionLayer resolve esse
          container a partir do próprio nó (ver comentário lá). */}
      <div data-transition-stage className="relative">
        <HeroSection reducedMotion={reducedMotion} />
        <TransitionLayer reducedMotion={reducedMotion} />
      </div>

      <SelectedWorkStage reducedMotion={reducedMotion} lenisRef={lenisRef} />

      <EnergyThread reducedMotion={reducedMotion} />
    </main>
  );
}
