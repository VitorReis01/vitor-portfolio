"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/lib/motion/useReducedMotion";
import BootLoader from "./BootLoader";
import CustomCursor from "./CustomCursor";
import SectionProgress from "./SectionProgress";
import Nav from "./Nav";
import EnergyThread from "./EnergyThread";
import HeroSection from "./HeroSection";
import SelectedWorkSection from "./SelectedWorkSection";
import CapabilitiesSection from "./CapabilitiesSection";
import HowIBuildSection from "./HowIBuildSection";
import AboutSection from "./AboutSection";
import ContactSection from "./ContactSection";

// Orquestrador do protótipo isolado (/prototype/vitor). Liga o smooth scroll
// (Lenis) ao GSAP ScrollTrigger e decide, uma única vez, o nível de motion
// permitido — todas as seções consultam esse mesmo estado.
//
// Narrativa: Impact/Intro → Selected Work (protagonista, 03 projetos reais)
// → Capabilities → How I Build → About → Contact. As antigas telas
// conceituais (Idea/Strategy/System) viraram a passagem curta de
// HowIBuildSection — projeto real primeiro, conceito como apoio breve.
export default function PrototypeExperience() {
  const reducedMotion = useReducedMotion();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) return undefined;

    let lenis;
    let rafId;

    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time) => {
        lenis.raf(time * 1000);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapperRef} data-experience-root className="relative bg-ink">
      <BootLoader reducedMotion={reducedMotion} />
      <CustomCursor />
      <SectionProgress />
      <Nav />

      <HeroSection reducedMotion={reducedMotion} />
      <SelectedWorkSection reducedMotion={reducedMotion} />
      <CapabilitiesSection />
      <HowIBuildSection reducedMotion={reducedMotion} />
      <AboutSection reducedMotion={reducedMotion} />
      <ContactSection reducedMotion={reducedMotion} />

      <EnergyThread reducedMotion={reducedMotion} />
    </div>
  );
}
