"use client";

// Fase 4 — nova direção do How I Build. Puramente apresentacional: quem
// anima é HowIBuildStage, através das refs recebidas por prop — mesmo
// padrão já usado em AboutStage/ContactStage (o pai possui a única
// timeline/ScrollTrigger da cena, o filho só expõe os nós DOM).
//
// Uma palavra gigante por vez (a progressão é comunicada pelo próprio
// conteúdo, sem contador numérico) — "how i build" fica pequeno/
// secundário acima. As `sliceRefs` são as bandas finas que piscam durante
// a troca de etapa (o "quebrar em fragmentos" da transição), sempre
// opacity 0 em repouso.
const SLICE_COUNT = 4;

export default function StepHeadline({ labelRef, wordRef, sliceRefs, glowRef, closingRef, closingLine }) {
  return (
    <div className="relative z-20 flex flex-col items-center px-[var(--gutter)] text-center">
      <span ref={labelRef} className="font-mono-label text-label text-paper/50">
        como eu construo
      </span>

      <div className="relative mt-4">
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(111,233,228,0.45) 0%, transparent 70%)" }}
        />
        <h2
          ref={wordRef}
          className="font-display font-semibold uppercase leading-none text-paper"
          style={{ fontSize: "clamp(3rem, 11vw, 9.5rem)" }}
        >
          ENTENDER
        </h2>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-around">
          {Array.from({ length: SLICE_COUNT }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                sliceRefs.current[i] = el;
              }}
              className="h-[3px] w-full origin-left bg-paper opacity-0"
            />
          ))}
        </div>
      </div>

      <p ref={closingRef} className="text-body mt-8 max-w-[36ch] text-paper/70">
        {closingLine}
      </p>
    </div>
  );
}
