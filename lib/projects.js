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
    subtitle: "Comércio Digital e Sistema Comercial",
    year: "2026",
    role: ["UX/UI", "Desenvolvimento", "Sistemas", "Animação"],
    tech: ["Next.js", "JavaScript", "GSAP", "PostgreSQL", "Vercel"],
    what: "Uma plataforma comercial para uma distribuidora de materiais metálicos.",
    why: "Transformar um catálogo técnico denso em um sistema de comércio digital real — do produto ao orçamento.",
    status: "Case de cliente — plataforma comercial full stack",
    accent: "#E1432E",
    media: {
      kind: "video",
      src: "/media/digital-commerce/digital-commerce-product-film.webm",
      poster: "/media/digital-commerce/digital-commerce-poster.jpg",
      aspect: "aspect-[16/9]",
    },
    hasExtendedCase: true,
    cta: { label: "ver projeto", href: "#imesul-case" },
  },
  {
    id: "syntra",
    index: "02",
    title: "SYNTRA",
    subtitle: "Sistema de Aprendizado Adaptativo",
    year: "2026",
    role: ["Produto", "Desenvolvimento", "Animação"],
    tech: ["Conceito", "Protótipo", "Em desenvolvimento"],
    what: "Um sistema de aprendizado adaptativo, construído do conceito ao produto real.",
    why: "Testar se uma trilha de aprendizado pode se ajustar em tempo real a como uma pessoa realmente aprende.",
    status: "Projeto independente — em desenvolvimento",
    accent: "#7C6CF6",
    media: {
      kind: "video",
      src: "/media/syntra/syntra-teaser.mp4",
      aspect: "aspect-[3/4]",
    },
    cta: { label: "ver projeto", href: "https://www.instagram.com/vitor.systems/" },
  },
  {
    id: "lookout",
    index: "03",
    title: "LOOKOUT",
    subtitle: "Motor de Percepção Operacional",
    year: "2026",
    role: ["Produto", "Desenvolvimento", "Sistemas"],
    tech: ["Conceito", "Protótipo", "Monitoramento de dispositivos"],
    what: "Um motor de percepção operacional para monitoramento de dispositivos em tempo real.",
    why: "Dar às equipes de operação visibilidade e controle antes de um problema acontecer, não depois.",
    status: "Projeto independente — monitoramento e conformidade",
    accent: "#43FF9C",
    media: {
      kind: "video",
      src: "/media/lookout/lookout-final.mp4",
      aspect: "aspect-[16/9]",
    },
    cta: { label: "ver projeto", href: "https://www.instagram.com/vitor.systems/" },
  },
];
