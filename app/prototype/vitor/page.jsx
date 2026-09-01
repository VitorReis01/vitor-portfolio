import PrototypeExperience from "@/components/prototype/PrototypeExperience";

// Rota isolada de protótipo — não é a homepage definitiva. Serve para validar
// a direção de arte de docs/vitor-portfolio-creative-direction.md antes de
// decidir se/como ela vira a página principal. Fora de qualquer sitemap.
export const metadata = {
  title: "Protótipo — Vitor",
  robots: { index: false, follow: false },
};

export default function PrototypeVitorPage() {
  return <PrototypeExperience />;
}
