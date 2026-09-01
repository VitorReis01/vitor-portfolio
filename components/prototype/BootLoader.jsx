"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";

const LOG_LINES = ["VITOR.SYSTEMS", "SYSTEM READY"];
const SESSION_KEY = "vitor-prototype-intro-seen";

function subscribeNever() {
  return () => {};
}
function getAlreadySeenSnapshot() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}
function getAlreadySeenServerSnapshot() {
  return false;
}

// Sequência de boot curta (~1s) — nunca um spinner. A assinatura do estúdio
// (VITOR.SYSTEMS → SYSTEM READY), um traço de progresso, e uma cortina que
// revela a Hero já montada por trás (sem salto/flash de conteúdo).
export default function BootLoader({ reducedMotion }) {
  const rootRef = useRef(null);
  const lineRef = useRef(null);
  const trackRef = useRef(null);
  const alreadySeen = useSyncExternalStore(subscribeNever, getAlreadySeenSnapshot, getAlreadySeenServerSnapshot);
  const skip = alreadySeen || reducedMotion;

  useEffect(() => {
    if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  useEffect(() => {
    if (skip) return undefined;

    const root = rootRef.current;
    const line = lineRef.current;
    const track = trackRef.current;
    if (!root || !line || !track) return undefined;

    const setLine = (text) => {
      line.textContent = text;
    };

    const ctx = gsap.context(() => {
      // Curta e autoral (~1s): sem estética de terminal exagerada — só a
      // assinatura do estúdio, depois um wipe direto para a Hero já montada.
      const tl = gsap.timeline();

      tl.call(() => setLine(LOG_LINES[0]))
        .fromTo(line, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power1.out" })
        .to(track, { scaleX: 1, duration: 0.4, ease: "power2.inOut", transformOrigin: "left" }, "<")
        .to(line, { opacity: 0, duration: 0.1 }, "-=0.05")
        .call(() => setLine(LOG_LINES[1]))
        .to(line, { opacity: 1, duration: 0.1 })
        .to(line, { opacity: 0, duration: 0.12, delay: 0.08 })
        .to(root, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.4,
          ease: "expo.inOut",
        })
        .set(root, { display: "none" });
    }, root);

    return () => ctx.revert();
  }, [skip]);

  if (skip) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-4">
        <span ref={lineRef} className="font-mono-label text-label text-paper" />
        <div className="h-px w-40 overflow-hidden bg-graphite/30">
          <div ref={trackRef} className="h-full w-full origin-left scale-x-0 bg-signal" />
        </div>
      </div>
    </div>
  );
}
