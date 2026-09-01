"use client";

import { useEffect, useRef, useState } from "react";

// Quantas imagens baixar em paralelo depois do primeiro frame. Um valor pequeno (nao 192 de uma
// vez, nem 1 por vez) equilibra throughput com o limite de conexoes simultaneas por origem dos
// navegadores mais antigos, ainda aproveitando HTTP/2 nos modernos.
const PRELOAD_CONCURRENCY = 6;

// Preload inteligente de uma sequencia de imagens: o primeiro frame e aguardado (evita canvas
// vazio no primeiro paint) e o restante carrega em segundo plano, em paralelo limitado, sem
// bloquear a interacao. `imagesRef`/`loadedRef` sao expostos como refs (nao state) porque sao
// lidos a cada tick do loop de desenho em FrameSequenceCanvas - transforma-los em state geraria
// um re-render por frame carregado, o que e desnecessario ali. Portado sem alteracao de logica.
export default function useFrameSequencePreloader(framePaths, { enabled = true } = {}) {
  const imagesRef = useRef([]);
  const loadedRef = useRef([]);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (!enabled || framePaths.length === 0) return undefined;

    let cancelled = false;
    imagesRef.current = new Array(framePaths.length).fill(null);
    loadedRef.current = new Array(framePaths.length).fill(false);

    const loadFrame = (index) =>
      new Promise((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          if (cancelled) return resolve();
          imagesRef.current[index] = image;
          loadedRef.current[index] = true;
          setLoadedCount((count) => count + 1);
          resolve();
        };
        image.onerror = () => resolve();
        image.src = framePaths[index];
      });

    const run = async () => {
      setFirstFrameReady(false);
      setLoadedCount(0);
      await loadFrame(0);
      if (cancelled) return;
      setFirstFrameReady(true);

      // Fila compartilhada: cada worker pega o proximo indice disponivel, entao os frames
      // continuam terminando aproximadamente em ordem sem serializar a rede.
      let nextIndex = 1;
      const worker = async () => {
        while (!cancelled) {
          const index = nextIndex;
          nextIndex += 1;
          if (index >= framePaths.length) return;
          await loadFrame(index);
        }
      };

      const workerCount = Math.min(PRELOAD_CONCURRENCY, Math.max(0, framePaths.length - 1));
      await Promise.all(Array.from({ length: workerCount }, () => worker()));
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [enabled, framePaths]);

  return { imagesRef, loadedRef, firstFrameReady, loadedCount, total: framePaths.length };
}
