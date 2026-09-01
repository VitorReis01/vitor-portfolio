// Placeholder conceitual explícito — nunca imagem de banco. Tratado como
// parte da composição (moldura de enquadramento, não um "buraco" na página):
// deixa claro, em texto, exatamente qual asset real precisa entrar aqui.
export default function MediaPlaceholder({ label, tag, className = "", aspect = "aspect-[4/3]" }) {
  return (
    <div className={`relative overflow-hidden border border-graphite/20 bg-ink/40 ${aspect} ${className}`}>
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-graphite/10" />
      </svg>

      {["top-3 left-3 border-l border-t", "top-3 right-3 border-r border-t", "bottom-3 left-3 border-l border-b", "bottom-3 right-3 border-r border-b"].map(
        (position) => (
          <span key={position} className={`absolute h-3 w-3 border-graphite/40 ${position}`} aria-hidden="true" />
        )
      )}

      {tag ? (
        <span className="font-mono-label text-label absolute left-5 top-5 text-graphite/60">{tag}</span>
      ) : null}

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <span className="font-mono-label text-label text-center text-graphite">{label}</span>
      </div>
    </div>
  );
}
