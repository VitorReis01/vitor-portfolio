import HeroToSelectedWorkPrototype from "@/components/prototype/HeroToSelectedWorkPrototype";

// Rota isolada — Fase 4, protótipo 02. Une o Hero aprovado a
// SelectedWorkStage (aprovado) via uma transição cinematográfica nova
// (TransitionLayer.jsx). Não substitui a página principal.
export const metadata = {
  title: "Protótipo — Hero → Selected Work",
  robots: { index: false, follow: false },
};

export default function HeroToSelectedWorkPage() {
  return <HeroToSelectedWorkPrototype />;
}
