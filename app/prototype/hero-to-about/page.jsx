import HeroToAboutPrototype from "@/components/prototype/HeroToAboutPrototype";

// Rota isolada — Fase 4, protótipo 04. Estende hero-to-how-i-build
// acrescentando a dobra de polaridade + About. Não substitui a página
// principal.
export const metadata = {
  title: "Protótipo — Hero → About",
  robots: { index: false, follow: false },
};

export default function HeroToAboutPage() {
  return <HeroToAboutPrototype />;
}
