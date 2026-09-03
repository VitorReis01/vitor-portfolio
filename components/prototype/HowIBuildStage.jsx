"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import StepHeadline from "./StepHeadline";
import TechMeteorField from "./TechMeteorField";

// Fase 4 — How I Build, nova direção (chuva de meteoros tecnológica).
// Substitui a apresentação anterior (5 palavras lado a lado + Icon Cloud
// esférica) por: uma palavra gigante por vez (a progressão é comunicada
// pelo próprio conteúdo — sem contador "01/05") + TechMeteorField, uma
// camada de símbolos das tecnologias atravessando a cena em diagonal,
// sincronizada 100% com o scroll. Continua sendo um componente novo, não
// uma edição do HowIBuildSection.jsx da página principal.
const STEPS = [
  { label: "ENTENDER" },
  { label: "ARQUITETAR" },
  { label: "CONSTRUIR" },
  { label: "INTEGRAR" },
  { label: "ENTREGAR" },
];
const CLOSING_LINE = "De uma ideia a um sistema funcionando.";

// Mesmo ritmo já aprovado: 65% de platô por etapa, 35% dividido entre as
// rampas de entrada/saída, cruzando em 0.5/0.5 no meio (ver histórico —
// uma rampa linear sem platô lia como "rápido demais").
const STEP_TRANSITION_FRACTION = 0.35;
function stepFocus(raw, index, isLast) {
  const half = STEP_TRANSITION_FRACTION / 2;
  const rising = gsap.utils.clamp(0, 1, (raw - (index - 0.5 - half)) / STEP_TRANSITION_FRACTION);
  const falling = isLast ? 1 : gsap.utils.clamp(0, 1, (index + 0.5 + half - raw) / STEP_TRANSITION_FRACTION);
  return Math.min(rising, falling);
}

// Troca de palavra como "mudança de estado do sistema", não um carrossel:
// bandas finas piscam sobre a palavra (quebra em fragmentos), ela perde
// sinal (opacidade cai), e a próxima materializa no mesmo ponto via
// ScrambleText — tudo num timeline curto e único, disparado apenas no
// instante em que a etapa líder muda (não é um loop por tempo).
function transitionWord(wordEl, sliceEls, glowEl, newLabel) {
  const tl = gsap.timeline();
  tl.set(sliceEls, { opacity: 1, scaleX: 0 })
    .to(sliceEls, { scaleX: 1, duration: 0.08, stagger: 0.02, ease: "none" }, 0)
    .to(wordEl, { opacity: 0.1, duration: 0.16, ease: "power1.in" }, 0)
    .to(sliceEls, { opacity: 0, duration: 0.14 }, 0.2)
    .to(
      wordEl,
      { opacity: 1, duration: 0.55, scrambleText: { text: newLabel, chars: "upperCase", speed: 0.4 } },
      0.22
    );
  if (glowEl) {
    tl.to(glowEl, { opacity: 0.7, duration: 0.15, ease: "power1.out" }, 0.18).to(
      glowEl,
      { opacity: 0, duration: 0.6, ease: "sine.out" },
      ">-0.1"
    );
  }
  return tl;
}

export default function HowIBuildStage({ reducedMotion }) {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const labelRef = useRef(null);
  const wordRef = useRef(null);
  const sliceRefs = useRef([]);
  const glowRef = useRef(null);
  const closingRef = useRef(null);
  const meteorFieldRef = useRef(null);
  const leadingIndexRef = useRef(-1);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(lineRef.current, { scaleX: 1 });
        gsap.set(labelRef.current, { opacity: 1 });
        if (wordRef.current) wordRef.current.textContent = STEPS[STEPS.length - 1].label;
        gsap.set(wordRef.current, { opacity: 1 });
        gsap.set(closingRef.current, { opacity: 1 });
        return;
      }

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left" });
      gsap.set(labelRef.current, { opacity: 0.5 });
      gsap.set(closingRef.current, { opacity: 0 });
      if (wordRef.current) wordRef.current.textContent = STEPS[0].label;
      gsap.set(wordRef.current, { opacity: 1 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        // Era +=240% — uma rolagem normal de roda já trocava de palavra
        // rápido demais. +=300% desktop / +=270% mobile dá mais espaço
        // de scroll por etapa (mais "giradas de rodinha" pra atravessar
        // cada uma), SEM tocar em STEP_TRANSITION_FRACTION/stepFocus nem
        // nas janelas [start,end] dos meteoros em TechMeteorField — a
        // proporção 65% platô / 35% transição continua idêntica, só em
        // função de mais distância total. O ritmo de cada meteoro
        // dentro do seu próprio step não muda; só cresce quanto scroll
        // físico é preciso pra atravessar o step inteiro.
        end: isDesktop ? "+=300%" : "+=270%",
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(lineRef.current, { scaleX: p });

          const raw = p * STEPS.length;
          meteorFieldRef.current?.update(raw, isDesktop);

          gsap.set(closingRef.current, { opacity: gsap.utils.clamp(0, 1, (p - 0.82) / 0.18) });

          const leading = gsap.utils.clamp(0, STEPS.length - 1, Math.round(raw - 0.5));
          if (leading !== leadingIndexRef.current) {
            leadingIndexRef.current = leading;
            if (leading > 0 || raw > 0.05) {
              transitionWord(wordRef.current, sliceRefs.current, glowRef.current, STEPS[leading].label);
            }
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Pulso quando a energia do EnergyThread chega nesta seção — agora
  // reage na palavra/glow em vez da Icon Cloud (removida desta
  // apresentação).
  useLayoutEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return undefined;

    function handleArrival(event) {
      if (event.detail?.id !== "how-i-build") return;
      gsap
        .timeline()
        .to(glowRef.current, { opacity: 0.6, duration: 0.15, ease: "power1.out" })
        .to(glowRef.current, { opacity: 0, duration: 0.6, ease: "sine.out" }, ">-0.05");
    }

    window.addEventListener("energy-thread-node", handleArrival);
    return () => window.removeEventListener("energy-thread-node", handleArrival);
  }, [reducedMotion]);

  return (
    <section
      id="how-i-build"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-ink py-24 text-paper"
    >
      <div className="absolute left-[var(--gutter)] right-[var(--gutter)] top-10 h-px bg-paper/15">
        <div ref={lineRef} className="h-full w-full bg-signal" />
      </div>

      <TechMeteorField ref={meteorFieldRef} reducedMotion={reducedMotion} />

      <StepHeadline
        labelRef={labelRef}
        wordRef={wordRef}
        sliceRefs={sliceRefs}
        glowRef={glowRef}
        closingRef={closingRef}
        closingLine={CLOSING_LINE}
      />
    </section>
  );
}
