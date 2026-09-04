"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import useReducedMotion from "@/lib/motion/useReducedMotion";
import { damp } from "@/lib/canvasArt/animation";
import BootGlobe from "./BootGlobe";

// Sequência de boot da Home — globo tipográfico (BootGlobe.jsx) + progresso
// real (não decorativo) até o Hero aparecer. Ver BootGlobe.jsx para a
// atribuição da técnica de projeção adaptada (MIT, Meng To/ThreeUI).
//
// Por que só aqui e não em FinalExperience.jsx: FinalExperience é
// compartilhado por `/` e `/prototype/final`, e o boot é só da Home real —
// `/prototype/final` continua abrindo direto, sem cerimônia de entrada.
const SESSION_KEY = "vitor-system-booted";
const HERO_IMAGE_SRC = "/media/hero/minha-foto-dev.webp";

// Marcos reais (não fake): cada um só avança quando o recurso crítico
// correspondente de fato resolve. A Home NUNCA mostra 100% antes dos três
// resolverem — não esperamos vídeos do Selected Work, conteúdo abaixo da
// dobra, nem nada de /prototype/final.
const MILESTONE_MOUNT = 25;
const MILESTONE_FONTS = 55;
const MILESTONE_HERO_IMAGE = 90;
const MILESTONE_DONE = 100;

const STATUS_BANDS = [
  { max: 20, label: "INICIALIZANDO SISTEMA" },
  { max: 45, label: "MAPEANDO INTERFACE" },
  { max: 70, label: "SINCRONIZANDO SINAL" },
  { max: 94, label: "ESTABELECENDO CONEXÃO" },
  { max: 99, label: "SINAL ADQUIRIDO" },
  { max: 100, label: "SISTEMA PRONTO" },
];

function statusFor(pct) {
  for (let i = 0; i < STATUS_BANDS.length; i += 1) {
    if (pct <= STATUS_BANDS[i].max) return STATUS_BANDS[i].label;
  }
  return STATUS_BANDS[STATUS_BANDS.length - 1].label;
}

function readSessionBooted() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    // Storage bloqueado (modo privado estrito, etc.) — trata como primeira
    // entrada; não é motivo pra quebrar o boot.
    return false;
  }
}

function markSessionBooted() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Sem storage disponível — sem problema, só volta a mostrar o boot
    // completo na próxima entrada.
  }
}

// Mesmo padrão de lib/motion/useReducedMotion.js: getServerSnapshot fixo
// (sem sessionStorage no server) e useSyncExternalStore corrige pro valor
// real do cliente antes do primeiro paint — nunca depois, então nunca há
// flash do boot completo pra quem já viu nesta sessão. Preferido a
// setState dentro de um efeito (que dispararia um render em cascata
// perceptível pelo linter e, sem essa correção pré-paint, arriscaria o
// próprio flash que queremos evitar).
function subscribeNever() {
  return () => {};
}
function getBootModeSnapshot() {
  return readSessionBooted() ? "micro" : "full";
}
function getBootModeServerSnapshot() {
  return "full";
}
function useBootMode() {
  return useSyncExternalStore(subscribeNever, getBootModeSnapshot, getBootModeServerSnapshot);
}

function useGlobeSize() {
  const [size, setSize] = useState(0);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;

    function compute() {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const bound = Math.min(vw, vh);
      if (isDesktop) {
        setSize(Math.round(Math.max(280, Math.min(420, bound * 0.34))));
      } else {
        setSize(Math.round(Math.max(200, Math.min(280, bound * 0.56))));
      }
    }

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return size;
}

// Componente que faz o trabalho de verdade (listeners, rAF, refs). Só
// existe enquanto o boot está ativo — o wrapper exportado abaixo para de
// renderizá-lo assim que a sequência termina, o que desmonta de verdade
// (não só esconde) e limpa TUDO: listener de resize, o rAF do BootGlobe,
// o scroll lock. Sem esse split, um "if (!active) return null" sozinho
// deixaria o listener de resize de useGlobeSize vivo pra sempre (deps
// vazias, nunca reexecuta), rodando CPU depois que o Hero já apareceu.
function BootSequence({ onDone }) {
  const reducedMotion = useReducedMotion();
  const globeSize = useGlobeSize();
  const mode = useBootMode(); // 'full' | 'micro' — já correto no primeiro commit do cliente

  const [status, setStatus] = useState(STATUS_BANDS[0].label);

  const rootRef = useRef(null);
  const pctElRef = useRef(null);
  const globeRef = useRef(null);

  const targetRef = useRef(0);
  const displayRef = useRef(0);
  const rafRef = useRef(null);
  const finaleStartedRef = useRef(false);

  // Marcos reais: mount, fontes, imagem do Hero.
  useLayoutEffect(() => {
    if (mode === "micro") {
      // Retorno na mesma sessão: sem corrida de recursos, mas ainda assim
      // um instante real de "SINAL ADQUIRIDO" (~300ms) antes do fim — não
      // pular direto pra 100%/SISTEMA PRONTO no primeiro frame, como pedido
      // ("microsequência muito curta de SIGNAL ACQUIRED", não um corte seco).
      targetRef.current = 97;
      const timer = setTimeout(() => {
        targetRef.current = MILESTONE_DONE;
      }, 300);
      return () => clearTimeout(timer);
    }

    let cancelled = false;
    const resolved = { fonts: false, heroImage: false };

    function checkAllResolved() {
      if (resolved.fonts && resolved.heroImage) {
        targetRef.current = MILESTONE_DONE;
      }
    }

    targetRef.current = Math.max(targetRef.current, MILESTONE_MOUNT);

    const fontsReady = document.fonts?.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      if (cancelled) return;
      resolved.fonts = true;
      targetRef.current = Math.max(targetRef.current, MILESTONE_FONTS);
      checkAllResolved();
    });

    const img = new Image();
    function onHeroImageSettled() {
      if (cancelled) return;
      resolved.heroImage = true;
      targetRef.current = Math.max(targetRef.current, MILESTONE_HERO_IMAGE);
      checkAllResolved();
    }
    img.onload = onHeroImageSettled;
    img.onerror = onHeroImageSettled; // falha ao pré-carregar não pode travar o boot pra sempre
    img.src = HERO_IMAGE_SRC;

    return () => {
      cancelled = true;
    };
  }, [mode]);

  // Trava o scroll nativo enquanto o boot está na tela — não é um
  // playground, é uma sequência narrativa. Restaurado no cleanup (roda
  // quando BootSequence desmonta de verdade, via o wrapper abaixo).
  useLayoutEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Loop de interpolação: persegue targetRef sem nunca ultrapassá-lo, evita
  // re-render do React a cada frame (escreve direto no DOM via ref) — só o
  // texto de status (que muda raramente) passa por setState.
  useLayoutEffect(() => {
    function tick() {
      const target = targetRef.current;
      const fast = mode === "micro" || reducedMotion;
      if (fast) {
        displayRef.current = target;
      } else {
        const eased = damp(displayRef.current, target, 0.13);
        // damp() é assintótico — sem isso, o número trava em "99%" por um
        // tempo perceptível, chegando bem devagar em 100. Snap só no
        // último meio ponto, não afeta o resto da curva.
        displayRef.current = Math.abs(target - eased) < 0.5 ? target : eased;
      }

      const rounded = Math.min(100, Math.round(displayRef.current));
      if (pctElRef.current) {
        pctElRef.current.textContent = String(rounded).padStart(2, "0") + "%";
      }
      setStatus((prev) => {
        const label = statusFor(rounded);
        return label === prev ? prev : label;
      });

      globeRef.current?.setProgress?.(rounded / 100);

      if (rounded >= MILESTONE_DONE && target >= MILESTONE_DONE && !finaleStartedRef.current) {
        finaleStartedRef.current = true;
        globeRef.current?.triggerFinale?.(
          () => {
            markSessionBooted();
            gsap.to(rootRef.current, {
              opacity: 0,
              duration: reducedMotion ? 0.2 : 0.45,
              ease: "power1.out",
              onComplete: onDone,
            });
          },
          { fast: mode === "micro" }
        );
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [mode, reducedMotion, onDone]);

  const showGlobe = globeSize > 0;

  const microLines = useMemo(
    () => [
      { label: "SYS/BOOT", value: "OK" },
      { label: "SIGNAL", value: "—" },
      { label: "SESSÃO", value: "NOVA" },
    ],
    []
  );

  return (
    <div
      ref={rootRef}
      data-boot-loader
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden bg-ink px-[var(--gutter)]"
      style={{ backgroundColor: "#040506" }}
      aria-hidden="true"
    >
      <span className="font-mono-label text-label mb-6 text-graphite/70 sm:mb-8">VITOR.SYSTEMS / BOOT</span>

      <div className="relative flex items-center justify-center">
        {showGlobe && <BootGlobe ref={globeRef} size={globeSize} reducedMotion={reducedMotion} />}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8">
        <span
          ref={pctElRef}
          className="font-display text-paper"
          style={{ fontSize: "clamp(2.4rem, 8vw, 3.6rem)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}
        >
          00%
        </span>
        <span className="font-mono-label text-label text-graphite">{status}</span>
      </div>

      {mode === "full" && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-6 sm:flex">
          {microLines.map((line) => (
            <span key={line.label} className="font-mono-label text-label text-graphite/50">
              {line.label} {line.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Wrapper fino: só ele fica montado pra sempre (custo ~zero, sem
// listeners). Enquanto `active` é true, renderiza BootSequence; assim que
// ela chama onDone, para de renderizá-la — desmonte de verdade, não um
// "hidden" disfarçado.
export default function SystemBootLoader() {
  const [active, setActive] = useState(true);
  const onDone = useCallback(() => setActive(false), []);
  if (!active) return null;
  return <BootSequence onDone={onDone} />;
}
