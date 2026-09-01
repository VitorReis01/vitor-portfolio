// Configuracao da sequencia de frames do prototipo de hero
// (app/prototype/hero-frame-sequence). Fonte: sequencia estatica de 192
// webp em public/media/hero/hero-transformation, 960x540, migrada do
// prototipo original (mesma sequencia, so o caminho publico mudou).
// Nao gerar nem alterar os frames aqui - apenas descrever onde eles estao.
export const HERO_FRAME_COUNT = 192;
export const HERO_FRAME_WIDTH = 960;
export const HERO_FRAME_HEIGHT = 540;
const HERO_FRAME_BASE_PATH = "/media/hero/hero-transformation/frame_";
const HERO_FRAME_EXTENSION = "webp";
const HERO_FRAME_INDEX_PAD = 4;

export function getHeroFramePath(index) {
  const safeIndex = Math.min(HERO_FRAME_COUNT - 1, Math.max(0, index));
  return `${HERO_FRAME_BASE_PATH}${String(safeIndex).padStart(HERO_FRAME_INDEX_PAD, "0")}.${HERO_FRAME_EXTENSION}`;
}

// Array unico e estavel (nao recriada a cada render) para poder ser usada como dependencia de
// useEffect/hooks sem disparar reload da sequencia inteira a cada re-render.
export const HERO_FRAME_PATHS = Array.from({ length: HERO_FRAME_COUNT }, (_, index) =>
  getHeroFramePath(index)
);
