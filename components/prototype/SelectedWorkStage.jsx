"use client";

// Arquitetura aprovada na Fase 4 (protótipo 01 — Selected Work motion).
// Extraído de SelectedWorkMotionPrototype.jsx pra ser reaproveitado sem
// duplicação pelo protótipo Hero→Selected Work — nenhuma linha de lógica
// mudou nessa extração, só o arquivo. NÃO REFATORAR sem necessidade real.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { PROJECTS } from "@/lib/projects";

// Cor do EnergyThread (site inteiro) — reaproveitada só no instante da
// interferência de troca, pra "signal disruption" falar a mesma língua do
// resto do sistema em vez de inventar um ciano próprio.
const THREAD_COLOR = "150, 225, 255";

// Proporções reais medidas dos 3 arquivos (não aproximadas): IMESUL e
// LOOKOUT são 16:9 exato; SYNTRA foi gravado vertical, 716×1274px. Vive só
// aqui — lib/projects.js também alimenta SelectedWorkSection.jsx (página
// principal, fora de escopo), então a correção fica local ao protótipo.
const RATIOS = { imesul: 1920 / 1080, syntra: 716 / 1274, lookout: 1280 / 720 };
const DEVICE_PRESENTATION_IDS = new Set(["syntra"]);
// py-20 do <section> (5rem top + 5rem bottom, em px @ 16px root).
const STAGE_VERTICAL_PADDING = 160;

// Maior caixa da proporção `ratio` que cabe dentro de `bounds` — mesma
// função pros 3 projetos. O celular do SYNTRA não tem um tamanho especial:
// ele disputa o mesmo espaço que o widescreen, só que sua proporção o
// deixa naturalmente estreito.
function fitBox(ratio, bounds) {
  let w = bounds.maxW;
  let h = w / ratio;
  if (h > bounds.maxH) {
    h = bounds.maxH;
    w = h * ratio;
  }
  return { w, h };
}

function GiantIndex({ index }) {
  return (
    <span
      aria-hidden="true"
      className="font-display pointer-events-none absolute -left-4 bottom-2 select-none text-transparent md:bottom-8"
      style={{
        fontSize: "clamp(9rem, 30vw, 22rem)",
        lineHeight: 0.8,
        WebkitTextStroke: "1px rgba(243,241,234,0.14)",
      }}
    >
      {index}
    </span>
  );
}

// Bloco único de metadata — troca conteúdo, nunca empilha. O glitch de
// texto é o mesmo instante da interferência de mídia, não um efeito à parte.
//
// min-w-0 é o detalhe que faltava: sem ele, um item de grid nunca encolhe
// abaixo do tamanho intrínseco do conteúdo (título gigante incluso) — a
// coluna "vence" o grid em vez do contrário. O título usa um clamp próprio
// (não .text-display, pensado pra headline de página inteira, grande
// demais pra uma coluna de ~30%) e break-words como rede de segurança.
function ProjectMetadata({ project, index, count, titleRef, onToggleExpand, expanded }) {
  return (
    <div className={`min-w-0 max-w-full md:pl-4 ${expanded ? "md:hidden" : ""}`}>
      <span className="font-mono-label text-label text-graphite">
        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
      <h3
        ref={titleRef}
        className="font-display mt-3 max-w-full break-words font-semibold uppercase text-paper"
        style={{ fontSize: "clamp(1.7rem, 2.6vw, 2.75rem)", lineHeight: 1.05 }}
      >
        {project.title}
      </h3>
      <p className="font-mono-label mt-3 text-label text-graphite">{project.subtitle}</p>
      <p className="text-body mt-5 max-w-[30ch] text-paper/85">{project.what}</p>
      <p className="text-body mt-3 max-w-[36ch] text-paper/55">{project.why || project.status}</p>
      <p className="font-mono-label text-label mt-4 text-graphite">
        {project.role.join(" · ")} — {project.tech.join(", ")} · {project.year}
      </p>
      <button
        type="button"
        data-cursor="label"
        data-cursor-label="view"
        onClick={onToggleExpand}
        className="mt-8 inline-flex items-center gap-2 border-b border-signal pb-1 text-body text-paper transition-colors duration-150 hover:text-signal"
      >
        {project.cta.label} →
      </button>
    </div>
  );
}

export default function SelectedWorkStage({ reducedMotion, lenisRef }) {
  const stageRef = useRef(null);
  const zoneRef = useRef(null); // coluna que contém o shell (usada só pra medir largura disponível)
  const shellRef = useRef(null); // caixa que muda width/height/aspect real
  const clipRef = useRef(null); // camada interna, sempre overflow-hidden — nunca escapa
  const chromeRef = useRef(null); // moldura externa do SYNTRA (borda + halo), fora do clip
  const videoRef = useRef(null);
  const titleRef = useRef(null);
  const sliceRefs = useRef([]);

  const activeIndexRef = useRef(0);
  const zoneIndexRef = useRef(0);
  const pendingFlipState = useRef(null);
  const swapTlRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const activeProject = PROJECTS[activeIndex];
  const isDevice = DEVICE_PRESENTATION_IDS.has(activeProject.id);

  // Geometria alvo pro projeto ativo — os dois eixos usam bounds reais da
  // MEDIA ZONE (a coluna, não a viewport inteira): largura = clientWidth
  // da própria zona; altura = o menor entre um teto de viewport (evita um
  // vídeo baixo/largo dominar telas curtas) E a altura real disponível no
  // palco (stage menos o padding vertical) — sem esse segundo teto, uma
  // seção mais curta que viewport*0.6 deixava a largura vencer sozinha.
  const computeTarget = useCallback((project, expandedNow) => {
    const zoneWidth = zoneRef.current?.clientWidth || 700;
    const stageHeight = stageRef.current?.clientHeight || window.innerHeight;
    const mediaZoneHeight = Math.max(200, stageHeight - STAGE_VERTICAL_PADDING);

    const bounds = expandedNow
      ? {
          maxW: Math.min(zoneWidth * 1.5, window.innerWidth * 0.86),
          maxH: Math.min(window.innerHeight * 0.82, mediaZoneHeight * 1.35),
        }
      : { maxW: zoneWidth, maxH: Math.min(window.innerHeight * 0.6, mediaZoneHeight) };
    return fitBox(RATIOS[project.id], bounds);
  }, []);

  // Único player de vídeo — troca de src acontece só no instante em que a
  // mídia anterior já está totalmente invisível (visibility:hidden), então
  // o reload nunca é visto.
  const swapMedia = useCallback(
    (nextIndex) => {
      const nextProject = PROJECTS[nextIndex];
      const video = videoRef.current;
      const shell = shellRef.current;
      const target = computeTarget(nextProject, false);

      swapTlRef.current?.kill();
      const tl = gsap.timeline();
      swapTlRef.current = tl;

      tl.to(video, { opacity: 0, duration: 0.1, ease: "power1.in" })
        .set(sliceRefs.current, { opacity: 1 })
        .fromTo(sliceRefs.current, { scaleY: 0 }, { scaleY: 1, duration: 0.05, ease: "none", stagger: 0.015 }, "<")
        .set(video, { visibility: "hidden" })
        .call(() => {
          video.pause();
          video.src = nextProject.media.src;
          if (nextProject.media.poster) video.poster = nextProject.media.poster;
          video.load();
          stageRef.current?.style.setProperty("--signal", nextProject.accent);
          setActiveIndex(nextIndex);
        })
        .to(shell, { width: target.w, height: target.h, duration: 0.4, ease: "power3.inOut" }, "<")
        .to(sliceRefs.current, { opacity: 0, duration: 0.1, ease: "power1.out" }, "<0.05")
        .set(video, { visibility: "visible" })
        .call(() => video.play().catch(() => {}))
        .to(video, { opacity: 1, duration: 0.18, ease: "power2.out" });
    },
    [computeTarget]
  );

  // Setup do palco: pin + zonas discretas (não mais presença contínua) +
  // reação de velocidade no título ativo.
  useLayoutEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return undefined;
    gsap.registerPlugin(ScrollTrigger, Flip);

    const ctx = gsap.context(() => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const count = PROJECTS.length;

      const initial = computeTarget(PROJECTS[0], false);
      gsap.set(shellRef.current, { width: initial.w, height: initial.h });
      gsap.set(videoRef.current, { opacity: 1 });
      videoRef.current.src = PROJECTS[0].media.src;
      if (PROJECTS[0].media.poster) videoRef.current.poster = PROJECTS[0].media.poster;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});

      const st = ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top top",
        end: isDesktop ? "+=300%" : "+=220%",
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const zone = gsap.utils.clamp(0, count - 1, Math.floor(self.progress * count));
          const velocity = self.getVelocity();
          const vNorm = gsap.utils.clamp(-1, 1, velocity / 2500);

          if (zone !== zoneIndexRef.current) {
            zoneIndexRef.current = zone;
            activeIndexRef.current = zone;
            swapMedia(zone);
          }

          if (isDesktop && titleRef.current) {
            gsap.set(titleRef.current, { skewX: vNorm * 2.2, scaleX: 1 + Math.abs(vNorm) * 0.015 });
          }
        },
      });

      // Refresh defensivo: se a fonte custom (--font-display) ainda não
      // tinha aplicado no layout no instante exato deste useLayoutEffect,
      // o "+=300%" foi calculado em cima de uma altura ligeiramente
      // errada da própria section — refresh depois que as fontes
      // confirmarem carregadas corrige o limite do pin sem esperar um
      // resize manual.
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }

      return () => st.kill();
    }, stageRef);

    return () => ctx.revert();
  }, [reducedMotion, swapMedia, computeTarget]);

  // Recalcula a geometria no resize (largura da zona muda) sem disparar a
  // sequência de troca — só reajusta a caixa do projeto já ativo.
  useEffect(() => {
    if (reducedMotion) return undefined;
    function handleResize() {
      const target = computeTarget(PROJECTS[activeIndexRef.current], !!pendingFlipState.current || expanded);
      gsap.set(shellRef.current, { width: target.w, height: target.h });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [reducedMotion, computeTarget, expanded]);

  // Reduced motion: sem pin, sem scrub, sem sequência — assenta direto no
  // primeiro projeto.
  useEffect(() => {
    if (!reducedMotion) return;
    const target = computeTarget(PROJECTS[0], false);
    gsap.set(shellRef.current, { width: target.w, height: target.h });
    gsap.set(videoRef.current, { opacity: 1, visibility: "visible" });
    if (videoRef.current) {
      videoRef.current.src = PROJECTS[0].media.src;
      if (PROJECTS[0].media.poster) videoRef.current.poster = PROJECTS[0].media.poster;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [reducedMotion, computeTarget]);

  const pendingTarget = useRef(null);

  // Efeito colateral do clique fica todo aqui, não dentro do handler — um
  // requestAnimationFrame no meio do handler dependeria do rAF do
  // navegador pra disparar; useLayoutEffect roda de forma síncrona logo
  // após o React aplicar o novo estado ao DOM, sem essa dependência.
  const toggleExpand = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const willExpand = !expanded;

    pendingFlipState.current = Flip.getState(shell);
    pendingTarget.current = computeTarget(PROJECTS[activeIndexRef.current], willExpand);
    if (!reducedMotion) lenisRef.current?.stop();
    setExpanded(willExpand);
  }, [expanded, computeTarget, lenisRef, reducedMotion]);

  useLayoutEffect(() => {
    if (!pendingFlipState.current || !pendingTarget.current) return;
    gsap.set(shellRef.current, { width: pendingTarget.current.w, height: pendingTarget.current.h });
    Flip.from(pendingFlipState.current, {
      duration: reducedMotion ? 0.15 : 0.6,
      ease: "power2.inOut",
      absolute: true,
    });
    pendingFlipState.current = null;
    pendingTarget.current = null;
    if (!expanded && !reducedMotion) lenisRef.current?.start();
  }, [expanded, reducedMotion, lenisRef]);

  useEffect(() => {
    if (!expanded) return undefined;
    function handleKey(event) {
      if (event.key === "Escape") toggleExpand();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [expanded, toggleExpand]);

  return (
    <section
      id="work"
      ref={stageRef}
      style={{ "--signal": PROJECTS[0].accent }}
      className="relative flex min-h-svh items-center overflow-hidden bg-ink py-20"
    >
      <div className="pointer-events-none absolute inset-x-0 top-10 z-10 flex items-center justify-between px-[var(--gutter)]">
        <span className="font-mono-label text-label text-graphite">selected work — motion stage</span>
      </div>

      <div className="pointer-events-none absolute right-[var(--gutter)] bottom-10 z-10 flex items-center gap-2">
        {PROJECTS.map((project, i) => (
          <span
            key={project.id}
            className="h-px w-8 transition-colors duration-300"
            style={{ backgroundColor: i === activeIndex ? project.accent : "rgba(139,141,147,0.3)" }}
          />
        ))}
      </div>

      {[0, 1].map((i) => (
        <span
          key={i}
          ref={(el) => (sliceRefs.current[i] = el)}
          className="pointer-events-none absolute inset-x-0 z-30 h-px opacity-0"
          style={{ top: `${35 + i * 30}%`, background: `rgba(${THREAD_COLOR}, 0.55)`, transformOrigin: "center" }}
        />
      ))}

      <GiantIndex index={activeProject.index} />

      {/*
        Duas colunas com porcentagem explícita (não col-span de um grid de
        12) — é a única forma de travar as duas faixas nos números exatos
        pedidos (58–62% / 28–32%) independente de quanto o gap consome;
        justify-between distribui o resto como espaço entre elas.
      */}
      {/*
        items-start (não items-center): o comprimento do texto de metadata
        varia por projeto (why/status, tech, role), o que mudava a altura
        da linha e deslocava o shell verticalmente ao trocar de projeto —
        alinhar os dois pelo topo torna a posição do shell independente do
        texto ao lado.
      */}
      <div className="relative grid w-full gap-10 px-[var(--gutter)] md:grid-cols-[60%_30%] md:items-start md:justify-between md:gap-0">
        <div ref={zoneRef} className="flex min-w-0 items-center justify-center">
          <div
            ref={shellRef}
            data-cursor="label"
            data-cursor-label={expanded ? "close" : "expand"}
            onClick={toggleExpand}
            className="relative shrink-0 cursor-pointer"
          >
            {isDevice && (
              <div
                ref={chromeRef}
                className="pointer-events-none absolute inset-0 rounded-[2.2rem] border border-paper/12"
                style={{ boxShadow: `0 0 0 1px ${activeProject.accent}26, 0 0 14px 0 ${activeProject.accent}33` }}
              >
                <span className="absolute left-1/2 top-2.5 h-1 w-9 -translate-x-1/2 rounded-full bg-paper/15" />
              </div>
            )}
            <div
              ref={clipRef}
              className={`relative h-full w-full overflow-hidden bg-black ${isDevice ? "rounded-[1.9rem] p-2" : "rounded-md"}`}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]">
                <video
                  ref={videoRef}
                  className={`absolute inset-0 h-full w-full ${isDevice ? "object-contain" : "object-cover"}`}
                  muted
                  loop={!reducedMotion}
                  playsInline
                  preload="auto"
                  aria-label={`${activeProject.title} preview`}
                />
              </div>
            </div>
            {expanded && (
              <span className="font-mono-label text-label absolute right-4 top-4 z-20 rounded-full border border-paper/30 bg-ink/70 px-3 py-1.5 text-paper backdrop-blur">
                close ×
              </span>
            )}
          </div>
        </div>

        <ProjectMetadata
          project={activeProject}
          index={activeIndex}
          count={PROJECTS.length}
          titleRef={titleRef}
          onToggleExpand={toggleExpand}
          expanded={expanded}
        />
      </div>
    </section>
  );
}
