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
import HowIBuildToAboutOverlay from "./HowIBuildToAboutOverlay";
import AboutStage from "./AboutStage";
import AboutToContactOverlay from "./AboutToContactOverlay";
import EnergyThread from "./EnergyThread";

// Fase 5 — integração final. Não é um protótipo novo: é a composição
// completa da experiência aprovada (Hero → Selected Work → How I Build →
// About → Contact) montada como um único fluxo, com o
// MESMO HeroSection.jsx que a página principal (/prototype/vitor) já usa
// — reaproveitado por importação direta, não copiado. Toda seção listada
// abaixo é o componente aprovado sem nenhuma linha redesenhada; o
// trabalho desta rota é orquestração (uma única instância de Lenis, um
// único CustomCursor, um único EnergyThread), não criação.
//
// CapabilitiesSection (usada em PrototypeExperience/página principal) e
// BootLoader ficam de fora de propósito — não fazem parte da sequência
// aprovada pra esta integração e o boot loader foi explicitamente
// adiado.
//
// About e Contact renderizam direto, em fluxo normal (sem wrapper de
// pin, sem superfície "de mentira") — ver HowIBuildToAboutOverlay.jsx e
// AboutToContactOverlay.jsx pro porquê: as duas transições viraram
// camadas `position:fixed` sem pin próprio, especificamente pra
// eliminar o vão entre dois pins sequenciais que a versão anterior
// tinha (diagnosticado com scroll real, não só medição de geometria).
//
// Fase 6 — promoção pra home real (`/`). Mesmo componente, não uma
// cópia: `/` e `/prototype/final` renderizam este arquivo, evitando
// duas instâncias de Lenis/GSAP ticker/CustomCursor/EnergyThread
// coexistindo por acidente se alguém abrir as duas rotas em contextos
// diferentes. A ÚNICA diferença entre as duas rotas é `prototypeChrome`
// — controla só a etiqueta fixa "prototype — final integration" + link
// de volta, nunca teve nada a ver com a experiência em si.
const LIGHT_SECTION_IDS = new Set(["about"]);

export default function FinalExperience({ prototypeChrome = true }) {
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

      {prototypeChrome && (
        <div className="fixed left-4 top-4 z-[90] flex items-center gap-3">
          <span className="font-mono-label text-label rounded-full border border-graphite/30 bg-ink/80 px-3 py-1.5 text-graphite backdrop-blur">
            prototype — final integration
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
      )}

      <div data-transition-stage className="relative">
        <HeroSection reducedMotion={reducedMotion} />
        <TransitionLayer reducedMotion={reducedMotion} />
      </div>

      <SelectedWorkStage reducedMotion={reducedMotion} lenisRef={lenisRef} />
      <HowIBuildStage reducedMotion={reducedMotion} />
      <AboutStage />
      <HowIBuildToAboutOverlay reducedMotion={reducedMotion} />
      <AboutToContactOverlay reducedMotion={reducedMotion} />

      <EnergyThread reducedMotion={reducedMotion} lightSectionIds={LIGHT_SECTION_IDS} />
    </main>
  );
}
