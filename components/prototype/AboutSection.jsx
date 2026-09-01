"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MediaPlaceholder from "./MediaPlaceholder";

// Composição preparada para o retrato real: a foto não mora numa coluna
// isolada — ela se estende por baixo do começo da headline (que cruza por
// cima dela, mesmo tratamento de colisão tipográfica da Hero), então texto
// e imagem já nascem como uma peça só, não "imagem | texto".
export default function AboutSection({ reducedMotion }) {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const bodyRef = useRef(null);
  const mediaRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set([headlineRef.current, bodyRef.current, mediaRef.current], {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0% 0% 0%)",
        });
        return;
      }

      gsap.set(headlineRef.current, { opacity: 0, y: 24 });
      gsap.set(bodyRef.current, { opacity: 0, y: 20 });
      gsap.set(mediaRef.current, { clipPath: "inset(0% 0% 100% 0%)" });

      const tl = gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } });
      tl.to(mediaRef.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.out" })
        .to(headlineRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.55")
        .to(bodyRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.35");

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
        onUpdate: (self) => {
          gsap.set(mediaRef.current, { yPercent: (self.progress - 0.5) * 6 });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="about" ref={sectionRef} className="relative overflow-hidden bg-paper px-[var(--gutter)] py-28 text-ink">
      <span className="font-mono-label text-label text-ink/50">about</span>

      <div className="relative mt-8 md:grid md:grid-cols-12 md:gap-6">
        <div
          ref={mediaRef}
          className="overflow-hidden rotate-1 md:col-span-5 md:col-start-1"
        >
          <MediaPlaceholder label="[PORTRAIT — VITOR]" aspect="aspect-[3/4] md:aspect-[4/5]" className="!border-ink/25" />
        </div>

        <div className="relative mt-8 md:col-span-8 md:col-start-4 md:-mt-6">
          {/* Overlap deliberado e moderado — quando o retrato real entrar,
              reverificar contraste aqui (pode precisar de scrim atrás do texto
              dependendo do tom da foto; ver docs, seção de riscos). */}
          <span className="font-mono-label text-label text-ink/50">Vitor Reis</span>
          <h2
            ref={headlineRef}
            className="font-display text-heading relative z-10 mt-3 max-w-[22ch] font-medium leading-[0.98]"
          >
            Designer. Developer.
            <br />
            Problem solver.
          </h2>

          <p ref={bodyRef} className="text-body relative z-10 mt-8 max-w-[52ch] text-ink/75 md:ml-[18%]">
            I design and build digital products from the interface to the infrastructure behind them. IMESUL is
            the clearest proof of that. Outside of client work, I keep independent builds in progress — SYNTRA and
            LOOKOUT — as a way of testing ideas until they become working systems.
          </p>

          <div className="relative z-10 mt-8 md:ml-[18%]">
            <span className="font-mono-label text-label text-ink/40">currently exploring</span>
            <p className="font-mono-label text-label mt-2 text-ink/70">LLMs / MCP / AI-integrated systems</p>
          </div>

          <a
            href="https://www.instagram.com/vitor.systems/"
            target="_blank"
            rel="noreferrer"
            className="font-mono-label text-label relative z-10 mt-8 inline-block text-ink/60 transition-colors duration-150 hover:text-ink md:ml-[18%]"
          >
            @vitor.systems
          </a>
        </div>
      </div>
    </section>
  );
}
