"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AboutStage from "./AboutStage";

// Fase 5 — integração. Substitui PolarityTransition (quadrado/plano
// branco crescendo, depois cross-fade pro About) por uma transição de
// polaridade INVERTIDA em relação à já aprovada AboutToContactTransition
// — mesma matemática de limiar por célula (bordas acendem primeiro,
// centro por último, ruído pra clusters orgânicos), mas em vez de pintar
// uma cor plana sobre uma superfície neutra, as células são uma MÁSCARA
// SVG (`mask-image`) aplicada diretamente sobre o AboutStage real —
// cada célula que "acende" revela o pixel de verdade (foto, texto) que
// já está por trás dela, não uma cor sólida. Não existe eco: é
// literalmente o `AboutStage` aprovado, sem nenhuma linha alterada nele,
// só mascarado de fora.
//
// Por que máscara SVG em vez de canvas (como a irmã About→Contact usa):
// aqui o objetivo é revelar CONTEÚDO REAL (DOM vivo — foto via
// next/image, texto), não pintar uma cor. `mask-image` sobre um wrapper
// que contém o DOM real faz exatamente isso; um canvas só pintaria uma
// cor por cima, escondendo o conteúdo em vez de recortá-lo.
//
// Geometria: o wrapper pinado tem altura NATURAL (a altura real do
// About, que passa de 1 viewport com folga em qualquer breakpoint — já
// medido: ~1.7x a altura da viewport mesmo no grid desktop). Por isso o
// pin dura só uma distância limitada (não a altura inteira do About) —
// quando solta, a MÁSCARA JÁ ESTÁ 100% aberta (todas as células
// reveladas), então o resto do About (abaixo da primeira viewport)
// simplesmente aparece em scroll normal, sem nenhuma seção extra de
// máscara ali. Mesma técnica geométrica que PolarityTransition já usava
// (pin mais curto que o conteúdo, libera pro fluxo normal) — só a forma
// de revelar muda.
//
// Correção de zona morta (auditoria pós-integração): o HowIBuildStage é
// `min-h-svh` com conteúdo centralizado por flex — quando o pin dele
// solta, a própria caixa (ink, sem nada visível abaixo do conteúdo
// centralizado) ainda rola em fluxo normal por sua altura natural antes
// deste wrapper começar. Isso lia como um "buraco preto" entre ENTREGAR
// e as primeiras partículas. Não dá pra editar HowIBuildStage.jsx (fora
// de escopo), então a correção é medir, em runtime, o respiro vazio real
// abaixo do conteúdo dele (`#how-i-build`, via id estável — mesmo padrão
// já usado por TransitionLayer pra alcançar `#hero` de fora) e puxar
// este wrapper pra cima via `margin-top` negativo exatamente nessa
// medida — nunca mais que isso, com teto de segurança em 40% da altura
// da seção, então mesmo se a medição sair errada (ex.: fonte ainda
// carregando) nunca alcança o conteúdo real (ENTREGAR/linha de
// fechamento).
export default function HowIBuildToAboutTransition({ reducedMotion }) {
  const wrapRef = useRef(null);
  const maskedRef = useRef(null);
  const maskRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const headlineRef = useRef(null);
  const bodyRef = useRef(null);
  const mediaRef = useRef(null);
  const cellsRef = useRef([]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    gsap.registerPlugin(ScrollTrigger);

    // O conteúdo em si (headline/body/media) não tem entrada própria —
    // a máscara É a entrada. Assenta uma vez no estado final e nunca
    // mais toca: uma segunda animação de opacidade/posição por cima de
    // uma máscara que já revela regiões diferentes em momentos
    // diferentes só competiria/vazaria (texto "deslizando" enquanto
    // metade dele ainda está mascarada).
    gsap.set(headlineRef.current, { opacity: 1, y: 0 });
    gsap.set(bodyRef.current, { opacity: 1, y: 0 });
    gsap.set(mediaRef.current, { clipPath: "inset(0% 0% 0% 0%)" });

    if (reducedMotion) {
      if (maskedRef.current) {
        maskedRef.current.style.maskImage = "none";
        maskedRef.current.style.webkitMaskImage = "none";
      }
      return undefined;
    }

    function closeTrailingGap() {
      const howIBuildEl = document.getElementById("how-i-build");
      if (!howIBuildEl || !wrapRef.current) return;
      const sectionRect = howIBuildEl.getBoundingClientRect();
      // TechMeteorField e a linha de progresso são `absolute inset-0` —
      // não contam pro fluxo normal. StepHeadline é o único filho em
      // fluxo normal, então é ele quem define onde o conteúdo visível
      // (ENTREGAR + linha de fechamento) realmente termina.
      const content = howIBuildEl.lastElementChild;
      const contentRect = content ? content.getBoundingClientRect() : sectionRect;
      const trailingGap = sectionRect.bottom - contentRect.bottom;
      const pullUp = Math.max(0, Math.min(trailingGap, sectionRect.height * 0.4));
      gsap.set(wrapRef.current, { marginTop: pullUp > 0 ? -pullUp : 0 });
    }

    const ctx = gsap.context(() => {
      closeTrailingGap();

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const cols = isDesktop ? 20 : 14;

      // Linhas calculadas a partir da proporção real do wrapper — mantém
      // as células perto de quadradas em vez de esticadas (About é bem
      // mais alto que largo, sobretudo no mobile empilhado).
      const rect = maskedRef.current.getBoundingClientRect();
      const aspect = (rect.height || 1) / (rect.width || 1);
      const rows = Math.max(8, Math.round(cols * aspect));

      const svgNS = "http://www.w3.org/2000/svg";
      const cells = [];
      const cx = (cols - 1) / 2;
      const cy = (rows - 1) / 2;
      const maxDist = Math.hypot(cx, cy) || 1;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const el = document.createElementNS(svgNS, "rect");
          const dist = Math.hypot(col - cx, row - cy) / maxDist; // 0 centro, 1 borda
          const noise = ((col * 13 + row * 29) % 17) / 17;
          // limiar baixo perto da borda (revela cedo), alto no centro
          // (revela por último) — mesma curva da About→Contact, só que
          // aqui "revelar" é mostrar o About de verdade, não pintar.
          const threshold = (1 - dist) * 0.55 + noise * 0.45;
          el.setAttribute("x", String(col / cols));
          el.setAttribute("y", String(row / rows));
          el.setAttribute("width", String(1 / cols + 0.0015));
          el.setAttribute("height", String(1 / rows + 0.0015));
          el.setAttribute("fill", "white");
          el.setAttribute("opacity", "0");
          maskRef.current.appendChild(el);
          cells.push({ el, threshold });
        }
      }
      cellsRef.current = cells;

      // 130vh desktop / 100vh mobile — pin mais curto que a altura real
      // do About de propósito (ver comentário no topo do arquivo).
      const distance = Math.round(window.innerHeight * (isDesktop ? 1.3 : 1.0));

      const st = ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: `+=${distance}`,
        pin: true,
        scrub: 0.4,
        onUpdate: (self) => {
          const p = self.progress;

          // 0–2%    hold quase instantâneo — só o suficiente pra não
          //         começar a acender no exact frame em que o pin trava
          //         (evita um "pop" na primeira célula). Não é mais um
          //         respiro escuro perceptível.
          // 2–70%   células off-white revelam o About real, bordas
          //         primeiro, centro por último.
          // 70–100% platô — totalmente revelado, tempo de leitura antes
          //         do pin soltar (About continua em scroll normal daí
          //         em diante, já 100% aberto).
          const fillT = gsap.utils.clamp(0, 1, (p - 0.02) / (0.7 - 0.02));
          cellsRef.current.forEach((cell) => {
            cell.el.setAttribute("opacity", fillT >= cell.threshold ? "1" : "0");
          });
        },
      });

      function handleResize() {
        closeTrailingGap();
        ScrollTrigger.refresh();
      }
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        st.kill();
        cellsRef.current.forEach((cell) => cell.el.remove());
        cellsRef.current = [];
      };
    }, wrapRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="relative bg-ink">
      <div
        ref={maskedRef}
        style={{ maskImage: "url(#hb-about-reveal-mask)", WebkitMaskImage: "url(#hb-about-reveal-mask)" }}
      >
        <AboutStage ref={aboutSectionRef} headlineRef={headlineRef} bodyRef={bodyRef} mediaRef={mediaRef} />
      </div>

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <mask id="hb-about-reveal-mask" ref={maskRef} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1" />
        </defs>
      </svg>
    </div>
  );
}
