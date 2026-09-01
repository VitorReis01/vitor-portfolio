import ScrollFrameHero from "@/components/prototype/ScrollFrameHero";

// Rota isolada de protótipo — valida a técnica de hero controlado por scroll (sequência de 192
// frames) antes de decidir se/como ela entra em algum lugar do site de verdade. NÃO substitui o
// hero principal (components/prototype/HeroPhotoEffect.jsx continua sendo o aprovado) nem é
// linkada da homepage. Fora de qualquer sitemap.
export const metadata = {
  title: "Protótipo — Hero Frame Sequence",
  robots: { index: false, follow: false },
};

export default function HeroFrameSequencePrototypePage() {
  return (
    <main className="bg-ink text-paper">
      <ScrollFrameHero />

      <section className="flex min-h-[60svh] flex-col items-center justify-center gap-4 border-t border-white/10 bg-ink px-6 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-signal">
          Próxima seção
        </span>
        <h2 className="max-w-xl font-display text-3xl leading-tight text-paper sm:text-4xl">
          Conteúdo normal continua aqui depois do último frame.
        </h2>
        <p className="max-w-md text-sm leading-6 text-graphite">
          Este bloco só existe para mostrar que a rolagem volta ao fluxo normal assim que a
          sequência termina.
        </p>
      </section>
    </main>
  );
}
