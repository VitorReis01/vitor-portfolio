"use client";

import { forwardRef } from "react";
import MediaPlaceholder from "./MediaPlaceholder";

// Fase 4 — protótipo 04 (How I Build → About). Conteúdo idêntico ao
// AboutSection.jsx aprovado na página principal (mesma headline, corpo,
// retrato, link) — mas puramente apresentacional: não cria nenhum
// ScrollTrigger/timeline própria. Quem anima headline/body/media é
// PolarityTransition.jsx, através dos refs recebidos por prop — a entrada
// do texto precisa nascer da MESMA timeline que controla a dobra (dobra
// termina → About entra), não de dois sistemas independentes coincidindo
// por acaso no tempo.
const AboutStage = forwardRef(function AboutStage({ headlineRef, bodyRef, mediaRef }, sectionRef) {
  return (
    <section id="about" ref={sectionRef} className="relative overflow-hidden bg-paper px-[var(--gutter)] py-28 text-ink">
      <span className="font-mono-label text-label text-ink/50">about</span>

      <div className="relative mt-8 md:grid md:grid-cols-12 md:gap-6">
        <div ref={mediaRef} className="overflow-hidden rotate-1 md:col-span-5 md:col-start-1">
          <MediaPlaceholder label="[PORTRAIT — VITOR]" aspect="aspect-[3/4] md:aspect-[4/5]" className="!border-ink/25" />
        </div>

        <div className="relative mt-8 md:col-span-8 md:col-start-4 md:-mt-6">
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
});

export default AboutStage;
