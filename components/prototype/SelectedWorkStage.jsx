"use client";

// Arquitetura aprovada na Fase 4 (protótipo 01 — Selected Work motion).
// Extraído de SelectedWorkMotionPrototype.jsx pra ser reaproveitado sem
// duplicação pelo protótipo Hero→Selected Work — nenhuma linha de lógica
// mudou nessa extração, só o arquivo. NÃO REFATORAR sem necessidade real.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

// Caixa segura pro overlay de expand — nunca um multiplicador de escala
// arbitrário, sempre a maior caixa da proporção real do projeto que cabe
// aqui dentro. Mesma regra pros 3 projetos — IMESUL/LOOKOUT (16:9) e
// SYNTRA (9:16) só diferem na proporção que entra em fitBox.
const OVERLAY_SAFE_BOUNDS = { maxWFrac: 0.87, maxHFrac: 0.8 };

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
        data-cursor-label="ver"
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
  const swapTlRef = useRef(null);
  const interactionLockRef = useRef(false); // true com o overlay aberto — trava a troca de zona no onUpdate do pin

  // Overlay de expand — único sistema pros 3 projetos, portal pra
  // document.body, fora do palco transformado pelo GSAP.
  const overlayBoxRef = useRef(null);
  const overlayVideoRef = useRef(null);
  const backdropRef = useRef(null);
  const overlayOriginRef = useRef(null); // rect real do shell no instante do clique — volta exatamente pra cá ao fechar
  const overlayTlRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [overlayProject, setOverlayProject] = useState(null);

  const activeProject = PROJECTS[activeIndex];
  const isDevice = DEVICE_PRESENTATION_IDS.has(activeProject.id);

  // Geometria de repouso do projeto ativo — os dois eixos usam bounds
  // reais da MEDIA ZONE (a coluna, não a viewport inteira): largura =
  // clientWidth da própria zona; altura = o menor entre um teto de
  // viewport (evita um vídeo baixo/largo dominar telas curtas) E a altura
  // real disponível no palco (stage menos o padding vertical) — sem esse
  // segundo teto, uma seção mais curta que viewport*0.6 deixava a largura
  // vencer sozinha.
  const computeTarget = useCallback((project) => {
    const zoneWidth = zoneRef.current?.clientWidth || 700;
    const stageHeight = stageRef.current?.clientHeight || window.innerHeight;
    const mediaZoneHeight = Math.max(200, stageHeight - STAGE_VERTICAL_PADDING);
    const bounds = { maxW: zoneWidth, maxH: Math.min(window.innerHeight * 0.6, mediaZoneHeight) };
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
      const target = computeTarget(nextProject);

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
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const count = PROJECTS.length;

      const initial = computeTarget(PROJECTS[0]);
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
          // Com o overlay aberto, a troca de zona fica travada — o
          // scroll não pode mudar de projeto por baixo da mídia expandida.
          if (interactionLockRef.current) return;
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
      const target = computeTarget(PROJECTS[activeIndexRef.current]);
      gsap.set(shellRef.current, { width: target.w, height: target.h });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [reducedMotion, computeTarget]);

  // Reduced motion: sem pin, sem scrub, sem sequência — assenta direto no
  // primeiro projeto.
  useEffect(() => {
    if (!reducedMotion) return;
    const target = computeTarget(PROJECTS[0]);
    gsap.set(shellRef.current, { width: target.w, height: target.h });
    gsap.set(videoRef.current, { opacity: 1, visibility: "visible" });
    if (videoRef.current) {
      videoRef.current.src = PROJECTS[0].media.src;
      if (PROJECTS[0].media.poster) videoRef.current.poster = PROJECTS[0].media.poster;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [reducedMotion, computeTarget]);

  // Caixa alvo do overlay — sempre a maior caixa da proporção REAL do
  // projeto dentro de um teto de viewport (87vw / 80vh). Nunca um scale
  // arbitrário — LOOKOUT/IMESUL (16:9) ficam limitados pela largura,
  // SYNTRA (9:16) pela altura, exatamente como fitBox já resolve pro
  // estado de repouso do MediaShell. Único diferencial entre os 3
  // projetos é a proporção que entra aqui — a lógica é a mesma.
  const computeOverlayTarget = useCallback((project) => {
    const bounds = {
      maxW: window.innerWidth * OVERLAY_SAFE_BOUNDS.maxWFrac,
      maxH: window.innerHeight * OVERLAY_SAFE_BOUNDS.maxHFrac,
    };
    const { w, h } = fitBox(RATIOS[project.id], bounds);
    return { width: w, height: h, left: (window.innerWidth - w) / 2, top: (window.innerHeight - h) / 2 };
  }, []);

  // Abre — captura o retângulo REAL do MediaShell antes de qualquer coisa
  // mudar, trava o scroll, e deixa o efeito abaixo (que só roda depois que
  // o portal montou) animar de lá até o centro da tela.
  const openOverlay = useCallback(
    (project) => {
      const shell = shellRef.current;
      if (!shell) return;
      const rect = shell.getBoundingClientRect();
      overlayOriginRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      interactionLockRef.current = true;
      if (!reducedMotion) lenisRef.current?.stop();
      setOverlayProject(project);
    },
    [reducedMotion, lenisRef]
  );

  // Fecha — anima de volta pro retângulo original cacheado (o shell real
  // nunca se moveu, então esse retângulo continua exato) e só desmonta o
  // portal/libera o scroll quando a animação de volta termina — sem salto.
  const closeOverlay = useCallback(() => {
    const origin = overlayOriginRef.current;
    if (!origin || !overlayBoxRef.current) {
      setOverlayProject(null);
      interactionLockRef.current = false;
      return;
    }
    overlayTlRef.current?.kill();
    const tl = gsap.timeline({
      onComplete: () => {
        setOverlayProject(null);
        overlayOriginRef.current = null;
        interactionLockRef.current = false;
        if (shellRef.current) gsap.set(shellRef.current, { opacity: 1, pointerEvents: "auto" });
        if (!reducedMotion) lenisRef.current?.start();
      },
    });
    overlayTlRef.current = tl;
    tl.to(
      overlayBoxRef.current,
      {
        left: origin.left,
        top: origin.top,
        width: origin.width,
        height: origin.height,
        duration: reducedMotion ? 0.15 : 0.65,
        ease: "power3.inOut",
      },
      0
    ).to(backdropRef.current, { opacity: 0, duration: reducedMotion ? 0.1 : 0.3, ease: "power2.out" }, reducedMotion ? 0 : 0.15);
  }, [reducedMotion, lenisRef]);

  // Roda só depois que o portal já montou (overlayBoxRef existe) — parte
  // exatamente do retângulo original cacheado e anima até a caixa segura
  // centralizada na TELA (não na media zone/grid).
  useLayoutEffect(() => {
    if (!overlayProject || !overlayOriginRef.current || !overlayBoxRef.current) return undefined;
    const origin = overlayOriginRef.current;
    const target = computeOverlayTarget(overlayProject);

    gsap.set(overlayBoxRef.current, { left: origin.left, top: origin.top, width: origin.width, height: origin.height });
    gsap.set(backdropRef.current, { opacity: 0 });
    // O MediaShell real some assim que o overlay assume exatamente a
    // mesma posição/tamanho dele — sem isso, uma cópia pequena e
    // escurecida ficaria visível atrás do backdrop enquanto o overlay
    // cresce.
    if (shellRef.current) gsap.set(shellRef.current, { opacity: 0, pointerEvents: "none" });

    overlayTlRef.current?.kill();
    const tl = gsap.timeline();
    overlayTlRef.current = tl;
    tl.to(backdropRef.current, { opacity: 0.65, duration: reducedMotion ? 0.1 : 0.35, ease: "power2.out" }, 0).to(
      overlayBoxRef.current,
      { left: target.left, top: target.top, width: target.width, height: target.height, duration: reducedMotion ? 0.2 : 0.75, ease: "power3.inOut" },
      0
    );

    overlayVideoRef.current?.play().catch(() => {});

    function handleResize() {
      if (!overlayBoxRef.current) return;
      const retarget = computeOverlayTarget(overlayProject);
      gsap.set(overlayBoxRef.current, retarget);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [overlayProject, computeOverlayTarget, reducedMotion]);

  // Único caminho de clique pros 3 projetos — IMESUL, SYNTRA e LOOKOUT
  // usam exatamente o mesmo overlay; o único diferencial entre eles é a
  // proporção calculada em computeOverlayTarget.
  const toggleExpand = useCallback(() => {
    if (overlayProject) {
      closeOverlay();
      return;
    }
    openOverlay(PROJECTS[activeIndexRef.current]);
  }, [overlayProject, openOverlay, closeOverlay]);

  useEffect(() => {
    if (!overlayProject) return undefined;
    function handleKey(event) {
      if (event.key === "Escape") closeOverlay();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [overlayProject, closeOverlay]);

  return (
    <>
      <section
        id="work"
        ref={stageRef}
        style={{ "--signal": PROJECTS[0].accent }}
        className="relative flex min-h-svh items-center overflow-hidden bg-ink py-20"
      >
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
              data-cursor-label={overlayProject ? "fechar" : "expandir"}
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
                    aria-label={`${activeProject.title} — prévia`}
                  />
                </div>
              </div>
            </div>
          </div>

          <ProjectMetadata
            project={activeProject}
            index={activeIndex}
            count={PROJECTS.length}
            titleRef={titleRef}
            onToggleExpand={toggleExpand}
            expanded={!!overlayProject}
          />
        </div>
      </section>

      {overlayProject &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[200]" aria-hidden="false">
            <div ref={backdropRef} className="absolute inset-0 bg-black opacity-0" onClick={closeOverlay} />
            <div
              ref={overlayBoxRef}
              className="fixed overflow-hidden bg-black"
              style={{
                borderRadius: DEVICE_PRESENTATION_IDS.has(overlayProject.id) ? "1.9rem" : "0.375rem",
                boxShadow: `0 0 0 1px ${overlayProject.accent}26, 0 0 22px 0 ${overlayProject.accent}26, 0 24px 60px -24px rgba(0,0,0,0.65)`,
              }}
            >
              <video
                ref={overlayVideoRef}
                className={`absolute inset-0 h-full w-full ${
                  DEVICE_PRESENTATION_IDS.has(overlayProject.id) ? "object-contain" : "object-cover"
                }`}
                src={overlayProject.media.src}
                poster={overlayProject.media.poster}
                muted
                loop
                playsInline
                autoPlay
                aria-label={`${overlayProject.title} — visualização ampliada`}
              />
            </div>
            <button
              type="button"
              onClick={closeOverlay}
              data-cursor="label"
              data-cursor-label="fechar"
              className="font-mono-label text-label fixed right-6 top-6 z-[210] rounded-full border border-paper/30 bg-ink/70 px-3 py-1.5 text-paper backdrop-blur"
            >
              fechar ×
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
