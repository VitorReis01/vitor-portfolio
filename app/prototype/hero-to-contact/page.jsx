import HeroToContactPrototype from "@/components/prototype/HeroToContactPrototype";

// Rota isolada — Fase 4, protótipo 05. Estende hero-to-about
// acrescentando Contact + System Returns. Não substitui a página
// principal.
export const metadata = {
  title: "Protótipo — Hero → Contact",
  robots: { index: false, follow: false },
};

export default function HeroToContactPage() {
  return <HeroToContactPrototype />;
}
