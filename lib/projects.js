// Fonte única dos projetos do Selected Work. Adicionar um projeto novo no
// futuro é só um novo item aqui — nenhum componente precisa mudar de
// estrutura para isso. Nada aqui é inventado: os 3 projetos e todos os
// números vêm do que já foi validado nesta conversa (Instagram @vitor.systems
// para SYNTRA/LOOKOUT, case técnico real para o Digital Commerce Platform).
export const PROJECTS = [
  {
    id: "imesul",
    index: "01",
    title: "IMESUL",
    subtitle: "Digital Commerce & Commercial System",
    year: "2026",
    role: ["UX/UI", "Development", "Systems", "Motion"],
    tech: ["Next.js", "JavaScript", "GSAP", "PostgreSQL", "Vercel"],
    what: "A commercial platform for a metal materials distributor.",
    why: "Turn a dense technical catalog into a real digital commerce system — from product to quotation.",
    status: "Client case — full-stack commercial platform",
    accent: "#E1432E",
    media: {
      kind: "video",
      src: "/media/digital-commerce/digital-commerce-product-film.webm",
      poster: "/media/digital-commerce/digital-commerce-poster.jpg",
      aspect: "aspect-[16/9]",
    },
    hasExtendedCase: true,
    cta: { label: "view project", href: "#imesul-case" },
  },
  {
    id: "syntra",
    index: "02",
    title: "SYNTRA",
    subtitle: "Adaptive Learning System",
    year: "2026",
    role: ["Product", "Development", "Motion"],
    tech: ["Concept", "Prototype", "In development"],
    what: "An adaptive learning system, built from concept to real product.",
    why: "Test whether a learning path can adjust in real time to how a person actually learns.",
    status: "Independent build — in development",
    accent: "#7C6CF6",
    media: {
      kind: "video",
      src: "/media/syntra/syntra-teaser.mp4",
      aspect: "aspect-[3/4]",
    },
    cta: { label: "view project", href: "https://www.instagram.com/vitor.systems/" },
  },
  {
    id: "lookout",
    index: "03",
    title: "LOOKOUT",
    subtitle: "Operational Awareness Engine",
    year: "2026",
    role: ["Product", "Development", "Systems"],
    tech: ["Concept", "Prototype", "Device monitoring"],
    what: "An operational awareness engine for real-time device monitoring.",
    why: "Give operations teams visibility and control before a problem happens, not after.",
    status: "Independent build — monitoring & compliance",
    accent: "#43FF9C",
    media: {
      kind: "video",
      src: "/media/lookout/lookout-final.mp4",
      aspect: "aspect-[16/9]",
    },
    cta: { label: "view project", href: "https://www.instagram.com/vitor.systems/" },
  },
];
