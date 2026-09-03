"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AboutStage from "./AboutStage";

// Fase 4 — protótipo 04: a dobra de polaridade How I Build (dark) → About
// (light). Uma única ScrollTrigger/timeline controla as duas metades da
// cena (a dobra E a entrada do conteúdo do About) a partir do mesmo
// `self.progress` — a causalidade "dobra termina → About entra" fica
// explícita no cálculo abaixo, não depende de CustomEvent nem de dois
// sistemas coincidindo por acaso no tempo.
//
// Geometria previsível: o wrapper que contém o AboutStage é o que fica
// pinado (mesma técnica de TransitionLayer/SelectedWorkStage) — enquanto a
// dobra roda, o documento NÃO rola de verdade por trás da máscara, então
// headline/retrato nunca estão "se deslocando" durante o reveal; eles só
// recebem opacidade/clip-path, nunca posição. O plano off-white da dobra é
// renderizado como IRMÃO do wrapper pinado, não filho — um elemento
// `position:fixed` dentro de um ancestral que o GSAP transforma (pinType
// "transform", o padrão) fica preso a esse ancestral em vez do viewport
// real; como irmão, nunca corre esse risco.
export default function PolarityTransition({ reducedMotion }) {
  const wrapRef = useRef(null);
  const foldRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const headlineRef = useRef(null);
  const bodyRef = useRef(null);
  const mediaRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        // Corte instantâneo — sem dobra animada, sem deslocamento de
        // conteúdo. O About já assenta pronto.
        gsap.set(foldRef.current, { clipPath: "inset(50% 50% 50% 50%)" });
        gsap.set(aboutSectionRef.current, { opacity: 1 });
        gsap.set(headlineRef.current, { opacity: 1, y: 0 });
        gsap.set(bodyRef.current, { opacity: 1, y: 0 });
        gsap.set(mediaRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }

      gsap.set(foldRef.current, { clipPath: "inset(50% 50% 50% 50%)" });
      // O <section> do AboutStage tem seu próprio bg-paper opaco — sem
      // escondê-lo, ele preenche o wrap inteiro (bg-ink) desde o
      // primeiro frame e o plano da dobra cresce sobre um fundo que já
      // era claro, tornando o "dark → plano cresce → revela" invisível
      // na prática (achado durante a integração — geometria/stacking,
      // não redesenho: o comentário original já descrevia esse
      // comportamento como a intenção). Escondido até o fold já cobrir
      // a tela por completo (hold começa em 55%), reaparece encoberto —
      // sem pop visível.
      gsap.set(aboutSectionRef.current, { opacity: 0 });
      gsap.set(headlineRef.current, { opacity: 0, y: 24 });
      gsap.set(bodyRef.current, { opacity: 0, y: 20 });
      gsap.set(mediaRef.current, { clipPath: "inset(0% 0% 100% 0%)" });

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      // 70–90vh no desktop, 55–70vh no mobile — ponto médio de cada faixa
      // como partida, ajustável depois visualmente.
      const distance = Math.round(window.innerHeight * (isDesktop ? 0.8 : 0.62));

      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: `+=${distance}`,
        pin: true,
        scrub: 0.3,
        onUpdate: (self) => {
          const p = self.progress;

          // Progressão pedida, em fração da janela inteira da dobra:
          //   0–15%   colapsado — How I Build (dark) ainda "presente"
          //           (o wrap pinado já é bg-ink, então nada precisa
          //           acontecer aqui além de não mostrar o plano ainda).
          //   15–55%  o plano off-white cresce do centro.
          //   55–70%  hold — tela completamente clara por um instante.
          //   70–100% o plano se retrai por uma aresta diferente da que
          //           usou pra crescer, revelando o About.
          let v0;
          let v1;
          let v2;
          let v3;
          if (p < 0.15) {
            v0 = v1 = v2 = v3 = 50;
          } else if (p < 0.55) {
            const t = (p - 0.15) / 0.4;
            const v = 50 - t * 50;
            v0 = v1 = v2 = v3 = v;
          } else if (p < 0.7) {
            v0 = v1 = v2 = v3 = 0;
          } else {
            const t = (p - 0.7) / 0.3;
            v0 = v1 = v3 = 0;
            v2 = t * 100; // recolhe pela aresta de baixo — direção diferente da que cresceu (todas as arestas)
          }
          gsap.set(foldRef.current, { clipPath: `inset(${v0}% ${v1}% ${v2}% ${v3}%)` });

          // Revela o fundo real do About (0.45–0.55) só depois que o
          // fold já cresceu o bastante pra cobrir a tela por completo —
          // a troca acontece encoberta, nunca visível.
          const sectionT = gsap.utils.clamp(0, 1, (p - 0.45) / 0.1);
          gsap.set(aboutSectionRef.current, { opacity: sectionT });

          // Conteúdo: só ganha presença perto do fim da retração (85–100%
          // do progresso total) — é literalmente uma função da dobra já
          // ter avançado o suficiente, não um evento à parte.
          const contentT = gsap.utils.clamp(0, 1, (p - 0.85) / 0.15);
          gsap.set(headlineRef.current, { opacity: contentT, y: 24 * (1 - contentT) });
          gsap.set(bodyRef.current, { opacity: contentT, y: 20 * (1 - contentT) });
          gsap.set(mediaRef.current, { clipPath: `inset(0% 0% ${(1 - contentT) * 100}% 0%)` });
        },
      });
    }, wrapRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <>
      <div ref={wrapRef} className="relative bg-ink">
        <AboutStage ref={aboutSectionRef} headlineRef={headlineRef} bodyRef={bodyRef} mediaRef={mediaRef} />
      </div>
      <div ref={foldRef} className="pointer-events-none fixed inset-0 z-40 bg-paper" aria-hidden="true" />
    </>
  );
}
