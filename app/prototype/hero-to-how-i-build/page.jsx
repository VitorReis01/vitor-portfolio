import HeroToHowIBuildPrototype from "@/components/prototype/HeroToHowIBuildPrototype";

// Rota isolada — Fase 4, protótipo 03. Estende o protótipo 02
// (hero-to-selected-work) acrescentando How I Build na sequência. Não
// substitui a página principal.
export const metadata = {
  title: "Protótipo — Hero → How I Build",
  robots: { index: false, follow: false },
};

export default function HeroToHowIBuildPage() {
  return <HeroToHowIBuildPrototype />;
}
