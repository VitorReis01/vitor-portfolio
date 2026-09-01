// Funções de desenho por célula — puras (ctx entra, ctx sai desenhado),
// uma por renderMode. O pipeline (HeroPhotoEffect) decide cor/posição;
// aqui só decide COMO uma célula vira pixels.

// Matriz de Bayer 4x4 (ordered dithering) normalizada 0..1 — clássica,
// determinística (mesmo padrão sempre, sem ruído aleatório por frame).
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

function rgbCss(r, g, b, a = 1) {
  return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
}

// halfblocks: duas amostras (metade de cima/baixo da célula) — dobra a
// resolução vertical percebida, preserva muito mais detalhe facial que
// uma célula única por bloco.
export function drawHalfblock(ctx, x, y, size, topColor, bottomColor) {
  const half = size / 2;
  ctx.fillStyle = rgbCss(...topColor);
  ctx.fillRect(x, y, size, half);
  ctx.fillStyle = rgbCss(...bottomColor);
  ctx.fillRect(x, y + half, size, size - half);
}

// dots: um círculo por célula, raio cresce com luminância (+ densidade),
// com um pequeno boost em bordas (edgeEmphasis, calculado fora).
export function drawDot(ctx, x, y, size, color, lum01, densityBoost = 0) {
  const radius = Math.max(0.35, (size / 2) * (0.28 + lum01 * 0.72 + densityBoost)) ;
  ctx.fillStyle = rgbCss(...color, 0.92);
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
  ctx.fill();
}

// dither: sub-amostra 4x4 dentro da célula, cada sub-célula liga/desliga
// contra o limiar de Bayer correspondente — halftone genuíno, não uma
// textura de ruído aleatório.
export function drawDither(ctx, x, y, size, color, lum01) {
  const sub = size / 4;
  ctx.fillStyle = rgbCss(...color, 0.95);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      if (lum01 >= BAYER_4X4[row][col]) {
        ctx.fillRect(x + col * sub, y + row * sub, sub + 0.6, sub + 0.6);
      }
    }
  }
}

export const RENDER_MODES = { halfblocks: drawHalfblock, dots: drawDot, dither: drawDither };
