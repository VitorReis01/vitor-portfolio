"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import HeroPhotoEffect from "./HeroPhotoEffect";
import HeroBadge from "./HeroBadge";

const HEADLINE = "Arquitetando sistemas para o mundo real.";
const SUBLINE =
  "Backend, automações e desenvolvimento sob medida para empresas que precisam de tecnologia com propósito.";

// Copy em português, voltada a clientes brasileiros. Headline e subline
// vivem só na metade esquerda (área preta do efeito) — nunca sobre o
// rosto, nunca atravessando a linha ciano: o container do meio usa
// justify-between (mesma técnica do rosto procedural anterior) pra
// empurrar a headline pro topo e a subline pro fundo do espaço
// disponível, abrindo um vão livre exatamente na faixa onde a linha
// cruza a imagem.
//
// "VITOR REIS" aparece só uma vez no site inteiro — o Nav (fixo, todas as
// seções) já cobre isso; o Hero não duplica um label próprio.
export default function HeroSection({ reducedMotion }) {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const sublineRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return undefined;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.2 })
        .fromTo(headlineRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" })
        .fromTo(sublineRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col overflow-hidden bg-ink px-[var(--gutter)] pb-10 pt-28 md:pb-16"
    >
      <HeroPhotoEffect reducedMotion={reducedMotion} heroSectionRef={sectionRef} />
      <HeroBadge reducedMotion={reducedMotion} />

      <div className="relative z-10 flex flex-1 flex-col justify-between py-8 md:py-12">
        <h1
          ref={headlineRef}
          className="font-display text-heading max-w-[15ch] font-medium leading-[1.05] text-paper md:max-w-[16ch]"
        >
          {HEADLINE}
        </h1>

        <p ref={sublineRef} className="text-body max-w-[30ch] text-paper/70 md:max-w-[34ch]">
          {SUBLINE}
        </p>
      </div>
    </section>
  );
}
