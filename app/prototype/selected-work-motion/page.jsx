import SelectedWorkMotionPrototype from "@/components/prototype/SelectedWorkMotionPrototype";

// Rota isolada — Fase 4 do motion system, protótipo 01 (Selected Work).
// Não é a implementação final de SelectedWorkSection, e não a substitui.
// Existe só para validar a experiência de palco pinado antes de integrar.
export const metadata = {
  title: "Protótipo — Selected Work Motion",
  robots: { index: false, follow: false },
};

export default function SelectedWorkMotionPage() {
  return <SelectedWorkMotionPrototype />;
}
