"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const CATALOG_STATS = [
  { value: 42, label: "products / subproducts" },
  { value: 297, label: "product configurations" },
];

// Cada item: largura "antes" é sempre 100%; "depois" é calculado em % daquilo.
const PERFORMANCE = [
  { label: "First Load JS", before: "345 KB", after: "153 KB", ratio: 153 / 345 },
  { label: "Public assets", before: "8.96 MB", after: "4.81 MB", ratio: 4.81 / 8.96 },
  { label: "WebM video", before: "2.74 MB", after: "1.43 MB", ratio: 1.43 / 2.74 },
];

const PRIMARY_FLOW = ["Catalog", "Configuration", "Quotation"];
const SUPPORTING_LAYER = ["Analytics", "Security", "Monitoring", "Deployment"];

function FlowConnector({ trackRef, dotRef }) {
  return (
    <span className="relative hidden h-px w-10 shrink-0 overflow-hidden bg-graphite/25 sm:block" ref={trackRef}>
      <span ref={dotRef} className="absolute inset-y-0 left-0 w-2 -translate-x-full bg-signal" />
    </span>
  );
}

// Prévia do case principal — não é o case completo (isso fica para a próxima
// etapa). Os números não ficam parados: o "antes" encolhe e o "depois" cresce
// no mesmo espaço, no ritmo do scroll — a redução vira o próprio movimento.
export default function CommerceCaseSection({ reducedMotion }) {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const mediaRef = useRef(null);
  const statRefs = useRef([]);
  const beforeRefs = useRef([]);
  const afterRefs = useRef([]);
  const barRefs = useRef([]);
  const flowRef = useRef(null);
  const connectorTrackRefs = useRef([]);
  const connectorDotRefs = useRef([]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const flowItems = flowRef.current.querySelectorAll("[data-flow-item]");

      if (reducedMotion) {
        gsap.set(mediaRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(beforeRefs.current, { opacity: 0.5, scale: 0.7, x: 0 });
        gsap.set(afterRefs.current, { opacity: 1, scale: 1 });
        gsap.set(barRefs.current, { scaleX: (i) => PERFORMANCE[i].ratio, transformOrigin: "left" });
        gsap.set(flowItems, { opacity: 1, y: 0 });
        statRefs.current.forEach((el, i) => {
          if (el) el.textContent = CATALOG_STATS[i].value;
        });
        return;
      }

      // Reveal discreto por máscara — mesmo padrão já usado nos outros
      // blocos de mídia do site, só que mais curto/contido, já que aqui é
      // uma peça de apoio ao lado dos números, não um momento cinematográfico.
      gsap.set(mediaRef.current, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.to(mediaRef.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: { trigger: mediaRef.current, start: "top 88%" },
      });

      // Números do catálogo contam do zero ao valor real assim que entram
      // em viewport — disparo único, não preso ao scroll.
      statRefs.current.forEach((el, i) => {
        const counter = { value: 0 };
        gsap.to(counter, {
          value: CATALOG_STATS[i].value,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(counter.value);
          },
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // Cada métrica de performance: o valor "antes" recolhe e esmaece
      // exatamente enquanto o "depois" cresce e ganha peso — um morph preso
      // ao scroll, não dois textos estáticos lado a lado.
      PERFORMANCE.forEach((metric, index) => {
        gsap.set(beforeRefs.current[index], { opacity: 1, scale: 1, x: 0 });
        gsap.set(afterRefs.current[index], { opacity: 0.15, scale: 0.7 });
        gsap.set(barRefs.current[index], { scaleX: 0, transformOrigin: "left" });

        ScrollTrigger.create({
          trigger: barRefs.current[index],
          start: "top 90%",
          end: "top 40%",
          scrub: 0.4,
          onUpdate: (self) => {
            gsap.set(beforeRefs.current[index], {
              opacity: 1 - self.progress * 0.85,
              scale: 1 - self.progress * 0.3,
              x: -self.progress * 6,
            });
            gsap.set(afterRefs.current[index], {
              opacity: 0.15 + self.progress * 0.85,
              scale: 0.7 + self.progress * 0.3,
            });
            gsap.set(barRefs.current[index], { scaleX: self.progress * metric.ratio });
          },
        });
      });

      gsap.set(flowItems, { opacity: 0, y: 8 });
      gsap.to(flowItems, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.06,
        scrollTrigger: { trigger: flowRef.current, start: "top 80%" },
      });

      // Pequeno pulso viajando pelos conectores do fluxo primário — o
      // sistema "vivo", não um infográfico estático.
      connectorTrackRefs.current.forEach((track, index) => {
        if (!track) return;
        const dot = connectorDotRefs.current[index];
        gsap.to(dot, {
          xPercent: 500,
          duration: 1.4,
          ease: "power1.inOut",
          repeat: -1,
          repeatDelay: 0.6,
          delay: index * 0.5,
          scrollTrigger: { trigger: flowRef.current, start: "top 90%", toggleActions: "play pause resume pause" },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="imesul-case" ref={sectionRef} className="bg-ink px-[var(--gutter)] py-24">
      <div className="flex flex-col gap-2">
        <span className="font-mono-label text-label text-graphite">01 / IMESUL — extended case</span>
        <h2
          ref={headlineRef}
          data-handoff-headline
          className="font-display text-display max-w-[14ch] font-semibold leading-[0.95] text-paper"
        >
          From catalog
          <br />
          to digital system.
        </h2>
        <p className="text-body mt-4 max-w-[62ch] text-paper/75">
          Institutional site + real commercial experience for a metal materials distributor, with two entry paths —{" "}
          <span className="text-paper">&quot;Tenho um Projeto&quot;</span> and{" "}
          <span className="text-paper">&quot;Já Sei o Material&quot;</span> — covering catalog, technical
          specification and the quotation journey through to WhatsApp.
        </p>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <div ref={mediaRef} className="relative aspect-[748/710] overflow-hidden">
            <Image
              className="object-cover"
              src="/media/digital-commerce/catalog-specification.webp"
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              alt="Catálogo de materiais da Área de Vendas, com grid de categorias de produtos como tubos, telhas, perfis e acessórios."
            />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-12 md:col-span-7">
          <div className="flex gap-14">
            {CATALOG_STATS.map((stat, index) => (
              <div key={stat.label}>
                <span className="font-display text-display font-semibold tabular-nums text-paper">
                  <span
                    ref={(el) => {
                      statRefs.current[index] = el;
                    }}
                  >
                    0
                  </span>
                </span>
                <p className="font-mono-label text-label mt-2 text-graphite">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {PERFORMANCE.map((metric, index) => (
              <div key={metric.label} className="relative">
                <div className="relative h-[3.6rem]">
                  <span
                    ref={(el) => {
                      beforeRefs.current[index] = el;
                    }}
                    className="font-display text-metric-before absolute bottom-0 left-0 origin-bottom-left whitespace-nowrap text-graphite/70 line-through decoration-graphite/50"
                  >
                    {metric.before}
                  </span>
                  <span
                    ref={(el) => {
                      afterRefs.current[index] = el;
                    }}
                    className="font-display text-metric absolute bottom-0 left-0 origin-bottom-left whitespace-nowrap font-semibold text-paper"
                  >
                    {metric.after}
                  </span>
                </div>
                <div className="mt-2 h-[2px] w-full bg-graphite/20">
                  <div
                    ref={(el) => {
                      barRefs.current[index] = el;
                    }}
                    className="h-full bg-signal"
                  />
                </div>
                <p className="font-mono-label text-label mt-3 text-graphite">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={flowRef} className="mt-20 flex flex-col gap-6 border-t border-graphite/15 pt-10">
        <span className="font-mono-label text-label text-graphite">how the system connects</span>

        <div className="flex flex-wrap items-center gap-3">
          {PRIMARY_FLOW.map((step, index) => (
            <span key={step} className="contents">
              <span
                data-flow-item
                className="font-mono-label text-label rounded-full border border-paper/25 px-4 py-2 text-paper"
              >
                {step}
              </span>
              {index < PRIMARY_FLOW.length - 1 ? (
                <FlowConnector
                  trackRef={(el) => {
                    connectorTrackRefs.current[index] = el;
                  }}
                  dotRef={(el) => {
                    connectorDotRefs.current[index] = el;
                  }}
                />
              ) : null}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {SUPPORTING_LAYER.map((tag) => (
            <span
              key={tag}
              data-flow-item
              className="font-mono-label text-label rounded-full border border-graphite/25 px-4 py-2 text-graphite"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
