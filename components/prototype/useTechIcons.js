"use client";

import { useMemo } from "react";
import TECH_ICONS from "./techIconsData";

// Ícones hospedados localmente (techIconsData.js) — sem fetch em runtime.
// Antes buscava via react-icon-cloud/fetchSimpleIcons (cdn.jsdelivr.net +
// raw.githubusercontent.com); os mesmos 12 slugs consumidos por
// TechMeteorField.jsx foram extraídos uma única vez da mesma versão
// (simple-icons@14.0.0) e ficam versionados no repo — visual idêntico,
// zero origem externa na Home, CSP pode fechar o connect-src.
//
// Cada ícone sai em DUAS variantes de cor pré-renderizadas (neutra e
// "sinal"/cyan) — a escolha de qual usar é por INSTÂNCIA do meteoro, não
// por tecnologia (o mesmo React pode aparecer neutro numa trajetória e
// como sinal cyan noutra), preservando a regra "a maioria off-white/
// cinza, cyan só como energia pontual".
const NEUTRAL_HEX = "E7E5DD";
const ACCENT_HEX = "6FE9E4";

function dataUri(icon, hex) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" style="fill:#${hex}" viewBox="0 0 24 24"><title>${icon.title}</title><path d="${icon.path}"></path></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function useTechIcons(slugs) {
  return useMemo(() => {
    const map = {};
    slugs.forEach((slug) => {
      const icon = TECH_ICONS[slug];
      if (!icon) return;
      map[slug] = {
        title: icon.title,
        neutralSrc: dataUri(icon, NEUTRAL_HEX),
        accentSrc: dataUri(icon, ACCENT_HEX),
      };
    });
    return map;
    // `slugs` deve ser uma constante estável (definida fora do componente)
    // — é assim que todo consumidor deste hook já usa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
