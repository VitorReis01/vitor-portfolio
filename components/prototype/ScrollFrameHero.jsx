"use client";

import { useRef } from "react";
import Image from "next/image";
import useReducedMotion from "@/lib/motion/useReducedMotion";
import useFrameSequencePreloader from "@/lib/motion/useFrameSequencePreloader";
import FrameSequenceCanvas from "./FrameSequenceCanvas";
import {
  HERO_FRAME_COUNT,
  HERO_FRAME_HEIGHT,
  HERO_FRAME_PATHS,
  HERO_FRAME_WIDTH,
  getHeroFramePath,
} from "@/lib/frameSequence-config";

// Altura do trilho de scroll: quanto maior, mais lenta/cinematografica a transformacao.
const SCROLL_HEIGHT_VH = 450;
// Frame usado como imagem estatica quando reduced motion esta ativo: o estado final da
// transformacao, ja resolvido - mantem o conteudo legivel sem depender de animacao.
const STATIC_FALLBACK_FRAME_INDEX = HERO_FRAME_COUNT - 1;

// PROTOTIPO ISOLADO (app/prototype/hero-frame-sequence) - NAO e o hero principal do site. O hero
// aprovado continua sendo components/prototype/HeroPhotoEffect.jsx; este componente nunca é
// importado por ele nem pela homepage.
//
// Recriado a partir de um prototipo equivalente feito noutro projeto, que dependia da
// infraestrutura de compatibilidade daquele projeto (um provider de 3 camadas + deteccao de
// Save-Data). Aqui a logica de reduced motion foi reescrita em cima do que este portfolio ja
// tem (useReducedMotion, boolean unico via prefers-reduced-motion) e a paleta usa os tokens
// deste projeto (ink) em vez de qualquer identidade externa.
//
// FULL: sequencia de 192 frames renderizada num canvas sticky, avancando/recuando com o scroll.
// REDUCED MOTION: troca por uma unica imagem estatica (o quadro final da transformacao, ja
// resolvido) - sem canvas, sem scroll-jacking, conteudo continua legivel.
// Save-Data: este portfolio nao tem hoje uma forma confiavel de detectar isso (ao contrario de
// prefers-reduced-motion, que e API padrao do navegador) - fica documentado como melhoria
// futura em vez de criar um framework novo só para este prototipo.
export default function ScrollFrameHero() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef(null);
  const isInteractive = !prefersReducedMotion;

  const { imagesRef, loadedRef, firstFrameReady } = useFrameSequencePreloader(HERO_FRAME_PATHS, {
    enabled: isInteractive,
  });

  if (prefersReducedMotion) {
    return (
      <section className="relative h-[100svh] w-full overflow-hidden bg-ink">
        <Image
          src={getHeroFramePath(STATIC_FALLBACK_FRAME_INDEX)}
          alt="Sequência de transformação - quadro final"
          width={HERO_FRAME_WIDTH}
          height={HERO_FRAME_HEIGHT}
          priority
          sizes="100vw"
          className="h-full w-full object-cover"
        />
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      style={{ height: `${SCROLL_HEIGHT_VH}svh` }}
      className="relative w-full bg-ink"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Primeiro frame como base: cobre o instante entre o primeiro paint e o canvas comecar
            a desenhar, para nunca haver um flash em branco. */}
        <Image
          src={getHeroFramePath(0)}
          alt="Sequência de transformação controlada por scroll"
          width={HERO_FRAME_WIDTH}
          height={HERO_FRAME_HEIGHT}
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <FrameSequenceCanvas
          containerRef={containerRef}
          imagesRef={imagesRef}
          loadedRef={loadedRef}
          frameCount={HERO_FRAME_COUNT}
          active={firstFrameReady}
        />
      </div>
    </section>
  );
}
