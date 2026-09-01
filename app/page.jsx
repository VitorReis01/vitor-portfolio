// Placeholder — a homepage definitiva ainda não foi construída.
// A experiência em validação vive isolada em /prototype/vitor.
export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-ink px-6 text-center text-paper">
      <p className="font-mono-label text-label text-graphite">em construção</p>
      <p className="text-body text-graphite">
        Protótipo de homepage disponível em{" "}
        <a href="/prototype/vitor" className="text-paper underline decoration-signal underline-offset-4">
          /prototype/vitor
        </a>
      </p>
    </main>
  );
}
