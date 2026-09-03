"use client";

import { useEffect, useState } from "react";
import { fetchSimpleIcons } from "react-icon-cloud";

// Fase 4 — nova direção do How I Build. Reaproveita a mesma fonte de
// ícones já usada pelo InteractiveIconCloud (Simple Icons via
// react-icon-cloud) sem instalar nada novo — só extrai o fetch pra um
// hook que qualquer apresentação nova (TechMeteorField, aqui) pode
// consumir, sem depender da Cloud/TagCanvas em si.
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
  const [icons, setIcons] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSimpleIcons({ slugs }).then(({ simpleIcons }) => {
      if (cancelled) return;
      const map = {};
      Object.values(simpleIcons).forEach((icon) => {
        map[icon.slug] = {
          title: icon.title,
          neutralSrc: dataUri(icon, NEUTRAL_HEX),
          accentSrc: dataUri(icon, ACCENT_HEX),
        };
      });
      setIcons(map);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    });
    return () => {
      cancelled = true;
    };
    // `slugs` deve ser uma constante estável (definida fora do componente)
    // — é assim que todo consumidor deste hook já usa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return icons;
}
