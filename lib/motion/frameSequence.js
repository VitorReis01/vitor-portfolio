// Matematica pura usada pelo prototipo de hero de sequencia de frames
// (components/prototype/ScrollFrameHero.jsx e
// components/prototype/FrameSequenceCanvas.jsx). Sem DOM, sem estado - so
// numeros, para ficar facil de raciocinar e reaproveitar caso outro
// prototipo precise do mesmo tipo de animacao no futuro. Portado sem
// alteracao de logica.

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Converte o progresso 0..1 do ScrollTrigger no indice de frame mais proximo.
export function progressToFrameIndex(progress, frameCount) {
  const safeProgress = clamp(progress, 0, 1);
  return clamp(Math.round(safeProgress * (frameCount - 1)), 0, frameCount - 1);
}

// Calcula o retangulo de desenho equivalente a `object-fit: cover` para um canvas,
// centralizando a imagem e cortando o excesso no eixo que sobrar.
export function getCoverDrawRect(imageWidth, imageHeight, canvasWidth, canvasHeight) {
  if (!imageWidth || !imageHeight || !canvasWidth || !canvasHeight) {
    return { drawWidth: 0, drawHeight: 0, offsetX: 0, offsetY: 0 };
  }

  const imageRatio = imageWidth / imageHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  if (canvasRatio > imageRatio) {
    const drawWidth = canvasWidth;
    const drawHeight = canvasWidth / imageRatio;
    return { drawWidth, drawHeight, offsetX: 0, offsetY: (canvasHeight - drawHeight) / 2 };
  }

  const drawHeight = canvasHeight;
  const drawWidth = canvasHeight * imageRatio;
  return { drawWidth, drawHeight, offsetX: (canvasWidth - drawWidth) / 2, offsetY: 0 };
}

// Acha o frame carregado mais proximo do indice desejado (primeiro olhando para tras, que e o
// caso comum de preload sequencial, depois para frente) para nunca desenhar um canvas vazio
// enquanto o restante da sequencia ainda esta baixando.
export function findNearestLoadedIndex(loadedFlags, targetIndex) {
  if (loadedFlags[targetIndex]) return targetIndex;

  for (let offset = 1; offset < loadedFlags.length; offset += 1) {
    const before = targetIndex - offset;
    const after = targetIndex + offset;
    if (before >= 0 && loadedFlags[before]) return before;
    if (after < loadedFlags.length && loadedFlags[after]) return after;
    if (before < 0 && after >= loadedFlags.length) break;
  }

  return -1;
}
