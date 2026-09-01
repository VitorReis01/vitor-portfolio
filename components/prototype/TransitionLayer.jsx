"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { PROJECTS } from "@/lib/projects";

// Fase 4 — protótipo 02 (Hero → Selected Work). O Hero em si não é
// alterado: este componente só observa/controla de fora (opacidade,
// ScrollTrigger próprio do HeroPhotoEffect desabilitado via API pública do
// GSAP) e desenha por cima a coreografia de handoff.
//
// Larguras das faixas — irregulares de propósito (não é persiana de
// PowerPoint), mas fixas (não Math.random() no render) pra não gerar
// mismatch de hidratação. Soma 100.
const STRIP_WIDTHS = [11, 14, 9, 15, 10, 13, 8, 12, 8];

// Partículas: posições/atrasos determinísticos (função do índice, não
// Math.random() no render) pelo mesmo motivo — a variação "orgânica" vem
// do padrão numérico, não de aleatoriedade real.
const PARTICLE_COUNT_DESKTOP = 22;
const PARTICLE_COUNT_MOBILE = 9;
const PARTICLES = Array.from({ length: PARTICLE_COUNT_DESKTOP }, (_, i) => ({
  x: (i * 37) % 100,
  delay: ((i * 13) % 40) / 10,
  fall: 60 + ((i * 23) % 90),
  size: 1.4 + ((i * 7) % 5) * 0.3,
}));

const IMESUL = PROJECTS[0];
const THREAD_COLOR = "150, 225, 255";

function remap(value, inMin, inMax) {
  if (inMax === inMin) return value >= inMax ? 1 : 0;
  return Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
}

export default function TransitionLayer({ reducedMotion }) {
  const rootRef = useRef(null);
  const stripRefs = useRef([]);
  const particleLayerRef = useRef(null);
  const particleRefs = useRef([]);
  const labelRef = useRef(null);
  const previewWrapRef = useRef(null);
  const splitFiredRef = useRef(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    // Resolvido a partir do próprio nó, não de um ref passado por prop —
    // mesma lição do EnergyThread (Fase 4, protótipo Selected Work): um
    // ref de container só é garantido já anexado dentro do próprio
    // componente que o possui, nunca confiável num useLayoutEffect de um
    // componente diferente no mesmo commit.
    const stageWrap = rootRef.current?.closest("[data-transition-stage]");
    if (!stageWrap) return undefined;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const heroEl = document.getElementById("hero");
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const activeParticles = particleRefs.current.slice(0, isDesktop ? PARTICLE_COUNT_DESKTOP : PARTICLE_COUNT_MOBILE);

    gsap.set(stripRefs.current, { scaleY: 1 });
    gsap.set(previewWrapRef.current, { opacity: 0, scale: 0.94 });
    gsap.set(labelRef.current, { opacity: 0 });
    gsap.set(particleLayerRef.current, { opacity: 0 });
    gsap.set(activeParticles, { opacity: 0 });

    if (reducedMotion) {
      // Sem blinds, sem pin: Hero termina seu próprio fade estático (já
      // tratado por HeroPhotoEffect), esta camada fica totalmente inerte,
      // e o Selected Work aparece limpo logo abaixo — nada aqui compete.
      return undefined;
    }

    // O ScrollTrigger próprio do HeroPhotoEffect (fade ligado ao scroll
    // natural da própria section) é desabilitado por fora, via API pública
    // do GSAP — nenhuma linha de HeroPhotoEffect.jsx muda. A partir daqui
    // esta camada assume o controle da opacidade/escala do Hero, em
    // sincronia com o resto da coreografia.
    let disabledTriggers = [];
    if (heroEl) {
      disabledTriggers = ScrollTrigger.getAll().filter((st) => st.trigger === heroEl);
      disabledTriggers.forEach((st) => st.disable());
    }

    const ctx = gsap.context(() => {
      const pinEnd = isDesktop ? "+=150%" : "+=100%";

      const fireLabelSplit = () => {
        if (splitFiredRef.current || !labelRef.current) return;
        splitFiredRef.current = true;
        const split = new SplitText(labelRef.current, { type: "chars" });
        gsap.set(labelRef.current, { opacity: 1 });
        gsap.fromTo(
          split.chars,
          { opacity: 0, y: (i) => (i % 2 === 0 ? -6 : 6), filter: "blur(3px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, stagger: 0.02, ease: "power2.out" }
        );
      };

      const st = ScrollTrigger.create({
        trigger: stageWrap,
        start: "top top",
        end: pinEnd,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;

          // 0.20–0.50: o rosto/interface do Hero perde densidade — a MESMA
          // seção inteira (canvas + headline + subline + placa), não só o
          // canvas, porque a "interface perdendo presença" é o Hero como
          // um todo, não só o retrato.
          const heroT = remap(p, 0.2, 0.5);
          if (heroEl) {
            gsap.set(heroEl, { opacity: 1 - heroT, scale: 1 + heroT * 0.05, filter: `blur(${heroT * 5}px)` });
          }

          // 0.45–0.70: faixas revelam a cena seguinte, cada uma com seu
          // próprio atraso — nunca todas se movendo juntas.
          const maskT = remap(p, 0.45, 0.7);
          stripRefs.current.forEach((strip, i) => {
            if (!strip) return;
            const local = remap(maskT, i * 0.05, i * 0.05 + 0.55);
            gsap.set(strip, { scaleY: 1 - local });
          });
          if (maskT > 0.35) fireLabelSplit();

          // 0.55–0.88: a prévia do IMESUL ganha presença DEPOIS que o Hero
          // já sumiu (0.5) — nunca os dois legíveis ao mesmo tempo.
          const previewT = remap(p, 0.55, 0.88);
          gsap.set(previewWrapRef.current, { opacity: previewT, scale: 0.94 + previewT * 0.06 });

          // Partículas: sobem/somem num envelope triangular sobre a janela
          // 0.18–0.82 — acompanham o reveal sem serem o efeito principal.
          const particleT = Math.min(remap(p, 0.18, 0.4), 1 - remap(p, 0.68, 0.85));
          gsap.set(particleLayerRef.current, { opacity: particleT });
        },
      });

      // Partículas: cada uma sobe/deriva em loop curto próprio (independente
      // do progresso fino do scroll — só a opacidade da camada é scroll-driven).
      activeParticles.forEach((el, i) => {
        if (!el) return;
        const data = PARTICLES[i];
        gsap.set(el, { opacity: 0.5, y: 0 });
        gsap.to(el, {
          y: -data.fall,
          duration: 3.5 + (i % 5) * 0.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: data.delay,
        });
      });

      return () => st.kill();
    }, stageWrap);

    return () => {
      disabledTriggers.forEach((sTrigger) => sTrigger.enable());
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden="true">
      {/* Partículas — dados/pixels se soltando do Hero durante o handoff. */}
      <div ref={particleLayerRef} className="absolute inset-0">
        {PARTICLES.map((particle, i) => (
          <span
            key={i}
            ref={(el) => (particleRefs.current[i] = el)}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: "38%",
              width: particle.size,
              height: particle.size,
              background: `rgba(${THREAD_COLOR}, 0.75)`,
            }}
          />
        ))}
      </div>

      {/* Prévia leve do IMESUL — não é a SelectedWorkStage real, só um eco
          visual revelado pelas faixas; a seção real assume por trás assim
          que o pin termina. */}
      <div ref={previewWrapRef} className="absolute inset-0 flex items-center justify-center px-[var(--gutter)]">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-md" style={{ aspectRatio: "16 / 9" }}>
          <img
            src={IMESUL.media.poster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "saturate(0.9)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <span className="font-mono-label text-label absolute left-5 top-5 text-paper/70">01 / 03</span>
          <span
            ref={labelRef}
            className="font-display absolute bottom-5 left-5 text-2xl font-semibold uppercase text-paper md:text-3xl"
          >
            SELECTED WORK
          </span>
        </div>
      </div>

      {/* Faixas — largura irregular, atraso próprio, borda ciano fina na
          aresta que retrai (sinal ativo, não decorativo). */}
      <div className="absolute inset-0 flex">
        {STRIP_WIDTHS.map((width, i) => (
          <span
            key={i}
            ref={(el) => (stripRefs.current[i] = el)}
            className="h-full bg-ink"
            style={{
              width: `${width}%`,
              transformOrigin: i % 2 === 0 ? "top" : "bottom",
              borderBottom: i % 2 === 0 ? `1px solid rgba(${THREAD_COLOR}, 0.5)` : "none",
              borderTop: i % 2 !== 0 ? `1px solid rgba(${THREAD_COLOR}, 0.5)` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
