"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS } from "@/lib/projects";

const FIRST_PROJECT_ACCENT = PROJECTS[0].accent; // vermelho IMESUL — para onde a estrutura "vira cor" no scroll
const MICRO_LABELS = ["DESIGN", "BUILD", "SYSTEM", "MOTION"];

// Um único conjunto de planos — os 2 marcados `mobileHidden` somem via CSS
// abaixo de `md` (nunca por condicional de render: mesma marcação no
// servidor e no cliente, sem risco de hydration mismatch). O aglomerado
// inteiro encolhe no mobile via `scale`, não por reconfiguração de dados.
const PLANES = [
  { w: 128, h: 96, x: -40, y: -60, z: 58, rx: -8, ry: 14, rz: -4, tier: "front", grid: true, exit: "left" },
  { w: 84, h: 108, x: 60, y: -20, z: 12, rx: 6, ry: -10, rz: 3, tier: "mid", exit: "right" },
  { w: 150, h: 70, x: -10, y: 50, z: -46, rx: 10, ry: 6, rz: -2, tier: "back", exit: "left", mobileHidden: true },
  { w: 66, h: 66, x: 90, y: 70, z: 64, rx: -4, ry: -18, rz: 6, tier: "front", label: true, exit: "right" },
  { w: 100, h: 60, x: -70, y: 90, z: -34, rx: 4, ry: 12, rz: -6, tier: "back", grid: true, exit: "left", mobileHidden: true },
  { w: 70, h: 90, x: 20, y: -95, z: 6, rx: 3, ry: -6, rz: -3, tier: "mid", micro: "skew", exit: "right" },
];

const TIER_MOUSE_FACTOR = { front: 0.4, mid: 0.2, back: 0.08 };

// A interação-assinatura do site: um pequeno aglomerado de planos vivo —
// nunca parado. Quatro camadas de movimento independentes, cada uma na sua
// própria propriedade/elemento para nunca competir entre si:
//   scrollLayerRef → transformação por scroll (abre, tinge de vermelho, sai)
//   driftRef       → deriva autônoma lenta e orgânica (sempre ligada)
//   stageRef       → inclinação de resposta ao mouse (quickTo, com inércia)
//   planos         → respiração própria (z/rotateZ) + parallax por camada (x/y)
export default function HeroStructure({ reducedMotion, heroSectionRef }) {
  const wrapRef = useRef(null);
  const scrollLayerRef = useRef(null);
  const driftRef = useRef(null);
  const stageRef = useRef(null);
  const tintRef = useRef(null);
  const sweepRefs = useRef([]);
  const signalRef = useRef(null);
  const labelRef = useRef(null);
  const planeRefs = useRef([]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    const wrap = wrapRef.current;
    const drift = driftRef.current;
    const stage = stageRef.current;
    if (!wrap || !drift || !stage) return undefined;

    const planes = planeRefs.current.slice(0, PLANES.length);
    const idleTweens = [];
    let removeMouseListeners;
    let scrollTrigger;

    const ctx = gsap.context(() => {
      planes.forEach((plane, index) => {
        if (!plane) return;
        const base = PLANES[index];
        gsap.set(plane, {
          xPercent: -50,
          yPercent: -50,
          x: base.x,
          y: base.y,
          z: base.z,
          rotateX: base.rx,
          rotateY: base.ry,
          rotateZ: base.rz,
        });
      });
      gsap.set(signalRef.current, { xPercent: -50, yPercent: -50, opacity: 0.35 });
      gsap.set(tintRef.current, { opacity: 0 });
      sweepRefs.current.forEach((sweep) => sweep && gsap.set(sweep, { xPercent: -160 }));

      if (reducedMotion) {
        // Pose final completa, sem loop — identidade presente, sem repetição.
        gsap.set(signalRef.current, { opacity: 0.7 });
        return;
      }

      // ── Entrada: estrutura compactada → planos se abrem → sinal acende → idle começa.
      planes.forEach((plane) => {
        gsap.set(plane, { x: 0, y: 0, z: 0, scale: 0.6, opacity: 0 });
      });
      const entrance = gsap.timeline({ delay: 0.35 });
      entrance
        .to(
          planes,
          {
            x: (index) => PLANES[index].x,
            y: (index) => PLANES[index].y,
            z: (index) => PLANES[index].z,
            scale: 1,
            opacity: 1,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.06,
          },
          0.1
        )
        .to(signalRef.current, { opacity: 1, duration: 0.4, ease: "power1.out" }, "-=0.3")
        .call(startIdleMotion);

      function startIdleMotion() {
        // Deriva autônoma do conjunto inteiro — nunca linear, nunca em fase.
        idleTweens.push(
          gsap.to(drift, { x: 10, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 }),
          gsap.to(drift, { y: -14, duration: 12, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.6 }),
          gsap.to(drift, { rotateY: 3, duration: 15, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.1 }),
          gsap.to(drift, { rotateX: 2, duration: 10.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.3 })
        );

        // Respiração própria de cada plano — profundidade e giro leves.
        planes.forEach((plane, index) => {
          if (!plane) return;
          const base = PLANES[index];
          idleTweens.push(
            gsap.to(plane, {
              z: base.z + (index % 2 === 0 ? 14 : -14),
              duration: 5 + index * 0.8,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: index * 0.35,
            }),
            gsap.to(plane, {
              rotateZ: base.rz + (index % 2 === 0 ? 4 : -4),
              duration: 6.5 + index * 0.6,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: index * 0.2,
            })
          );
          if (base.micro === "skew") {
            idleTweens.push(
              gsap.to(plane, { skewY: 2, duration: 4.2, ease: "sine.inOut", yoyo: true, repeat: -1 })
            );
          }
        });

        // Linha de luz percorrendo os planos de grid — bem lenta.
        sweepRefs.current.forEach((sweep, index) => {
          if (!sweep) return;
          idleTweens.push(
            gsap.to(sweep, {
              xPercent: 260,
              duration: 8,
              ease: "sine.inOut",
              repeat: -1,
              repeatDelay: 2,
              delay: index * 1.5,
            })
          );
        });

        // Pulso do signal color — nunca glow grande, só opacidade.
        idleTweens.push(
          gsap.to(signalRef.current, { opacity: 0.35, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 })
        );

        // Microfragmentos técnicos entrando/saindo — discretos.
        if (labelRef.current) {
          let labelIndex = 0;
          labelRef.current.textContent = MICRO_LABELS[0];
          gsap.set(labelRef.current, { opacity: 0.5 });
          const cycleLabel = () => {
            labelIndex = (labelIndex + 1) % MICRO_LABELS.length;
            gsap
              .timeline()
              .to(labelRef.current, { opacity: 0, duration: 0.5, ease: "power1.in" })
              .call(() => {
                labelRef.current.textContent = MICRO_LABELS[labelIndex];
              })
              .to(labelRef.current, { opacity: 0.5, duration: 0.6, ease: "power1.out" });
          };
          idleTweens.push(gsap.delayedCall(3.5, cycleLabel).repeat(-1).repeatDelay(3.2));
        }
      }

      // ── Parallax de mouse — nunca 1:1, sempre com inércia (quickTo).
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (canHover) {
        const rotateX = gsap.quickTo(stage, "rotateX", { duration: 1.1, ease: "power3.out" });
        const rotateY = gsap.quickTo(stage, "rotateY", { duration: 1.1, ease: "power3.out" });
        const signalX = gsap.quickTo(signalRef.current, "x", { duration: 0.9, ease: "power3.out" });
        const signalY = gsap.quickTo(signalRef.current, "y", { duration: 0.9, ease: "power3.out" });

        const planeMovers = planes.map((plane, index) => {
          if (!plane) return null;
          const factor = TIER_MOUSE_FACTOR[PLANES[index].tier] ?? 0.2;
          return {
            x: gsap.quickTo(plane, "x", { duration: 0.7 + index * 0.1, ease: "power3.out" }),
            y: gsap.quickTo(plane, "y", { duration: 0.8 + index * 0.08, ease: "power3.out" }),
            factor,
          };
        });

        function applyMouse(nx, ny) {
          rotateX(ny * -9);
          rotateY(nx * 12);
          signalX(nx * 90);
          signalY(ny * 90);
          planeMovers.forEach((mover, index) => {
            if (!mover) return;
            const base = PLANES[index];
            mover.x(base.x + nx * 60 * mover.factor);
            mover.y(base.y + ny * 60 * mover.factor);
          });
        }

        function handleMove(event) {
          const rect = wrap.getBoundingClientRect();
          applyMouse((event.clientX - rect.left) / rect.width - 0.5, (event.clientY - rect.top) / rect.height - 0.5);
        }
        function handleLeave() {
          applyMouse(0, 0);
        }

        wrap.addEventListener("mousemove", handleMove, { passive: true });
        wrap.addEventListener("mouseleave", handleLeave, { passive: true });
        removeMouseListeners = () => {
          wrap.removeEventListener("mousemove", handleMove);
          wrap.removeEventListener("mouseleave", handleLeave);
        };
      }

      // ── Scroll: a estrutura se abre, ganha tingimento vermelho (cor do
      // primeiro projeto) e se dissolve — prepara a virada para Selected
      // Work / IMESUL. Só existe quando o Hero passa a própria section
      // (não roda na reutilização do Contact). Vive na camada própria
      // (scrollLayerRef) — nunca toca nas propriedades do drift/mouse.
      if (heroSectionRef?.current) {
        gsap.registerPlugin(ScrollTrigger);
        scrollTrigger = ScrollTrigger.create({
          trigger: heroSectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.4,
          onUpdate: (self) => {
            const p = self.progress;
            const spread = 1 + p * 1.6;

            if (p > 0.04) {
              idleTweens.forEach((tween) => tween.pause());
            } else {
              idleTweens.forEach((tween) => tween.resume());
            }

            gsap.set(scrollLayerRef.current, { opacity: 1 - p * 0.98, rotateX: p * -6, scale: 1 + p * 0.1 });
            gsap.set(tintRef.current, { opacity: p * 0.55 });

            planes.forEach((plane, index) => {
              if (!plane) return;
              const base = PLANES[index];
              const goingLeft = base.exit === "left";
              gsap.set(plane, {
                x: base.x * spread + (goingLeft ? -p * 160 : p * 160),
                y: base.y * spread,
                z: base.z + (base.tier === "front" ? p * 90 : -p * 40),
                scale: base.tier === "front" ? 1 + p * 0.3 : 1,
              });
            });
          },
        });
      }
    }, wrap);

    return () => {
      idleTweens.forEach((tween) => tween.kill());
      if (removeMouseListeners) removeMouseListeners();
      if (scrollTrigger) scrollTrigger.kill();
      ctx.revert();
    };
  }, [reducedMotion, heroSectionRef]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute right-[6%] top-[10%] block h-[220px] w-[220px] scale-75 md:right-[8%] md:top-[14%] md:h-[320px] md:w-[320px] md:scale-100"
      style={{ perspective: "900px" }}
      aria-hidden="true"
    >
      <div ref={scrollLayerRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        <div ref={driftRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          <div
            ref={signalRef}
            className="absolute left-1/2 top-1/2 h-40 w-40 rounded-full mix-blend-screen"
            style={{ background: "radial-gradient(circle, var(--signal) 0%, transparent 70%)" }}
          />

          <div ref={stageRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
            {/* Tingimento vermelho (cor do primeiro projeto) — só aparece no scroll. */}
            <div
              ref={tintRef}
              className="absolute inset-0 rounded-full mix-blend-color"
              style={{ background: FIRST_PROJECT_ACCENT }}
            />

            {PLANES.map((plane, index) => (
              <div
                key={index}
                ref={(el) => {
                  planeRefs.current[index] = el;
                }}
                className={`absolute left-1/2 top-1/2 overflow-hidden rounded-sm border border-paper/20 ${
                  plane.mobileHidden ? "hidden md:block" : "block"
                }`}
                style={{
                  width: plane.w,
                  height: plane.h,
                  transformStyle: "preserve-3d",
                  background: "linear-gradient(135deg, rgba(243,241,234,0.07), rgba(243,241,234,0.015))",
                  backdropFilter: "blur(1px)",
                  backgroundImage: plane.grid
                    ? "linear-gradient(rgba(243,241,234,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(243,241,234,0.07) 1px, transparent 1px)"
                    : undefined,
                  backgroundSize: plane.grid ? "10px 10px" : undefined,
                }}
              >
                {plane.grid ? (
                  <div
                    ref={(el) => {
                      sweepRefs.current[index] = el;
                    }}
                    className="absolute inset-y-0 left-0 w-1/3 opacity-25"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(243,241,234,0.6), transparent)" }}
                  />
                ) : null}
                {plane.label ? (
                  <span
                    ref={labelRef}
                    className="font-mono-label absolute bottom-1.5 left-2 text-[8px] text-paper/50"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
