// Helpers de animação puros (tempo entra, número sai) — nenhum estado,
// nenhum canvas. Extraído do componente pra manter HeroPhotoEffect legível.

// Oscilação suave nunca-linear, usada pra shimmer por célula — cada
// célula tem sua própria fase (col/row) então nunca pulsa em bloco.
export function cellShimmer(t, col, row, speed = 0.6, amount = 0.02) {
  return Math.sin(t * speed + col * 0.35 + row * 0.21) * amount;
}

// Respiração lenta 0..1..0, usada pra glow/linha dos olhos.
export function breathe(t, speed = 0.5, base = 0.5, amount = 0.15) {
  return base + Math.sin(t * speed) * amount;
}

// Pequena oscilação vertical da linha dos olhos — nunca mais que
// alguns pixels, senão vira "risco descolado" em vez de linha viva.
export function lineWobble(t, speed = 0.6, amount = 1.2) {
  return Math.sin(t * speed) * amount;
}

// Flicker determinístico por índice (não Math.random() a cada frame —
// senão vira ruído estático em vez de "vida").
export function flicker(t, index, speed = 0.9, phaseSpread = 6.2831) {
  return 0.5 + 0.5 * Math.sin(t * speed + index * phaseSpread * 0.61803);
}

// Damping simples (lerp) — usado pro cursor nunca responder 1:1.
export function damp(current, target, factor = 0.08) {
  return current + (target - current) * factor;
}
