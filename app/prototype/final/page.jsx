import FinalExperience from "@/components/prototype/FinalExperience";

// Fase 5 — rota de validação da integração completa (Hero real →
// Selected Work → How I Build → Polarity Fold → About → Contact) antes
// de substituir a página principal. Não é a página principal ainda.
export const metadata = {
  title: "Vitor Reis — Integração Final",
  robots: { index: false, follow: false },
};

export default function FinalPage() {
  return <FinalExperience />;
}
