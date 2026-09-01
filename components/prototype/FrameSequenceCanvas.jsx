"use client";

import { useEffect, useRef } from "react";
import { findNearestLoadedIndex, getCoverDrawRect, progressToFrameIndex } from "@/lib/motion/frameSequence";

// Motor de desenho do prototipo de hero de sequencia de frames: liga o progresso de scroll (via
// GSAP ScrollTrigger) a um indice de frame alvo, e um loop de requestAnimationFrame desenha no
// canvas o frame carregado mais proximo desse alvo (cover, com devicePixelRatio). Recebe os
// frames ja carregando via useFrameSequencePreloader (imagesRef/loadedRef) - este componente so
// consome. Adaptado do prototipo original: so o import de frameSequence.js mudou de caminho, o
// resto da logica e identico.
export default function FrameSequenceCanvas({
  containerRef,
  imagesRef,
  loadedRef,
  frameCount,
  active,
}) {
  const canvasRef = useRef(null);
  const targetIndexRef = useRef(0);
  const drawnIndexRef = useRef(-1);
  const needsResizeRef = useRef(true);
  const dprRef = useRef(1);

  // Redesenha sempre que o container muda de tamanho (orientacao, resize, zoom), preservando o
  // enquadramento "cover" e a nitidez em telas de alta densidade.
  useEffect(() => {
    if (!active) return undefined;
    const canvas = canvasRef.current;
    const wrapper = canvas?.parentElement;
    if (!canvas || !wrapper) return undefined;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = wrapper.clientWidth;
      const displayHeight = wrapper.clientHeight;
      dprRef.current = dpr;

      const nextWidth = Math.round(displayWidth * dpr);
      const nextHeight = Math.round(displayHeight * dpr);
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      needsResizeRef.current = true;
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    return () => resizeObserver.disconnect();
  }, [active]);

  // Liga o progresso do scroll ao indice de frame alvo. scrub com um numero pequeno (em vez de
  // `true`) da uma leve suavizacao ao GSAP sem soltar o 1:1 com o scroll: para, retrocede e
  // avanca junto com o usuario, so amortecendo o pico de velocidade.
  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    let scrollTriggerInstance;
    let refreshHandler;

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !containerRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        onUpdate: ({ progress }) => {
          targetIndexRef.current = progressToFrameIndex(progress, frameCount);
        },
      });

      refreshHandler = () => ScrollTrigger.refresh();
      window.addEventListener("orientationchange", refreshHandler);
    };

    setup();

    return () => {
      cancelled = true;
      scrollTriggerInstance?.kill();
      if (refreshHandler) window.removeEventListener("orientationchange", refreshHandler);
    };
  }, [active, containerRef, frameCount]);

  // Loop de desenho: a cada tick acha o frame carregado mais proximo do alvo atual (barato, no
  // maximo 192 comparacoes) e so redesenha o canvas quando esse "vencedor" muda ou o tamanho do
  // canvas mudou - evita trabalho de GPU redundante enquanto o usuario esta parado, mas ainda
  // pega frames que terminam de carregar sem precisar de um segundo timer.
  useEffect(() => {
    if (!active) return undefined;
    let rafId;

    const draw = (index) => {
      const canvas = canvasRef.current;
      const image = imagesRef.current[index];
      if (!canvas || !image) return;

      const ctx = canvas.getContext("2d");
      const dpr = dprRef.current;
      const displayWidth = canvas.width / dpr;
      const displayHeight = canvas.height / dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const { drawWidth, drawHeight, offsetX, offsetY } = getCoverDrawRect(
        image.naturalWidth,
        image.naturalHeight,
        displayWidth,
        displayHeight
      );
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };

    const tick = () => {
      const winner = findNearestLoadedIndex(loadedRef.current, targetIndexRef.current);
      if (winner !== -1 && (winner !== drawnIndexRef.current || needsResizeRef.current)) {
        draw(winner);
        drawnIndexRef.current = winner;
        needsResizeRef.current = false;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(rafId);
  }, [active, imagesRef, loadedRef]);

  if (!active) return null;

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
