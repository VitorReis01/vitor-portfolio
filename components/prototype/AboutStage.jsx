"use client";

import { forwardRef } from "react";
import Image from "next/image";

// Fase 4 — protótipo 04 (How I Build → About). Conteúdo idêntico ao
// AboutSection.jsx aprovado na página principal (mesma headline, corpo,
// retrato, link) — mas puramente apresentacional: não cria nenhum
// ScrollTrigger/timeline própria. Quem anima headline/body/media é
// PolarityTransition.jsx, através dos refs recebidos por prop — a entrada
// do texto precisa nascer da MESMA timeline que controla a dobra (dobra
// termina → About entra), não de dois sistemas independentes coincidindo
// por acaso no tempo.
//
// Correção de zona morta (auditoria pós-integração): o padding inferior
// original (py-28, igual em cima e embaixo) deixava um "andar" de ~112px
// de bg-paper vazio depois do link @vitor.systems — respiro correto no
// topo (onde o retrato/label "about" começam), mas puro vazio embaixo,
// já que não existe mais conteúdo depois do link. Reduzido só embaixo
// (pb-12): mantém uma margem editorial pequena sem ser uma viewport
// vazia.
const AboutStage = forwardRef(function AboutStage({ headlineRef, bodyRef, mediaRef }, sectionRef) {
  return (
    <section id="about" ref={sectionRef} className="relative overflow-hidden bg-paper px-[var(--gutter)] pb-12 pt-28 text-ink">
      <span className="font-mono-label text-label text-ink/50">sobre</span>

      <div className="relative mt-8 md:grid md:grid-cols-12 md:gap-6">
        <div ref={mediaRef} className="overflow-hidden rotate-1 md:col-span-5 md:col-start-1">
          <div className="relative aspect-[3/4] overflow-hidden border border-ink/25 md:aspect-[4/5]">
            <Image
              src="/media/about/vitor-seated.png"
              alt="Vitor Reis"
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
              style={{ objectPosition: "50% 35%" }}
            />
          </div>
        </div>

        <div className="relative mt-8 md:col-span-8 md:col-start-4 md:-mt-6">
          <span className="font-mono-label text-label text-ink/50">Vitor Reis</span>
          <h2
            ref={headlineRef}
            className="font-display text-heading relative z-10 mt-3 max-w-[22ch] font-medium leading-[0.98]"
          >
            Designer. Desenvolvedor.
            <br />
            Resolvo problemas.
          </h2>

          <p ref={bodyRef} className="text-body relative z-10 mt-8 max-w-[52ch] text-ink/75 md:ml-[18%]">
            Eu projeto e construo produtos digitais, da interface à infraestrutura por trás deles. A IMESUL é a
            prova mais clara disso. Fora dos trabalhos para clientes, mantenho projetos independentes em
            desenvolvimento — SYNTRA e LOOKOUT — como uma forma de testar ideias até que elas se tornem sistemas
            funcionando de verdade.
          </p>

          <div className="relative z-10 mt-8 md:ml-[18%]">
            <span className="font-mono-label text-label text-ink/40">explorando agora</span>
            <p className="font-mono-label text-label mt-2 text-ink/70">LLMs / MCP / sistemas integrados com IA</p>
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
