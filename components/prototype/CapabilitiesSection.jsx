"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const GROUPS = [
  {
    id: "design",
    name: "Design",
    tags: ["UX/UI", "Product thinking", "Prototyping", "Responsive systems"],
    motif: "grid",
  },
  {
    id: "development",
    name: "Development",
    tags: ["Next.js", "JavaScript", "HTML", "CSS", "Tailwind"],
    motif: "code",
  },
  {
    id: "interaction",
    name: "Interaction",
    tags: ["GSAP", "Three.js", "3D", "Motion", "Scroll experiences"],
    motif: "geometry",
  },
  {
    id: "systems",
    name: "Systems",
    tags: ["APIs", "SQL", "JSON", "Architecture", "Analytics", "Deployment"],
    motif: "nodes",
  },
];

const tagListVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.035, delayChildren: 0.1 },
  },
  exit: { height: 0, opacity: 0, transition: { duration: 0.3, ease: [0.65, 0, 0.35, 1] } },
};

const tagVariants = {
  hidden: { y: "100%" },
  visible: { y: "0%", transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

// Pequeno sistema visual por área — extremamente sutil, só para reforçar a
// natureza de cada grupo sem virar decoração. SVG puro, sem canvas.
function GroupMotif({ motif }) {
  if (motif === "grid") {
    return (
      <svg viewBox="0 0 80 80" className="h-16 w-16 opacity-30">
        {[16, 32, 48, 64].map((v) => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="80" stroke="var(--graphite)" strokeWidth="0.5" />
            <line x1="0" y1={v} x2="80" y2={v} stroke="var(--graphite)" strokeWidth="0.5" />
          </g>
        ))}
      </svg>
    );
  }
  if (motif === "code") {
    return (
      <div className="font-mono-label flex select-none flex-col gap-0.5 text-[10px] leading-tight text-graphite opacity-40">
        <span>{"<div>"}</span>
        <span className="pl-3">{"{ props }"}</span>
        <span>{"</div>;"}</span>
      </div>
    );
  }
  if (motif === "geometry") {
    return (
      <svg viewBox="0 0 80 80" className="h-16 w-16 opacity-30">
        <polygon points="40,8 72,64 8,64" fill="none" stroke="var(--graphite)" strokeWidth="0.6" />
        <circle cx="40" cy="46" r="18" fill="none" stroke="var(--graphite)" strokeWidth="0.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 80" className="h-16 w-16 opacity-30">
      <line x1="14" y1="20" x2="40" y2="46" stroke="var(--graphite)" strokeWidth="0.6" />
      <line x1="66" y1="20" x2="40" y2="46" stroke="var(--graphite)" strokeWidth="0.6" />
      <line x1="40" y1="46" x2="40" y2="70" stroke="var(--graphite)" strokeWidth="0.6" />
      {[
        [14, 20],
        [66, 20],
        [40, 46],
        [40, 70],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="var(--signal)" />
      ))}
    </svg>
  );
}

// Índice editorial, não grade de ícones — a composição inteira reage a qual
// área está ativa (um nome-fantasma gigante nasce atrás, um pequeno sistema
// visual próprio acompanha as tags), não só o hover revelando texto abaixo.
export default function CapabilitiesSection() {
  const [active, setActive] = useState(null);
  const activeGroup = GROUPS.find((group) => group.id === active);

  return (
    <section id="capabilities" className="relative overflow-hidden bg-ink px-[var(--gutter)] py-24">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-[var(--gutter)]" aria-hidden="true">
        <AnimatePresence mode="wait">
          {activeGroup ? (
            <motion.span
              key={activeGroup.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-display select-none whitespace-nowrap font-semibold uppercase text-transparent"
              style={{ fontSize: "clamp(6rem, 18vw, 15rem)", WebkitTextStroke: "1px rgba(243,241,234,0.08)" }}
            >
              {activeGroup.name}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <span className="relative font-mono-label text-label text-graphite">capabilities</span>

      <div className="relative mt-8 border-t border-graphite/20">
        {GROUPS.map((group, index) => {
          const isActive = active === group.id;
          const isDimmed = active !== null && !isActive;
          return (
            <div
              key={group.id}
              className="border-b border-graphite/20 transition-[opacity,transform] duration-300 ease-out"
              style={{
                opacity: isDimmed ? 0.35 : 1,
                transform: isDimmed ? "translateX(-6px)" : "translateX(0)",
              }}
              onMouseEnter={() => setActive(group.id)}
              onMouseLeave={() => setActive((current) => (current === group.id ? null : current))}
            >
              <button
                type="button"
                onClick={() => setActive((current) => (current === group.id ? null : group.id))}
                className="flex w-full items-center gap-6 py-6 text-left"
                aria-expanded={isActive}
              >
                <span className="font-mono-label text-label text-graphite">{String(index + 1).padStart(2, "0")}</span>
                <span
                  className="font-display text-heading font-medium transition-[color,transform] duration-200 ease-out"
                  style={{
                    color: isActive ? "var(--signal)" : "var(--paper)",
                    transform: isActive ? "translateX(0.4em)" : "translateX(0)",
                  }}
                >
                  {group.name}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isActive ? (
                  <motion.div
                    variants={tagListVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-8 pl-0 md:pl-16">
                      <GroupMotif motif={group.motif} />
                      {group.tags.map((tag) => (
                        <span key={tag} className="overflow-hidden">
                          <motion.span variants={tagVariants} className="font-mono-label text-label inline-block text-graphite">
                            <span className="text-graphite/50">→</span> {tag}
                          </motion.span>
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
