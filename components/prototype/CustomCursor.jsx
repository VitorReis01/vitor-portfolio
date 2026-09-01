"use client";

import { useEffect, useRef } from "react";

// Cursor customizado é contextual, não global: só acende sobre elementos
// marcados com data-cursor (ação real), nunca sobre texto corrido comum.
// Segue o mouse com um leve atraso (lerp), não 1:1 — e usa blend-mode
// "difference" para se adaptar sozinho a fundos --ink ou --paper sem lógica
// por seção.
export default function CustomCursor() {
  const dotRef = useRef(null);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return undefined;

    const dot = dotRef.current;
    if (!dot) return undefined;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...mouse };
    let frame = null;

    const render = () => {
      current.x += (mouse.x - current.x) * 0.22;
      current.y += (mouse.y - current.y) * 0.22;
      dot.style.transform = `translate(${current.x}px, ${current.y}px) translate(-50%, -50%)`;
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const handleMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;

      const actionable = event.target.closest("[data-cursor]");
      if (actionable) {
        dot.dataset.active = "true";
        dot.dataset.variant = actionable.dataset.cursor === "label" ? "label" : "dot";
        dot.textContent = actionable.dataset.cursor === "label" ? actionable.dataset.cursorLabel || "" : "";
      } else {
        dot.dataset.active = "false";
        dot.dataset.variant = "dot";
        dot.textContent = "";
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={dotRef} className="custom-cursor font-mono-label text-label" data-active="false" aria-hidden="true" />;
}
