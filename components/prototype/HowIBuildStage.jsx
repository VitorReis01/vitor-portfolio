"use client";

import { useLayoutEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// Fase 4 — protótipo 03 (How I Build). Novo componente, não uma edição do
// HowIBuildSection.jsx original (que a página principal ainda usa, claro
// e com os 6 passos em inglês) — criar do zero em vez de "reverter" evita
// tocar num arquivo compartilhado com a página principal. Reaproveita o
// InteractiveIconCloud existente sem nenhuma alteração.
const InteractiveIconCloud = dynamic(() => import("@/components/ui/interactive-icon-cloud"), { ssr: false });

// Passos em português (Motion Map, Fase 3) — cada um "dono" de um grupo de
// ferramentas da cloud. Cobre os 13 ícones existentes sem sobra/falta.
const STEPS = [
  { label: "ENTENDER", slugs: ["figma"] },
  { label: "ARQUITETAR", slugs: ["nextdotjs", "react", "nodedotjs"] },
  { label: "CONSTRUIR", slugs: ["javascript", "html5", "css3", "tailwindcss"] },
  { label: "INTEGRAR", slugs: ["postgresql", "git", "github"] },
  { label: "ENTREGAR", slugs: ["vercel", "threedotjs"] },
];
const CLOSING_LINE = "De uma ideia a um sistema funcionando.";

// Ritmo: cada passo tem centro em raw=index (raw = progress * 5 passos).
// 65% do espaço entre um centro e o próximo fica em platô (opacity 1
// parado); os 35% restantes — metade pro lado de cada vizinho — viram
// rampa. rising/falling são calculados de forma que a rampa de saída de
// um passo e a rampa de entrada do próximo ocupem exatamente a mesma
// faixa de `raw`, cruzando em 0.5/0.5 no meio — sem isso, os dois
// trapézios ficam com a borda em 0 exatamente no mesmo ponto e existe um
// instante em que nenhum passo está em foco. Antes a curva era uma rampa
// linear sem platô — cada passo já começava a ceder espaço assim que
// aparecia, o que lia como "rápido demais". O último passo não desce de
// volta: é o estado com que a seção termina antes da linha de fechamento.
const STEP_TRANSITION_FRACTION = 0.35;
function stepFocus(raw, index, isLast) {
  const half = STEP_TRANSITION_FRACTION / 2;
  const rising = gsap.utils.clamp(0, 1, (raw - (index - 0.5 - half)) / STEP_TRANSITION_FRACTION);
  const falling = isLast ? 1 : gsap.utils.clamp(0, 1, (index + 0.5 + half - raw) / STEP_TRANSITION_FRACTION);
  return Math.min(rising, falling);
}

export default function HowIBuildStage({ reducedMotion }) {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const stepRefs = useRef([]);
  const closingRef = useRef(null);
  const cloudWrapRef = useRef(null);
  const cloudGlowRef = useRef(null);
  const leadingIndexRef = useRef(-1);

  // Reação da cloud ao passo em foco — brilha o grupo do passo, esmaece o
  // resto. Cheguei a tentar reaproveitar o clickToFront do TagCanvas
  // (clique sintético nos ícones do grupo) pra "trazer pra frente" de
  // verdade, mas isso faz o TagCanvas regenerar os próprios nós DOM dos
  // ícones clicados, órfãos do tween que acabou de rodar — alguns ícones
  // ficavam sem reação nenhuma. O brilho/opacidade sozinho já lê como
  // "vem pra frente" sem competir com o estado interno do TagCanvas.
  function reactToStep(index) {
    const container = cloudWrapRef.current;
    if (!container) return;
    const anchors = Array.from(container.querySelectorAll("[data-icon-slug]"));
    if (!anchors.length) return;
    const groupSlugs = new Set(STEPS[index].slugs);

    anchors.forEach((a) => {
      const img = a.querySelector("img");
      if (!img) return;
      const inGroup = groupSlugs.has(a.dataset.iconSlug);
      gsap.to(img, {
        filter: inGroup ? "brightness(1.6)" : "brightness(0.5)",
        opacity: inGroup ? 1 : 0.55,
        duration: 0.45,
        ease: "power1.out",
      });
    });
  }

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

    const ctx = gsap.context(() => {
      const steps = stepRefs.current;

      if (reducedMotion) {
        gsap.set(lineRef.current, { scaleX: 1 });
        gsap.set(steps, { opacity: 1, y: 0 });
        gsap.set(closingRef.current, { opacity: 1 });
        gsap.set(cloudWrapRef.current, { opacity: 1, scale: 1 });
        return;
      }

      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left" });
      gsap.set(steps, { opacity: 0.15, y: 6 });
      gsap.set(closingRef.current, { opacity: 0 });
      gsap.set(cloudWrapRef.current, { opacity: 0, scale: 0.9 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(cloudWrapRef.current, { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" });
        },
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        // Era +=130% / scrub:0.5 — uma rolagem normal de roda atravessava
        // os 5 passos rápido demais. +=240% dá mais distância de scroll
        // pra cada passo respirar; scrub:0.8 suaviza a resposta ao wheel
        // sem virar lag perceptível.
        end: "+=240%",
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(lineRef.current, { scaleX: p });

          const raw = p * steps.length;
          steps.forEach((el, index) => {
            const focus = stepFocus(raw, index, index === steps.length - 1);
            gsap.set(el, { opacity: 0.15 + focus * 0.85, y: 6 - focus * 6 });
          });

          gsap.set(closingRef.current, { opacity: gsap.utils.clamp(0, 1, (p - 0.82) / 0.18) });

          const leading = gsap.utils.clamp(0, steps.length - 1, Math.round(raw - 0.5));
          if (leading !== leadingIndexRef.current) {
            leadingIndexRef.current = leading;
            const label = steps[leading];
            if (label) {
              gsap.to(label, {
                duration: 0.4,
                scrambleText: { text: STEPS[leading].label, chars: "upperCase", speed: 0.4 },
              });
            }
            reactToStep(leading);
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Pulso da cloud quando a energia do EnergyThread chega nesta seção —
  // gatilho distinto da reação por-step (esse é amplo/breve, o outro é
  // direcional/sustentado); os dois convivem sem competir.
  useLayoutEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return undefined;

    function handleArrival(event) {
      if (event.detail?.id !== "how-i-build") return;
      const wrap = cloudWrapRef.current;
      if (!wrap) return;

      gsap.timeline().to(cloudGlowRef.current, { opacity: 0.6, duration: 0.15, ease: "power1.out" }).to(
        cloudGlowRef.current,
        { opacity: 0, duration: 0.6, ease: "sine.out" },
        ">-0.05"
      );

      const icons = Array.from(wrap.querySelectorAll("img"));
      const sample = icons.sort(() => Math.random() - 0.5).slice(0, Math.min(4, icons.length));
      sample.forEach((img) => {
        gsap
          .timeline()
          .to(img, { filter: "brightness(1.8)", duration: 0.12, ease: "power1.out" })
          .to(img, { filter: "brightness(1)", duration: 0.5, ease: "sine.out" });
      });
    }

    window.addEventListener("energy-thread-node", handleArrival);
    return () => window.removeEventListener("energy-thread-node", handleArrival);
  }, [reducedMotion]);

  return (
    <section
      id="how-i-build"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col items-center gap-14 overflow-hidden bg-ink px-[var(--gutter)] py-24 text-paper lg:flex-row lg:items-center lg:justify-between lg:gap-8"
    >
      <span className="font-mono-label text-label absolute left-[var(--gutter)] top-10 text-paper/50">how i build</span>

      <div className="flex w-full flex-col gap-8 lg:w-[56%]">
        <div className="h-px w-full bg-paper/15">
          <div ref={lineRef} className="h-full w-full bg-signal" />
        </div>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 lg:justify-between">
          {STEPS.map((step, index) => (
            <span
              key={step.label}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className="font-display text-heading font-medium"
            >
              {step.label}
            </span>
          ))}
        </div>

        <p ref={closingRef} className="text-body max-w-[32ch] text-paper/70">
          {CLOSING_LINE}
        </p>
      </div>

      <div ref={cloudWrapRef} className="relative aspect-square w-full max-w-[280px] lg:w-[42%] lg:max-w-[420px]">
        <div
          ref={cloudGlowRef}
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(111,233,228,0.5) 0%, transparent 70%)" }}
        />
        <InteractiveIconCloud reducedMotion={reducedMotion} />
      </div>
    </section>
  );
}
