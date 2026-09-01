"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/lib/motion/useReducedMotion";
import CustomCursor from "./CustomCursor";
import HeroSection from "./HeroSection";
import TransitionLayer from "./TransitionLayer";
import SelectedWorkStage from "./SelectedWorkStage";
import HowIBuildStage from "./HowIBuildStage";
import EnergyThread from "./EnergyThread";

// Fase 4 — protótipo 03: estende o protótipo 02 (Hero → transição →
// Selected Work) acrescentando How I Build na sequência. Hero,
// TransitionLayer e SelectedWorkStage não mudam nenhuma linha — só
// HowIBuildStage é novo. Selected Work → How I Build não ganha uma
// transição cinematográfica própria (o Motion Map só pediu isso pra
// Hero → Selected Work); a entrada é o mesmo fade/scale por viewport que
// HowIBuildStage já usa.
//
// EnergyThread aqui recebe lightSectionIds só com "about" — How I Build
// já entra dark neste protótipo, então não deve ser tratado como seção
// clara (deixar no default diluiria o traço numa seção que não é mais
// clara). Constante fora do componente pra manter a mesma referência
// entre renders.
const LIGHT_SECTION_IDS = new Set(["about"]);

export default function HeroToHowIBuildPrototype() {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) return undefined;

    let tick;
    let cancelled = false;
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
          prototype — hero to how i build
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

      <div data-transition-stage className="relative">
        <HeroSection reducedMotion={reducedMotion} />
        <TransitionLayer reducedMotion={reducedMotion} />
      </div>

      <SelectedWorkStage reducedMotion={reducedMotion} lenisRef={lenisRef} />
      <HowIBuildStage reducedMotion={reducedMotion} />

      <EnergyThread reducedMotion={reducedMotion} lightSectionIds={LIGHT_SECTION_IDS} />
    </main>
  );
}
