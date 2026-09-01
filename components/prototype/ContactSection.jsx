"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitWords } from "@/lib/motion/splitText";
import HeroStructure from "./HeroStructure";

const HEADLINE = "LET'S BUILD SOMETHING REAL.";
const MAGNET_RADIUS = 90;
const MAGNET_STRENGTH = 0.35;

// Fechamento minimalista — pouquíssimos elementos, um único canal de contato
// confirmado publicamente (Instagram). Nada inventado. O único "magnetic
// button" do site inteiro vive aqui, e a headline reage ao cursor com um
// holofote de --signal (mask-image), não com um efeito solto sem propósito.
export default function ContactSection({ reducedMotion }) {
  const sectionRef = useRef(null);
  const headlineWrapRef = useRef(null);
  const headlineRef = useRef(null);
  const spotlightRef = useRef(null);
  const ctaRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const words = headlineRef.current.querySelectorAll(".word");
      if (reducedMotion) {
        gsap.set(words, { opacity: 1, y: 0 });
        gsap.set(spotlightRef.current, { opacity: 1 });
        return;
      }

      gsap.set(words, { opacity: 0, y: 26 });
      gsap.set(spotlightRef.current, { opacity: 0 });
      gsap
        .timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top 65%" } })
        .to(words, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.08 })
        .to(spotlightRef.current, { opacity: 1, duration: 0.4 }, "-=0.3");
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Holofote --signal preso ao cursor sobre a headline: uma segunda cópia do
  // texto, na cor de sinal, revelada só num raio pequeno ao redor do mouse
  // via mask-image. Custa uma escrita de CSS var por movimento, nada de canvas.
  useEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return undefined;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const wrap = headlineWrapRef.current;
    if (!canHover || !wrap) return undefined;

    let active = false;
    const io = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
    });
    io.observe(wrap);

    function handleMove(event) {
      if (!active) return;
      const rect = wrap.getBoundingClientRect();
      wrap.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      wrap.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("mousemove", handleMove);
    };
  }, [reducedMotion]);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return undefined;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cta = ctaRef.current;
    if (!canHover || !cta) return undefined;

    const moveX = gsap.quickTo(cta, "x", { duration: 0.5, ease: "power3.out" });
    const moveY = gsap.quickTo(cta, "y", { duration: 0.5, ease: "power3.out" });

    function handleMove(event) {
      const rect = cta.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance < MAGNET_RADIUS) {
        moveX(dx * MAGNET_STRENGTH);
        moveY(dy * MAGNET_STRENGTH);
      } else {
        moveX(0);
        moveY(0);
      }
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, [reducedMotion]);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col items-center justify-center gap-10 overflow-hidden bg-ink px-[var(--gutter)] py-24 text-center"
    >
      {/* Loop narrativo: a mesma estrutura de planos do Hero reaparece aqui,
          fechando o ciclo — o site começou como sistema abstrato, terminou
          como convite. */}
      <HeroStructure reducedMotion={reducedMotion} />

      <span className="font-mono-label text-label text-graphite">contact</span>

      <div ref={headlineWrapRef} className="relative max-w-[92vw]" style={{ "--mx": "50%", "--my": "50%" }}>
        <h2
          ref={headlineRef}
          className="font-display max-w-[16ch] break-words text-[clamp(2.75rem,14vw,13.5rem)] leading-[0.86] font-semibold uppercase text-paper"
          aria-label={HEADLINE}
        >
          <span aria-hidden="true">
            {splitWords(HEADLINE).map(({ key, word }) => (
              <span key={key} className="word mx-[0.12em] inline-block">
                {word}
              </span>
            ))}
          </span>
        </h2>

        <h2
          ref={spotlightRef}
          aria-hidden="true"
          className="font-display pointer-events-none absolute inset-0 max-w-[16ch] break-words text-[clamp(2.75rem,14vw,13.5rem)] leading-[0.86] font-semibold uppercase text-signal"
          style={{
            maskImage: "radial-gradient(circle 140px at var(--mx) var(--my), black 0%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(circle 140px at var(--mx) var(--my), black 0%, transparent 100%)",
          }}
        >
          {HEADLINE.split(" ").map((word, index) => (
            <span key={`${word}-${index}`} className="mx-[0.12em] inline-block">
              {word}
            </span>
          ))}
        </h2>
      </div>

      <a
        ref={ctaRef}
        href="https://www.instagram.com/vitor.systems/"
        target="_blank"
        rel="noreferrer"
        data-cursor="label"
        data-cursor-label="open"
        className="font-mono-label text-label inline-block border-b border-signal pb-1 text-paper transition-colors duration-150 hover:text-signal"
      >
        @vitor.systems
      </a>

      <p className="font-mono-label text-label mt-10 text-graphite/60">
        VITOR.SYSTEMS © {new Date().getFullYear()}
      </p>
    </section>
  );
}
