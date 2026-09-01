"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "intro" },
  { id: "work", label: "work" },
  { id: "capabilities", label: "capabilities" },
  { id: "how-i-build", label: "how i build" },
  { id: "about", label: "about" },
  { id: "contact", label: "contact" },
];

// Indicador de progresso funcional, discreto — nunca uma barra grande, nunca
// compete com o conteúdo.
export default function SectionProgress() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const targets = SECTIONS.map((section) => document.getElementById(section.id)).filter(Boolean);
    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = targets.indexOf(entry.target);
            if (index !== -1) setActive(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-40 hidden items-center gap-2 font-mono-label text-label text-graphite mix-blend-difference md:flex"
      aria-hidden="true"
    >
      <span className="text-paper">{SECTIONS[active].label}</span>
      <span>
        {String(active + 1).padStart(2, "0")} / {String(SECTIONS.length).padStart(2, "0")}
      </span>
    </div>
  );
}
