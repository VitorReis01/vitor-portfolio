// Assinatura única de motion do site — reutilizada por todas as seções para
// que a experiência tenha "uma voz" só. Três escalas de duração, cada uma
// com um papel fixo — não usar "por que ficou bom" solto.
export const EASE_STANDARD = "cubic-bezier(0.16, 1, 0.3, 1)"; // expo-out — reveals, entradas
export const EASE_PRESS = "cubic-bezier(0.65, 0, 0.35, 1)"; // saídas, resposta a clique/press
export const EASE_SNAP = "cubic-bezier(0.22, 1, 0.36, 1)"; // hover/cursor — resposta rápida, sem overshoot

export const DURATION = {
  micro: 0.18, // hover, cursor, botões, links — 100–250ms
  medium: 0.6, // reveals, cards, títulos, imagens — 400–800ms
  cinematic: 1.6, // transições de seção, transformação do hero — 1–2.5s
};
