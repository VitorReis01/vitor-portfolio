// CSP pragmática, compatível com geração estática (sem nonce/middleware):
// - script-src/style-src precisam de 'unsafe-inline' porque o próprio Next
//   App Router injeta os 2 scripts de bootstrap do RSC inline (sem `src`,
//   confirmado no HTML pré-renderizado) e o React usa `style={{...}}`
//   extensivamente (cores de accent por projeto, calculadas em runtime) —
//   um nonce exigiria renderização dinâmica por request, que este projeto
//   não usa e não deve passar a usar só por causa da CSP.
// - connect-src é 'self' puro: os ícones de tecnologia da Home
//   (components/prototype/useTechIcons.js, consumido por TechMeteorField.jsx)
//   vêm de techIconsData.js, dados locais extraídos uma única vez de
//   simple-icons@14.0.0 — sem fetch em runtime pra cdn.jsdelivr.net nem
//   raw.githubusercontent.com. `react-icon-cloud` (única fonte desses dois
//   domínios no projeto) foi removida do package.json — seu único
//   consumidor era /prototype/vitor, rota de protótipo obsoleta já
//   excluída do repositório.
// - 'unsafe-eval' em script-src só em desenvolvimento: o React dev mode usa
//   eval() pra reconstruir stack traces de debug (confirmado via console em
//   `npm run dev`); a própria mensagem de erro do React confirma que a
//   build de produção nunca usa eval() — manter a CSP de produção mais
//   restrita não tem custo nenhum.
// - Nenhuma origem externa é usada na Home: fontes (next/font/google) são
//   self-hosted no build, vídeos/imagens são todos locais (public/media),
//   GSAP/Lenis/ícones são bundled ou versionados localmente.
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "media-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()",
  },
  { key: "Content-Security-Policy", value: CSP },
  // Só em produção: a Vercel já serve tudo em HTTPS, mas o header confirma
  // ao navegador pra nunca tentar HTTP de novo neste host (e subdomínios)
  // pelo próximo ano. Sem "preload" (pedido explícito) — entrar na lista
  // de preload do Chrome é uma submissão manual e praticamente irreversível,
  // não algo pra ligar de forma automática. Em dev (http://localhost) o
  // header seria ignorado pelo navegador mesmo assim (HSTS não se aplica a
  // conexões não seguras), mas nem envio ali pra manter o ambiente local
  // exatamente como já era.
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // Impede a criação automática de arquivos auxiliares no root do projeto.
  agentRules: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Assets grandes e raramente alterados (vídeos/imagens de projeto).
        // Não são fingerprinted pelo Next (ficam em public/, não em
        // _next/static), então a Vercel não aplica cache longo por padrão
        // aqui — isso não duplica nada que ela já faça.
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

module.exports = nextConfig;
