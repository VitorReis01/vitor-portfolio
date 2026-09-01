"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS } from "@/lib/projects";
import CommerceCaseSection from "./CommerceCaseSection";

const [IMESUL, SYNTRA, LOOKOUT] = PROJECTS;

function GiantNumber({ number, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`font-display pointer-events-none select-none font-semibold text-transparent ${className}`}
      style={{
        fontSize: "clamp(9rem, 32vw, 24rem)",
        lineHeight: 0.8,
        WebkitTextStroke: "1px rgba(243,241,234,0.14)",
      }}
    >
      {number}
    </span>
  );
}

function Meta({ project }) {
  return (
    <p className="font-mono-label text-label mt-4 text-graphite">
      {project.role.join(" · ")} — {project.tech.join(", ")} · {project.year}
    </p>
  );
}

// 01 — IMESUL: o case mais forte, abre Selected Work. Cresce e se dissolve
// exatamente enquanto o case estendido (CommerceCaseSection) nasce logo
// abaixo — mesmo handoff físico usado no resto do site.
function ImesulBlock({ reducedMotion }) {
  const blockRef = useRef(null);
  const mediaRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const handoffTarget = document.querySelector("[data-handoff-headline]");

      if (reducedMotion) {
        gsap.set(mediaRef.current, { clipPath: "inset(0% 0% 0% 0%)", scale: 1 });
        gsap.set(textRef.current, { opacity: 1, y: 0 });
        if (handoffTarget) gsap.set(handoffTarget, { opacity: 1, scale: 1 });
        return;
      }

      gsap.set(mediaRef.current, { clipPath: "inset(0% 0% 0% 0%)", scale: 0.9, opacity: 0 });
      gsap.set(textRef.current, { opacity: 0, y: 24 });
      if (handoffTarget) gsap.set(handoffTarget, { opacity: 0, scale: 0.92 });

      gsap
        .timeline({ scrollTrigger: { trigger: blockRef.current, start: "top 90%" } })
        .to(mediaRef.current, { scale: 1, opacity: 1, duration: 1.1, ease: "expo.out" })
        .to(textRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5");

      ScrollTrigger.create({
        trigger: blockRef.current,
        start: "bottom 85%",
        end: "bottom 5%",
        scrub: 0.4,
        onUpdate: (self) => {
          gsap.set(mediaRef.current, { scale: 1 + self.progress * 0.15, opacity: 1 - self.progress });
          gsap.set(textRef.current, { opacity: 1 - self.progress });
          if (handoffTarget) {
            gsap.set(handoffTarget, { opacity: self.progress, scale: 0.92 + self.progress * 0.08 });
          }
        },
      });
    }, blockRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <article
      ref={blockRef}
      id={IMESUL.id}
      style={{ "--signal": IMESUL.accent }}
      className="relative flex min-h-svh items-center overflow-hidden border-t border-graphite/15 px-[var(--gutter)] py-20"
    >
      <GiantNumber number={IMESUL.index} className="absolute -left-4 bottom-4 md:bottom-8" />

      <div className="relative grid w-full gap-10 md:grid-cols-12 md:items-center md:gap-6">
        <div ref={mediaRef} data-handoff-media className="overflow-hidden md:col-span-8">
          <div className={`relative overflow-hidden ${IMESUL.media.aspect}`}>
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={IMESUL.media.src}
              poster={IMESUL.media.poster}
              autoPlay={!reducedMotion}
              muted
              loop={!reducedMotion}
              playsInline
              preload="metadata"
              aria-label={`${IMESUL.title} preview`}
            />
          </div>
        </div>

        <div ref={textRef} className="md:col-span-4 md:pl-4">
          <span className="font-mono-label text-label text-graphite">
            {IMESUL.index} / {IMESUL.year}
          </span>
          <h3 className="font-display text-display mt-3 font-semibold uppercase text-paper">{IMESUL.title}</h3>
          <p className="font-mono-label mt-3 text-label text-graphite">{IMESUL.subtitle}</p>
          <p className="font-display text-subheading mt-5 max-w-[26ch] font-medium text-paper/90">{IMESUL.what}</p>
          <p className="text-body mt-4 max-w-[40ch] text-paper/55">{IMESUL.why}</p>
          <Meta project={IMESUL} />
          <a
            href={IMESUL.cta.href}
            data-cursor="label"
            data-cursor-label="view"
            className="mt-8 inline-flex items-center gap-2 border-b border-signal pb-1 text-body text-paper transition-colors duration-150 hover:text-signal"
          >
            {IMESUL.cta.label} →
          </a>
        </div>
      </div>
    </article>
  );
}

// 02 — SYNTRA: cresce continuamente enquanto está em foco (metáfora de
// sistema que evolui), número gigante ancorado atrás, título mordendo a
// borda da mídia em vez de morar numa coluna própria.
function SyntraBlock({ reducedMotion }) {
  const blockRef = useRef(null);
  const mediaRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(mediaRef.current, { clipPath: "inset(0% 0% 0% 0%)", scale: 1 });
        gsap.set(textRef.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(mediaRef.current, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(textRef.current, { opacity: 0, y: 24 });

      gsap
        .timeline({ scrollTrigger: { trigger: blockRef.current, start: "top 95%" } })
        .to(mediaRef.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.out" })
        .to(textRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5");

      ScrollTrigger.create({
        trigger: blockRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
        onUpdate: (self) => {
          gsap.set(mediaRef.current, { scale: 1 + self.progress * 0.16 });
        },
      });
    }, blockRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <article
      ref={blockRef}
      id={SYNTRA.id}
      style={{ "--signal": SYNTRA.accent }}
      className="relative flex min-h-svh items-center overflow-hidden border-t border-graphite/15 px-[var(--gutter)] py-20"
    >
      <GiantNumber number={SYNTRA.index} className="absolute -left-4 top-10 md:top-16" />

      <div className="relative grid w-full gap-10 md:grid-cols-12 md:items-end md:gap-6">
        <div ref={mediaRef} className="overflow-hidden md:col-span-7">
          <div className={`relative overflow-hidden ${SYNTRA.media.aspect}`}>
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={SYNTRA.media.src}
              autoPlay={!reducedMotion}
              muted
              loop={!reducedMotion}
              playsInline
              preload="metadata"
              aria-label={`${SYNTRA.title} preview`}
            />
          </div>
        </div>

        <div ref={textRef} className="relative md:col-span-6 md:col-start-6 md:-mt-16 md:pl-6">
          <span className="font-mono-label text-label text-graphite">
            {SYNTRA.index} / {SYNTRA.year}
          </span>
          <h3 className="font-display text-display mt-3 font-semibold uppercase text-paper">{SYNTRA.title}</h3>
          <p className="font-mono-label mt-3 text-label text-graphite">{SYNTRA.subtitle}</p>
          <p className="font-display text-subheading mt-5 max-w-[24ch] font-medium text-paper/90">{SYNTRA.what}</p>
          <p className="text-body mt-4 text-paper/55">{SYNTRA.status}</p>
        </div>
      </div>
    </article>
  );
}

// 03 — LOOKOUT: a mídia fica pinada enquanto a informação ao lado é
// substituída em três estágios — a própria composição encena "observar um
// feed" em vez de descrever a ideia em texto corrido.
function LookoutBlock({ reducedMotion }) {
  const wrapRef = useRef(null);
  const mediaRef = useRef(null);
  const stageRefs = useRef([]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const stages = stageRefs.current;
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      if (reducedMotion || !isDesktop) {
        gsap.set(mediaRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(stages, { opacity: 1, position: "relative" });
        return;
      }

      gsap.set(mediaRef.current, { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(stages[0], { opacity: 1 });
      gsap.set(stages.slice(1), { opacity: 0 });

      gsap.to(mediaRef.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: wrapRef.current, start: "top 90%" },
      });

      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const raw = self.progress * stages.length;
          stages.forEach((el, index) => {
            const focus = Math.max(0, 1 - Math.abs(raw - (index + 0.5)));
            gsap.set(el, { opacity: focus });
          });
        },
      });
    }, wrapRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div
      ref={wrapRef}
      id={LOOKOUT.id}
      style={{ "--signal": LOOKOUT.accent }}
      className="relative border-t border-graphite/15 md:h-[230vh]"
    >
      <article className="flex min-h-svh items-center overflow-hidden px-[var(--gutter)] py-20 md:sticky md:top-0">
        <GiantNumber number={LOOKOUT.index} className="absolute -right-4 bottom-6 md:bottom-10" />

        <div className="relative grid w-full gap-10 md:grid-cols-12 md:items-center md:gap-6">
          <div className="relative md:order-2 md:col-span-8">
            <div ref={mediaRef} className="overflow-hidden">
              <div className={`relative overflow-hidden ${LOOKOUT.media.aspect}`}>
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={LOOKOUT.media.src}
                  autoPlay={!reducedMotion}
                  muted
                  loop={!reducedMotion}
                  playsInline
                  preload="metadata"
                  aria-label={`${LOOKOUT.title} preview`}
                />
              </div>
            </div>
          </div>

          <div className="relative h-48 md:order-1 md:col-span-4">
            <div
              ref={(el) => {
                stageRefs.current[0] = el;
              }}
              className="absolute inset-0"
            >
              <span className="font-mono-label text-label text-graphite">
                {LOOKOUT.index} / {LOOKOUT.year}
              </span>
              <h3 className="font-display text-display mt-3 font-semibold uppercase text-paper">{LOOKOUT.title}</h3>
            </div>

            <p
              ref={(el) => {
                stageRefs.current[1] = el;
              }}
              className="font-mono-label text-label absolute inset-x-0 top-0 text-graphite"
            >
              {LOOKOUT.subtitle}
            </p>

            <p
              ref={(el) => {
                stageRefs.current[2] = el;
              }}
              className="font-display text-subheading absolute inset-x-0 top-0 max-w-[22ch] font-medium text-paper/90"
            >
              {LOOKOUT.what}
            </p>

            <p
              ref={(el) => {
                stageRefs.current[3] = el;
              }}
              className="text-body absolute inset-x-0 top-0 text-paper/55"
            >
              {LOOKOUT.status}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

function ProjectIndex() {
  return (
    <ul className="mt-6 flex list-none flex-wrap gap-x-8 gap-y-2 px-[var(--gutter)]">
      {PROJECTS.map((project) => (
        <li key={project.id}>
          <a
            href={`#${project.id}`}
            className="font-mono-label text-label text-graphite transition-colors duration-150 hover:text-paper"
          >
            {project.index} / {project.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function SelectedWorkSection({ reducedMotion }) {
  return (
    <section id="work" className="bg-ink">
      <div className="flex items-baseline justify-between px-[var(--gutter)] pt-24">
        <span className="font-mono-label text-label text-graphite">selected work</span>
        <span className="font-mono-label text-label text-graphite">{PROJECTS.length.toString().padStart(2, "0")} projects</span>
      </div>
      <ProjectIndex />

      <ImesulBlock reducedMotion={reducedMotion} />
      <div style={{ "--signal": IMESUL.accent }}>
        <CommerceCaseSection reducedMotion={reducedMotion} />
      </div>
      <SyntraBlock reducedMotion={reducedMotion} />
      <LookoutBlock reducedMotion={reducedMotion} />
    </section>
  );
}
