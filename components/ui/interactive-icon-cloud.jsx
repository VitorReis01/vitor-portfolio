"use client";

import { useEffect, useMemo, useState } from "react";
import { Cloud, fetchSimpleIcons } from "react-icon-cloud";

// Nuvem 3D de tecnologias — client-only (TagCanvas precisa de canvas real),
// importado via dynamic(ssr:false) por quem consome este componente.
// Cor NÃO usa a detecção automática de contraste da lib (renderSimpleIcon
// com minContrastRatio): isso manteria a marca original de qualquer ícone
// já claro o bastante contra o fundo escuro, virando um catálogo de logos
// coloridos. Em vez disso, a cor é curada à mão — a maioria off-white, só
// alguns acentos ciano escolhidos por relevância pra identidade do site.

const SLUGS = [
  "javascript",
  "react",
  "nextdotjs",
  "html5",
  "css3",
  "tailwindcss",
  "nodedotjs",
  "postgresql",
  "git",
  "github",
  "vercel",
  "figma",
  "threedotjs",
];

const ACCENT_SLUGS = new Set(["react", "tailwindcss", "threedotjs"]);
const NEUTRAL_HEX = "E7E5DD";
const ACCENT_HEX = "6FE9E4";

function renderIcon(icon, size) {
  const hex = ACCENT_SLUGS.has(icon.slug) ? ACCENT_HEX : NEUTRAL_HEX;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" style="fill:#${hex}" viewBox="0 0 24 24" height="${size}" width="${size}"><title>${icon.title}</title><path d="${icon.path}"></path></svg>`;
  return (
    <a
      key={icon.slug}
      data-icon-slug={icon.slug}
      title={icon.title}
      href="#"
      onClick={(event) => event.preventDefault()}
      style={{ cursor: "pointer" }}
    >
      <img height={size} width={size} alt={icon.title} src={`data:image/svg+xml;utf8,${svg}`} />
    </a>
  );
}

const CLOUD_OPTIONS = {
  reverse: true,
  depth: 0.9,
  wheelZoom: false,
  imageScale: 2,
  initial: [0.08, -0.08],
  maxSpeed: 0.035,
  minSpeed: 0.015,
  dragControl: true,
  freezeActive: true,
  clickToFront: 500,
  noSelect: true,
  outlineMethod: "none",
  shape: "sphere",
};

const STATIC_OPTIONS = { ...CLOUD_OPTIONS, initial: null, maxSpeed: 0, minSpeed: 0, dragControl: false };

export default function InteractiveIconCloud({ size = 42, reducedMotion = false }) {
  const [icons, setIcons] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSimpleIcons({ slugs: SLUGS }).then(({ simpleIcons }) => {
      if (cancelled) return;
      setIcons(Object.values(simpleIcons));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rendered = useMemo(() => (icons ? icons.map((icon) => renderIcon(icon, size)) : []), [icons, size]);

  if (!icons) return null;

  return (
    <Cloud containerProps={{ style: { width: "100%", height: "100%" } }} options={reducedMotion ? STATIC_OPTIONS : CLOUD_OPTIONS}>
      {rendered}
    </Cloud>
  );
}
