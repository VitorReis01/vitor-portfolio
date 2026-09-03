"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fase 4 — protótipo 02 (Hero → Selected Work). O Hero em si não é
// alterado: este componente só observa/controla de fora (opacidade,
// ScrollTrigger próprio do HeroPhotoEffect desabilitado via API pública do
// GSAP) e desenha por cima a coreografia de handoff.
//
// Refinamento posterior: existia uma "prévia" do IMESUL (poster + label)
// revelada pelas faixas ANTES do SelectedWorkStage real assumir — lida
// como uma tela intermediária própria ("Hero → trailer do IMESUL →
// IMESUL de novo"). Removida por completo. Agora as faixas revelam
// diretamente para o fim do pin: a janela de retração foi deslocada pra
// terminar bem perto de progress=1, então não sobra um "buraco" pinado
// mostrando só ink vazio entre as faixas abertas e o SelectedWorkStage
// real assumindo — as duas coisas acontecem em sequência imediata.
//
// Fase 5 — correção de ritmo (vídeo real mostrou sensação de
// travamento). Diagnóstico medido: pin de `+=150%`/`+=100%` (desktop/
// mobile) tinha um HOLD explícito de 5% do progresso (0.5–0.55) com as
// faixas 100% fechadas antes de começarem a abrir — a 150% de distância,
// isso sozinho já era ~11% de uma viewport inteira de preto sólido,
// sem contar o tempo de abertura em si, que só começava DEPOIS desse
// hold. Corrigido: pin encurtado (+=80%/+=55%) e o hold explícito
// removido — fechamento e abertura agora são CONTÍNUOS (a última faixa
// termina de fechar no mesmo instante em que a primeira já começa a
// abrir, sem platô no meio). Ver `PIN_END`/percentuais no onUpdate.
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
  const heroCoveredRef = useRef(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    // Resolvido a partir do próprio nó, não de um ref passado por prop —
    // mesma lição do EnergyThread (Fase 4, protótipo Selected Work): um
    // ref de container só é garantido já anexado dentro do próprio
    // componente que o possui, nunca confiável num useLayoutEffect de um
    // componente diferente no mesmo commit.
    const stageWrap = rootRef.current?.closest("[data-transition-stage]");
    if (!stageWrap) return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const heroEl = document.getElementById("hero");
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const activeParticles = particleRefs.current.slice(0, isDesktop ? PARTICLE_COUNT_DESKTOP : PARTICLE_COUNT_MOBILE);

    // Achado na integração: as faixas começavam FECHADAS (scaleY:1) desde
    // o primeiro frame — cobriam o Hero por inteiro antes de qualquer
    // scroll, sem nenhuma fase que as abrisse primeiro. Bug pré-existente
    // (reproduzido em /prototype/hero-to-contact também, não é algo novo
    // desta integração) — nunca tinha sido percebido visualmente porque
    // os testes anteriores sempre começavam já rolados. Corrigido abaixo:
    // abertas em repouso, fecham em sincronia com o fade do Hero.
    gsap.set(stripRefs.current, { scaleY: 0 });
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
      // Encurtado de +=150%/+=100% — a distância antiga, somada ao hold
      // explícito que existia (ver abaixo), fazia a ponte inteira demorar
      // demais e dar sensação de travamento (achado com scroll real, não
      // só medição). Mesma proporção desktop/mobile de antes (~1.5x).
      const pinEnd = isDesktop ? "+=80%" : "+=55%";

      const st = ScrollTrigger.create({
        trigger: stageWrap,
        start: "top top",
        end: pinEnd,
        pin: true,
        // Resposta mais firme — scrub alto nessa ponte especificamente lia
        // como atraso entre a rodinha do mouse e a resposta visual, o que
        // reforçava a sensação de travamento. Lenis global não muda.
        scrub: 0.35,
        onUpdate: (self) => {
          const p = self.progress;

          // 0–30%: o rosto/interface do Hero perde densidade (canvas +
          // headline + subline + placa, a seção inteira) EM SINCRONIA com
          // o fechamento das faixas — mesmo blackout único.
          // 30–32%: turnaround — só o suficiente pra não haver um "pulo"
          // matemático entre fechar e abrir; não é mais um hold
          // perceptível (era 5% de uma distância 1.9x maior antes; agora
          // é 2% de uma distância bem menor — na prática, imperceptível).
          // 32–85%: faixas abrem revelando o SelectedWorkStage real, cada
          // uma com seu próprio atraso (nunca todas juntas).
          // 85–100%: Selected Work já estabelecido, pin solta.
          const heroT = remap(p, 0, 0.3);
          if (heroEl) {
            gsap.set(heroEl, { opacity: 1 - heroT, scale: 1 + heroT * 0.05, filter: `blur(${heroT * 5}px)` });
          }

          const closing = remap(p, 0, 0.3);
          const maskT = remap(p, 0.32, 0.85);
          stripRefs.current.forEach((strip, i) => {
            if (!strip) return;
            const opening = remap(maskT, i * 0.05, i * 0.05 + 0.55);
            gsap.set(strip, { scaleY: Math.min(closing, 1 - opening) });
          });

          // Partículas: envelope triangular reescalado pra mesma janela.
          const particleT = Math.min(remap(p, 0.12, 0.3), 1 - remap(p, 0.62, 0.85));
          gsap.set(particleLayerRef.current, { opacity: particleT });

          // Performance: o loop rAF do canvas do Hero (HeroPhotoEffect.jsx)
          // só é gated por IntersectionObserver — opacity:0 não tira o
          // elemento da interseção geométrica, então ele continuava
          // desenhando ~30 mil células + bloom/grain TODO frame mesmo
          // 100% coberto pelas faixas (medido, não suposição — ver relato
          // final). Pausa só quando heroT chega em 1 (já visualmente
          // coberto, nunca antes) e retoma se o usuário rolar de volta.
          const covered = heroT >= 1;
          if (covered !== heroCoveredRef.current) {
            heroCoveredRef.current = covered;
            window.dispatchEvent(new CustomEvent("hero-canvas-pause", { detail: { paused: covered } }));
          }
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
      if (heroCoveredRef.current) {
        heroCoveredRef.current = false;
        window.dispatchEvent(new CustomEvent("hero-canvas-pause", { detail: { paused: false } }));
      }
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
