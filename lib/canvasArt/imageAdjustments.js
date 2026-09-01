// Ajustes de cor puros (sem canvas, sem estado) — operam num [r,g,b] 0-255
// e devolvem outro [r,g,b] 0-255. Usados célula a célula pelo pipeline do
// HeroPhotoEffect, nunca via ctx.filter (mais previsível, mais barato).

function clamp255(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

export function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// brightness: -100..100 · contrast/saturation: 0..~200 (100 = neutro) ·
// grayscale: 0..100 (mistura em direção à luminância).
export function adjustColor(r, g, b, { brightness = 0, contrast = 100, saturation = 100, grayscale = 0 }) {
  const lum = luminance(r, g, b);
  const gMix = grayscale / 100;
  let rr = r + (lum - r) * gMix;
  let gg = g + (lum - g) * gMix;
  let bb = b + (lum - b) * gMix;

  const lum2 = luminance(rr, gg, bb);
  const satMix = saturation / 100;
  rr = lum2 + (rr - lum2) * satMix;
  gg = lum2 + (gg - lum2) * satMix;
  bb = lum2 + (bb - lum2) * satMix;

  const c = contrast / 100;
  rr = (rr - 128) * c + 128;
  gg = (gg - 128) * c + 128;
  bb = (bb - 128) * c + 128;

  const bOffset = brightness * 2.55;
  rr += bOffset;
  gg += bOffset;
  bb += bOffset;

  return [clamp255(rr), clamp255(gg), clamp255(bb)];
}

// "screen" blend do tint sobre a cor base, escalado por tintOpacity
// (0..100) — acento de cor, não lavagem: em 0 é um no-op, em 100 o pixel
// vira quase puramente a cor do tint nas áreas já claras.
export function applyTint(r, g, b, [tr, tg, tb], tintOpacity) {
  const a = tintOpacity / 100;
  if (a <= 0) return [r, g, b];
  const screen = (base, t) => 255 - ((255 - base) * (255 - t)) / 255;
  return [r + (screen(r, tr) - r) * a, g + (screen(g, tg) - g) * a, b + (screen(b, tb) - b) * a];
}

export function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
