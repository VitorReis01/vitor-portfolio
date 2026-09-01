"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// Navegação mínima — some ao rolar para baixo, volta ao rolar para cima.
// Nunca compete com o conteúdo: só texto, sem fundo sólido, sem menu cheio.
export default function Nav() {
  const navRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const goingDown = y > lastY + 4;
        const goingUp = y < lastY - 4;
        if (y < 80) {
          setHidden(false);
        } else if (goingDown) {
          setHidden(true);
        } else if (goingUp) {
          setHidden(false);
        }
        lastY = y;
        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;
    gsap.to(navRef.current, {
      yPercent: hidden ? -130 : 0,
      duration: 0.5,
      ease: "power3.out",
    });
  }, [hidden]);

  return (
    <header
      ref={navRef}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[var(--gutter)] py-6 mix-blend-difference"
    >
      <a href="#hero" className="font-mono-label text-label text-paper">
        VITOR REIS
      </a>
      <nav className="flex items-center gap-6">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-mono-label text-label hidden text-paper transition-opacity duration-150 hover:opacity-60 sm:inline-block"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
