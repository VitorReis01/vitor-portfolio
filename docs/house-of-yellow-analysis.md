# House of Yellow (houseofyellow.nl) — Análise técnica/visual de referência

> Documento de estudo produzido por desconstrução direta do site (DOM, CSS computado, requests de rede, comportamento de scroll/hover em desktop e mobile). Não contém e não deve ser usado para copiar marca, textos, fotografia, vídeo, código-fonte ou assets proprietários da House of Yellow (HOY). O objetivo é extrair **princípios de direção de arte, motion design e arquitetura de experiência** transportáveis para um portfólio pessoal com identidade própria.
>
> Convenção usada neste documento: **"observável"** = confirmado via DOM/CSS computado/network request real; **"provavelmente"** = alta confiança por padrão de mercado/evidência indireta; **"possivelmente"** = hipótese estética, sem evidência técnica direta.

---

## 0. Ficha técnica (observável)

- **CMS**: WordPress (tema custom `hoy`, cache via Autoptimize).
- **Transições de página**: [Swup](https://swup.js.org/) (`swup.min.js` + `SwupGaPlugin` + `SwupHeadPlugin`) — navegação SPA-like sem reload completo, com plugin de head-swap (troca `<title>`/meta) e plugin de GA (dispara pageview a cada transição virtual). O `<div id="pageContainer" class="pageContainer transition-fade">` é o alvo da transição.
- **Motion**: GSAP core + **ScrollTrigger** + **SplitText** + **MorphSVGPlugin** (plugins pagos do Club GreenSock — indica investimento real em motion, não só CSS).
- **Smooth scroll**: [Lenis](https://lenis.darkroom.engineering/) (`<html class="lenis lenis-smooth">`), com atributo `data-lenis-prevent` usado para excluir áreas (ex.: dentro de modais) do scroll virtual.
- **Touch/gestos**: Hammer.js (suporte a swipe em mobile, provavelmente para os carrosséis/grid de projetos).
- **Sem Three.js/WebGL/Canvas** — `canvas` count = 0 no DOM inspecionado. Toda a riqueza visual vem de vídeo, SVG e CSS/GSAP, não de 3D real-time.
- **SVG**: 121 elementos `<svg>` na home — usados para o logotipo (construído por path, não fonte), ícones e formas decorativas.
- **Fontes**: `Poppins-font, sans-serif` (self-hosted, nome de família customizado — não é o Google Fonts CDN direto).
- **Base tipográfica fluida**: `html { font-size: 9.6px }` em viewport 1280px, com `--vh` calculado via JS (correção do bug de `100vh` em mobile). Todo o type scale é construído em `rem` sobre essa base, ou seja, a tipografia inteira escala com a largura da viewport (fluid type system, não breakpoints fixos de `font-size`).
- **Cookies**: Complianz (GDPR banner), com Google Analytics 4 e Instagram Feed (Smash Balloon) carregando após consentimento.
- **Formulário de contato**: Contact Form 7.
- **Vídeo**: hospedado no **Vimeo** (`player.vimeo.com/progressive_redirect/...`), não self-hosted — CDN dedicado, múltiplas renditions (1080p/720p/540p) servidas condicionalmente por atributo (`data-src` vs `data-mobile-src`).
- **Imagens**: quase inexistentes como conteúdo. Em toda a home e nas páginas internas, `document.querySelectorAll('img').length` ficou em **0** nas páginas de conteúdo (Culture, How We Roll) — os únicos assets raster encontrados foram um poster/placeholder `.jpg` do hero e os logotipos de clientes, que são **SVG**, não raster. O site é, na prática, 100% vídeo como mídia de conteúdo.

---

## 1. Direção de arte

**Estilo geral**: agência de conteúdo cinematográfico (vídeo, fotografia, 3D) que vende velocidade + artesania. A direção de arte reforça isso com um vocabulário editorial/revista combinado a uma superfície quase inteiramente audiovisual — não é um site "de texto com fotos", é um site "de vídeo com legendas".

**Sensação transmitida**: premium, ágil, um pouco irreverente (a marcação numerada tipo caderno de produção — `[ 01 ]`, `[ 02 ]` — e os textos curtos e diretos: "Fast. Smart. With flavour.") em vez de corporativo-formal. O amarelo pastel (não um amarelo saturado/neon) suaviza o que poderia ser um dark-mode agressivo, dando um tom mais "estúdio criativo" do que "tech/SaaS".

**Composição**: grid editorial de duas colunas é o padrão dominante — uma coluna estreita à esquerda com um rótulo pequeno/numeração (`[ 00 ]`, "Who are we?"), e uma coluna larga à direita com o conteúdo principal. Esse padrão se repete em quase toda seção (about, services, how-we-roll, culture), criando um ritmo de leitura consistente do tipo "legenda + corpo" em vez de títulos centralizados genéricos.

**Proporção texto/imagem**: extremamente inclinada para a mídia. Blocos de texto são curtos (2–4 linhas), sempre subordinados a um vídeo de fundo ou vizinho. Não há parágrafos longos — a marca comunica por frases de efeito + prova social (contadores, views, clientes) mais do que por explicação.

**Grids, assimetria e respiros**: o grid de projetos ("Made by Yellow") não é uniforme — cards de tamanhos/proporções variadas quebram a grade perfeita, criando ritmo assimétrico intencional. Seções alternam entre full-bleed (vídeo ocupando 100% da viewport) e conteúdo contido em colunas, então o "respiro" vem da alternância de densidade, não de whitespace generoso constante — é um site denso em estímulo, mas organizado por seções muito bem demarcadas por cor de fundo.

**Sobreposições e fullscreen**: o hero é fullscreen de vídeo com o logotipo centralizado sobreposto; o `grainBackground` (textura de ruído/grão) é sobreposto a blocos escuros para dar acabamento "filme", não "tela plana".

**Ritmo visual**: alternância de blocos de cor de fundo (ver seção 3) funciona como pontuação — cada seção nova é sinalizada primeiro pela mudança de cor, só depois pelo conteúdo. Isso cria "capítulos" visuais claros ao rolar a página, reforçado pela numeração editorial (`[ 01 ]`, `[ 02 ]`...) que aparece em quase todas as páginas internas.

---

## 2. Tipografia

- **Família única**: Poppins (self-hosted), geometric sans, para tudo — títulos, corpo, botões, marquees. Não há uma segunda família serif ou display para contraste; a hierarquia vem de peso/tamanho/tracking, não de mistura de fontes.
- **Hierarquia observável** (classes reais encontradas no DOM): `smallTitle`, `normalTitle` (com modificador `.smaller`), `colTitle`, `tag textTitle`. Isso indica um **type scale nomeado por papel** (small/normal + variantes), não por tag HTML solta — bom padrão para copiar estruturalmente (ex.: `.text-display`, `.text-heading`, `.text-label` em vez de estilizar `h1`/`h2` direto).
- **Nada de "título gigante" no hero**: diferente do que se poderia supor por referências do gênero (grandes headlines tipográficas fullscreen), a HOY resolve o impacto do hero com o **logotipo vetorial animado**, não com tipografia grande. O texto do hero ("Welcome! We're a creative content agency...") é modesto em escala. Isso é um dado importante: a "assinatura" do site não é tipográfica, é de motion + vídeo.
- **Animação de texto por caractere**: confirmado via `data-letters` + estrutura DOM gerada — cada título relevante é quebrado em `<span class="row"><span class="char">T</span>...</span>`, com classes de estado `split-applied` → `active`. Isso é a assinatura de **GSAP SplitText**: o texto é fisicamente dividido em spans de caractere (ou palavra, dependendo da seção) para permitir animação de entrada individual (stagger). O atributo `data-fast="true"` em alguns títulos sugere um preset de velocidade de stagger diferenciado por contexto.
- **Textos verticais/rotacionados**: não observados na home; o padrão dominante é horizontal. O que se aproxima de "texto não convencional" são os **marquees infinitos** (ticker horizontal contínuo) usados como elemento gráfico-tipográfico (ex.: "CONNECT CONNECT CONNECT..." atravessando a tela), muito mais do que texto vertical.
- **Uso editorial da tipografia**: a numeração de seção (`[ 00 ]`, `[ 01 ]`...) funciona como elemento tipográfico próprio — um "índice" que acompanha o scroll e dá ao site uma sensação de "capítulo de revista/making-of", reforçado nas páginas Culture e How We Roll com sub-numeração (`[ 01-1 ]`, `[ 01-2 ]`, `[ 01-3 ]`).
- **Peso e tracking**: pesos leves/regulares dominam o corpo (400), títulos em 500 — nada de peso 700+/black observado nos elementos inspecionados. Não há `text-transform: uppercase` sistemático nos títulos de conteúdo (mas os labels de navegação/marquee — "CONNECT", "PLAY", "TAKE A LOOK" — são caixa-alta), então maiúsculas são reservadas para elementos de **interface/ação**, minúsculas/normal para **narrativa**.

---

## 3. Paleta e contraste

Paleta extraída via `getComputedStyle` real, seção a seção (valores exatos, não estimados):

| Token conceitual | Valor RGB | Hex aproximado | Uso |
|---|---|---|---|
| `--yellow` (assinatura) | `rgb(242, 239, 163)` | `#F2EFA3` | texto sobre fundo escuro/transparente, fundo de seções "leves" |
| `--ink` (escuro) | `rgb(29, 29, 27)` | `#1D1D1B` | fundo de seções "pesadas", texto sobre amarelo |
| `--paper` (claro neutro) | `rgb(238, 238, 238)` | `#EEEEEE` | texto de corpo sobre fundo escuro |

**Observação importante**: o "amarelo" da marca **não é um amarelo saturado/neon** — é um amarelo pastel/esverdeado, quase um "amarelo-manteiga" dessaturado. Isso é uma escolha deliberada: um amarelo puro (#FFEB00 por ex.) seria agressivo em áreas grandes de texto/fundo; o tom pastel permite usá-lo como cor dominante sem cansar.

**Ritmo de contraste por seção** (ordem real da home, medido):
1. Hero — fundo transparente/vídeo, texto amarelo sobre o vídeo (baixo-contraste proposital, o vídeo é o protagonista).
2. About/"Who are we" — fundo **amarelo sólido**, texto escuro (inversão total — a seção mais "gráfica" da home, sem vídeo).
3. Services — fundo **escuro sólido**, texto claro (a seção mais longa, 3797px de altura).
4. Video intro / Video (contador) — fundo transparente, texto amarelo.
5. How We Roll intro/items — fundo transparente, texto claro.
6. Culture quote (fechamento) — fundo **escuro sólido**, texto amarelo — volta ao contraste de abertura, fechando o ciclo cromático.

Ou seja, a página não usa uma paleta "decorativa espalhada" — ela usa **blocos de cor sólida por seção completa** como marcador estrutural, alternando dark → yellow → dark, e o texto sempre inverte para manter contraste máximo (nunca amarelo sobre amarelo, nunca escuro sobre escuro). Isso é replicável como regra de sistema: **3 combinações de tema fixas (dark/light-yellow/dark-alt), aplicadas a nível de seção inteira, nunca misturadas dentro de uma mesma seção**.

**Cursor reage à cor de fundo**: a classe `setDarkCursor` (e seu par `removeDarkCursor` visto em outras páginas) confirma que o **cursor customizado muda de cor conforme a seção** — provavelmente cursor escuro sobre fundo claro (seção amarela) e cursor claro sobre fundo escuro, mantendo sempre visibilidade.

---

## 4. Hero

**Estrutura (observável via HTML real)**:
```
section.headerBigBlock[data-openvideo][data-openvideo-mobile]
 └─ .innerAnimContainer
     ├─ .background.playerBackground (poster JPG de fallback)
     │   └─ video.playVideoOnScroll.initVideoOnScroll[data-src][data-mobile-src]
     └─ .centerContent.logoLoaded.yellow
         └─ .innerContent > .rotateContainer > .animContainer[data-anim="h-1|h-2|y-1|y-2|o"]
             └─ <svg><path>...</path></svg>  (um path por "perna" das letras H-O-Y)
```

- **Mídia**: vídeo full-bleed em loop, mudo, `playsinline`, com **poster JPG** carregado primeiro (LCP rápido) e o vídeo real só é buscado quando a seção entra em viewport (`initVideoOnScroll` + `data-scroll-inview` — nenhuma request ao Vimeo foi disparada até a seção estar visível, confirmado via inspeção de rede).
- **Posicionamento do texto**: o "texto" do hero não é grande — é o **logotipo construído em SVG puro**, montado letra por letra (5 grupos de path: `h-1`, `h-2`, `y-1`, `y-2`, `o`), cada um dentro do próprio `.animContainer` com um `data-anim` individual. Isso permite animar cada perna de cada letra de forma independente e escalonada (stagger), com potencial de morph (o site carrega `MorphSVGPlugin`).
- **Entrada inicial**: classes de estado (`loaded`, `logoLoaded`) indicam que a entrada é **gateada** — nada anima até os assets estarem prontos, evitando "pulos" de layout/FOUC. É um padrão de **preloader lógico sem tela de loading dedicada visível no DOM inicial** (ou o preloader é puramente CSS/opacity, não uma seção separada).
- **Comportamento com scroll**: o header (`<header class="light hideLogo active">`) muda de estado assim que a página sai do topo — a classe `hideLogo` sugere que um logotipo secundário (provavelmente no canto, na barra de navegação) fica oculto enquanto o hero central ainda domina, e reaparece depois. O vídeo de fundo em si, pelo `transform` inspecionado, **não** sofre parallax de translação perceptível no desktop nesse ponto do scroll — o efeito principal do hero é temporal (o vídeo tocando), não espacial.
- **Duração visual / interação**: o hero convida a duas ações — rolar (ticker inferior "PLAY / VIDEO" com um vídeo de preview embutido no próprio rodapé do hero, aparentemente uma segunda faixa de vídeo compacta) e abrir o showreel completo em lightbox (`data-openvideo`, com renditions 1080p/720p separadas por dispositivo).

---

## 5. Scroll experience

Mapeamento por evidência de DOM/CSS (não suposição):

- **Pinned/sticky sections confirmadas**: dois padrões distintos coexistem no site —
  1. **`.scrollContainer > .stickyWrapper`** dentro de `.videoBlock` (seção dos contadores "Countries / Followers / Impressions / Engagements" + mockup de vídeo mobile) — um contêiner alto que "segura" um wrapper interno fixo enquanto se rola por ele. Neste caso o pin aparentava ser controlado via GSAP ScrollTrigger (posição `static` fora da janela ativa, não CSS puro), coerente com uma seção que também precisa **scrubar** (sincronizar) a progressão dos números com a posição de scroll — comportamento típico de `ScrollTrigger.create({ pin: true, scrub: true })`.
  2. O mesmo padrão `.scrollContainer/.stickyWrapper` se repete em `howWeRollItemsBlock`, mas aqui resolvido com **CSS `position: sticky` nativo** (`top: 0`), altura de contêiner de 2520px — uma pin mais simples, provavelmente para segurar um título ou índice enquanto os itens passam ao lado/abaixo.
  - Conclusão: a HOY **não usa um único mecanismo de pin para tudo** — usa CSS sticky nativo quando o efeito é simples (mais barato, sem JS), e GSAP ScrollTrigger pin quando precisa sincronizar múltiplos elementos com scrub (contador numérico + vídeo).
- **Reveal on scroll**: o atributo `data-scroll-inview`, presente em dezenas de elementos (seções inteiras, `.grainBackground`, blocos de título), é quase certamente o gatilho de um **IntersectionObserver custom** que adiciona uma classe (`active`/`loaded`) quando o elemento entra na viewport, disparando as transições CSS/GSAP de opacidade e transform já mapeadas no CSS (`opacity 0.6s ease-out`, `opacity 0.9s ease-out 0.3s`, etc. — múltiplos delays escalonados confirmam **stagger de entrada** entre elementos irmãos).
- **Scrubbing (progresso atrelado 1:1 ao scroll)**: observável na seção de contadores — os números (Countries 0→9, Followers +0→+21.000 etc.) e o vídeo do mockup mobile estão dentro do mesmo `stickyWrapper`, o que é o padrão clássico para "vídeo/contador avança exatamente na velocidade em que você rola", não em timer.
- **Parallax**: atributos `data-scroll-speed`, `data-scroll-position`, `data-position-factor` existem no HTML (confirmado na lista de `data-*` global) — indicam elementos com velocidade de scroll diferente do restante da página (parallax clássico), embora o elemento específico não tenha sido isolado nesta sessão de inspeção.
- **Clip-path / máscaras**: **nenhum `clip-path` ativo foi encontrado em repouso** via `getComputedStyle` na home. Isso não exclui uso durante transições (GSAP costuma aplicar `clip-path` só durante a animação, via inline style, e remover depois) — classificado como **possivelmente** usado em transições de imagem/vídeo entre seções, não confirmado em estado estático.
- **Horizontal scroll**: não identificado na home; o grid de projetos em "Made by Yellow" é vertical com filtros, não um carrossel horizontal pinado.
- **Marquees como elemento de progressão**: os tickers infinitos (`data-marquee-direction`, `data-marquee-speed`, `data-marquee-scroll-speed`) rodam em velocidade própria (ex.: 90 vs 45 vs 30) **e** parecem ganhar velocidade extra vinculada ao scroll (`data-marquee-scroll-speed` sugere um multiplicador aplicado durante o scroll ativo — padrão comum: o marquee acelera quando o usuário rola rápido, efeito "physics/momentum").
- **Vídeo controlado por scroll**: confirmado — classes `playVideoOnScroll` / `initVideoOnScroll` em todos os 13 `<video>` da home. O vídeo só carrega (`data-src` → `src`) e só dá `play()` quando entra em viewport; ao sair, presumivelmente pausa (não confirmado diretamente, mas coerente com o padrão e essencial para performance com 13 vídeos na mesma página).
- **Progressão narrativa**: cada página interna usa numeração de seção (`[ 01 ]`...`[ 08 ]` em Culture, fases `[01-1]`...`[03-3]` em How We Roll) como um "índice" fixo que acompanha visualmente o scroll — dá ao usuário uma noção de progresso dentro da narrativa, similar a capítulos.

---

## 6. Motion design — o que é de qual tecnologia

| Efeito observado | Tecnologia | Confiança |
|---|---|---|
| Scroll suave com inércia (todo o site) | Lenis | **observável** (classe `lenis-smooth` no `<html>`, biblioteca carregada) |
| Pin de seções + sincronização scroll→contador/vídeo | GSAP ScrollTrigger | **observável** (biblioteca carregada + padrão `scrollContainer/stickyWrapper` com pin ativo/inativo consistente com o comportamento da lib) |
| Animação de texto letra a letra | GSAP SplitText | **observável** (biblioteca carregada + markup `<span class="char">` gerado dinamicamente, exatamente a saída padrão do SplitText) |
| Construção/entrada do logotipo SVG (H-O-Y por partes) | GSAP + SVG (possivelmente MorphSVGPlugin) | **provavelmente** GSAP puro para timing/stagger; **possivelmente** MorphSVGPlugin para transformar formas (a lib está carregada, mas não se observou um morph em execução nesta sessão) |
| Reveal de blocos ao entrar na viewport | IntersectionObserver custom + GSAP/CSS transitions | **provavelmente** (padrão `data-scroll-inview` + classes de estado + transições CSS com delays escalonados) |
| Marquee infinito (Connect/Play/Video/Culture) | Solução custom (CSS animation `linear infinite` ou GSAP `xPercent` loop), com Hammer.js para swipe manual | **provavelmente** — atributo `data-marquee-swipe` sugere integração com Hammer.js para arrastar o marquee manualmente no touch |
| Animação de "flutuação"/partículas (`dwarrelAnimatie`, achado nas regras CSS) | `@keyframes` CSS puro, `linear infinite`, durações aleatórias 4.2s–8s | **observável** (regra de animação nomeada existe no CSS, "dwarrelen" = holandês para "esvoaçar/flutuar" — sugere elementos decorativos soltos, tipo confete/partículas de marca) |
| Vídeo como parte do layout (13 vídeos na home) | `<video>` HTML5 nativo, lazy via IntersectionObserver, hospedado no Vimeo | **observável** |
| Custom cursor com troca de cor por seção | JS custom (div `.customCursor` seguindo o mouse) + classes `setDarkCursor`/`removeDarkCursor` no `<body>`/seção | **observável** |
| Transição entre páginas (fade) | Swup + classe `transition-fade` | **observável** |
| Hover de botão com texto "passando" (marquee no hover) | GSAP ou CSS transform em `.innerLabel`/`.marquees` dentro do botão | **observável na estrutura DOM**, comportamento de hover em si **não testável** nesta sessão (sem simulação de mouse real) |
| Canvas/WebGL/Three.js | — | **descartado** — 0 elementos `<canvas>` encontrados em qualquer página inspecionada |

---

## 7. Imagens e vídeos

- O site é **vídeo-first ao ponto de quase eliminar imagens estáticas de conteúdo**. Em Culture (8 vídeos, 0 imgs) e How We Roll (10 vídeos, 0 imgs), cada bloco de texto tem um vídeo de fundo/acompanhamento em vez de foto.
- **Proporções/crops**: os vídeos de fundo usam contêineres `.background`/`.playerBackground` com `background-image` (poster) + `<video>` absoluto — padrão de "cover" total do contêiner (crop automático para preencher, sem letterboxing).
- **Fullscreen vs. contido**: hero e blocos de transição (`videoIntroBlock`, `howWeRollDividerAnimationBlock`) usam vídeo fullscreen; dentro do grid de projetos e da seção de equipe (Culture), o vídeo é contido em cards/colunas, não fullscreen — a mesma linguagem de mídia se adapta à densidade do layout.
- **Autoplay controlado**: nunca autoplay imediato de todos os vídeos ao carregar a página (isso destruiria performance com 13 vídeos) — autoplay é **condicional à visibilidade** (scroll-into-view), sempre mudo (requisito técnico de autoplay em navegadores) e sempre loop.
- **Renditions por dispositivo**: cada vídeo carrega uma URL diferente para mobile (`data-mobile-src`, resolução menor) vs. desktop (`data-src`), e o showreel do hero tem uma terceira via só para o lightbox (`data-openvideo` 1080p / `data-openvideo-mobile` 720p) — ou seja, **3 perfis de qualidade coexistem por vídeo principal** dependendo do contexto de exibição.
- **Como mídia e tipografia trabalham juntas**: o texto nunca "compete" com o vídeo por contraste — ou o texto fica em uma faixa de cor sólida separada do vídeo (ex.: seção "Who are we" em fundo amarelo puro, sem vídeo), ou o vídeo ocupa 100% e o texto é mínimo/centralizado sobre ele (hero). Não há o padrão "texto grande sobre vídeo com overlay escuro parcial" tão comum em outros sites de agência — a HOY prefere **separar** claramente "seção de vídeo" e "seção de texto sólido", alternando entre elas.
- **Logos de clientes**: 29 SVGs de marca carregados de uma vez (provavelmente para um marquee/wall de logos "trusted by"), leves e vetoriais — sem fotografia de "equipe no escritório" ou fotos de stock, reforçando a estética 100% produção própria.

---

## 8. Microinterações

- **Cursor customizado** (`.customCursor`, div própria seguindo o ponteiro) que troca de aparência conforme a seção (`setDarkCursor` / `removeDarkCursor`), e presumivelmente ganha um label contextual perto de elementos clicáveis (padrão comum quando esse tipo de estrutura existe — os elementos de vídeo têm `data-title` vazio no hero mas presente como atributo, sugerindo que outros vídeos usam esse atributo para popular o texto do cursor, ex. "PLAY").
- **Botões com micro-troca de label**: o botão "Connect" tem uma estrutura de dois estados — `.fixedLabel` (texto estático "Connect") e `.innerLabel > .marquees > .marqueeWrapper > .marquee` (um segundo texto em marquee, escondido até o hover). Isso é uma assinatura de interação: o hover não só muda cor, ele **revela um segundo texto correndo**, dando uma sensação mais "viva" que um simples `:hover { color }`.
- **Cards de projeto com metadata revelada**: no grid "Made by Yellow", cada card mostra por padrão categoria + "TAKE A LOOK"; no hover (inferido pela duplicação de conteúdo no DOM — título aparece duas vezes, uma delas provavelmente a versão "hover state" cross-fade) revela **Views** e **Delivery time** — transformando o card em um mini case study sem precisar clicar.
- **WhatsApp button flutuante** (`.stickyWhatsappButton`) que ganha a classe `active` só depois que o usuário rola a página — não polui o hero.
- **Header reativo ao scroll**: troca de estado (`light`/`hideLogo`/`active`) documentado, adaptando contraste/visibilidade da navegação conforme a seção de fundo por trás dela muda de cor — o header "sabe" em que seção está.
- **Botão Play/Pause do vídeo mestre**: ticker duplo "PAUSE/PLAY" no rodapé do site sugere um controle global de mute/play para os vídeos de fundo, dando ao usuário controle explícito sobre a experiência autoplay (bom para acessibilidade e para quem prefere não ter vídeo constantemente rodando).
- **Relógio mundial ao vivo** (página Connect): três fusos horários (Eindhoven/Dubai/Miami) atualizando em tempo real — um detalhe pequeno, mas que comunica "agência com alcance internacional" via um widget funcional, não um texto.
- **Filtros de portfólio + toggle Grid/List**: interação de utilidade real (não é só estética) — categorias clicáveis, "RESET FILTERS", alternância de densidade de visualização.

---

## 9. Transições entre seções

O mecanismo dominante para "entregar" uma seção à próxima **não é um efeito de transição isolado**, é a combinação de três coisas que sempre agem juntas:

1. **Corte de cor de fundo em bloco cheio** — cada seção nova começa com uma mudança de `background-color` no elemento de seção inteiro (nunca gradientes longos entre seções; o corte é limpo). O olho percebe a mudança de seção pela cor antes mesmo de ler o novo título.
2. **Reveal com stagger no conteúdo que entra** (`data-scroll-inview` → `active`, com `opacity`/`transform` escalonados por delay, e headlines entrando char-a-char via SplitText) — a transição *dentro* da seção nova é sempre uma entrada suave, nunca um corte abrupto de conteúdo.
3. **Marquee/rótulo de transição como "costura"** — várias seções são separadas por uma faixa de marquee de largura total (ex. "CULTURE CULTURE CULTURE...", "MADE BY YELLOW MADE BY YELLOW...") que funciona como um separador tipográfico animado, preenchendo o que em outros sites seria uma borda ou divisor estático.

Não há evidência de "morph" de forma entre seções (um elemento de uma seção literalmente se transformando no elemento da próxima) nesta sessão — o sistema é mais **"corte de cor + reveal escalonado"** do que **"morphing contínuo"**.

---

## 10. Responsividade — como adaptar sem "encolher o desktop"

Evidência real do mobile (375×812, testado): o hero não usa 100dvh cheio (fica em ~632px, deixando espaço visível para o marquee inferior e indicando composição pensada especificamente para a proporção do celular, não um reflow automático do desktop), e cada vídeo carrega uma **URL de renditions diferente para mobile** — ou seja, a adaptação já começa na camada de dados, não só de CSS.

Princípios a levar para o portfólio pessoal:

- **Repensar a hierarquia, não só o tamanho.** No desktop a HOY usa grid de 2 colunas (label + conteúdo) lado a lado; em mobile isso precisa empilhar, e quando empilha, o "label numerado" (`[ 00 ]`) deve continuar tendo peso visual próprio, não virar uma legendinha esquecida acima do título.
- **Vídeo de fundo tem que ter um plano B leve em mobile.** Trocar renditions (like a HOY faz) ou, em conexões lentas/`prefers-reduced-data`, cair para o poster estático + play manual — nunca forçar autoplay de vídeo pesado em 4G.
- **Marquees continuam funcionando em mobile, mas viram gesto.** O atributo `data-marquee-swipe` sugere que a HOY permite arrastar o marquee manualmente no touch — em vez de só decorar, o marquee em mobile pode virar um carrossel arrastável de fato.
- **Pin/scrub em mobile é arriscado.** Seções pinadas com scrub complexo (o bloco de contadores) tendem a ter jank em celulares mais fracos e a brigar com a barra de endereço dinâmica do Safari. Recomendação: simplificar para reveal simples (sem pin) abaixo de um breakpoint, ou usar `ScrollTrigger.matchMedia()` para desabilitar pin em mobile mantendo o reveal.
- **Cursor customizado não existe em touch.** Precisa de fallback explícito (o próprio código deveria checar `matchMedia('(hover: hover) and (pointer: fine)')` antes de instanciar o cursor custom) — não é "esconder com CSS", é não inicializar a lógica.
- **Header com estados dinâmicos precisa de affordance de menu clara em mobile** — a HOY mantém a navegation list completa no DOM mesmo em mobile (confirmado), então o padrão é provavelmente um menu overlay fullscreen ao toque no burger, não um dropdown pequeno.
- **Densidade de vídeo simultâneo deve cair drasticamente em mobile.** 13 vídeos lazy-loaded na home é seguro em desktop com boa banda; em mobile, o ideal é limitar quantos vídeos podem estar "ativos" (decodificando) ao mesmo tempo, mesmo que todos estejam no DOM.

---

## 11. Performance

**Efeitos potencialmente pesados identificados:**
- 13 `<video>` simultâneos na home (mesmo lazy, o decode de múltiplos vídeos ativos em paralelo é custoso em CPU/GPU mobile).
- SplitText aplicado a headlines longas gera **muitos nós DOM** (um `<span>` por caractere) — ótimo visualmente, mas caro em reflow se disparado tarde ou em excesso de elementos simultâneos.
- ScrollTrigger com `scrub: true` re-executa cálculo a cada frame de scroll — múltiplas instâncias de scrub na mesma página exigem atenção a `will-change`/composição em GPU para não gerar jank.
- Marquees infinitos com `requestAnimationFrame`/CSS animation rodando o tempo todo, mesmo fora da viewport, se não forem pausados quando não visíveis.

**Abordagens recomendadas para o site pessoal (informadas pelo que a própria HOY já faz bem, mais melhorias):**
- **Vídeo**: hospedar em CDN de vídeo dedicado (Vimeo/Mux/Cloudflare Stream/Bunny), nunca self-host de arquivos grandes; `preload="metadata"`; múltiplas renditions por breakpoint (o padrão `data-src`/`data-mobile-src` da HOY é replicável 1:1); `IntersectionObserver` para play/pause real (pausar ao sair da viewport, não só não iniciar).
- **Imagens**: diferente da HOY (que usa JPG simples pro poster), usar **AVIF com fallback WebP** para os posters de vídeo e qualquer imagem estática — é uma melhoria fácil sobre a referência.
- **Preload seletivo**: `preload`/`fetchpriority="high"` só no vídeo/poster do hero (LCP); todo o resto estritamente lazy.
- **`prefers-reduced-motion`**: desabilitar SplitText/stagger/parallax/marquee-scroll-speed e trocar por fades simples ou nenhuma animação — a HOY não expôs evidência de tratar isso (não testado diretamente, mas nenhuma media query de redução foi encontrada nas regras inspecionadas); no portfólio pessoal isso deve ser tratado desde o design, não como adendo.
- **`requestAnimationFrame`/GPU**: animar `transform`/`opacity` (compositor), nunca `top`/`left`/`width` para os elementos com scrub; usar `will-change` com moderação (só nos elementos ativamente animando, removido depois).
- **Mobile**: limitar contagem de vídeos ativos simultâneos (ex.: máx. 2–3 decodificando ao mesmo tempo, os demais pausados até entrarem em viewport), `ScrollTrigger.matchMedia()` para desligar pin/scrub pesado abaixo de um breakpoint, e considerar `content-visibility: auto` em seções abaixo da dobra para reduzir custo de layout inicial.
- **Fontes**: self-host (como a HOY já faz) + `font-display: swap` + subsetting se o alfabeto for só latino.

---

## 12. Arquitetura da experiência — linha do tempo da home

| # | Momento | Conteúdo | Layout | Movimento | Interação | Entrada | Saída |
|---|---|---|---|---|---|---|---|
| 00 | Loading/gate | Nenhuma tela de loading dedicada visível; gate via classes `loaded`/`logoLoaded` | — | Fade-in geral quando assets prontos | — | Opacity 0→1 | Corte direto para 01 |
| 01 | Hero | Vídeo showreel em loop + logotipo HOY em SVG (5 grupos de path animados) + texto curto de boas-vindas | Fullscreen, texto centralizado sobre vídeo | Entrada escalonada das partes do logo; vídeo com fade de poster→vídeo real | Scroll para avançar; clique no bloco "Play/Video" abre showreel completo em lightbox | Vídeo poster carrega imediato, vídeo real só ao entrar em viewport | Header muda de estado (`hideLogo`→visível), corte de cor para bloco amarelo |
| 02 | About / "Who are we" | Label pequeno + headline SplitText ("Trusted by industry leaders...") + wall de 29 logos de clientes | Fundo amarelo sólido, 2 colunas | Headline entra char-a-char; `grainBackground` revela textura | Cursor muda para "dark" nesta seção (`setDarkCursor`) | Reveal via `data-scroll-inview` | Corte para fundo escuro (Services) |
| 03 | Services | 3 pilares de serviço (vídeo/foto/animação), cada um provavelmente com vídeo de apoio | Fundo escuro, seção mais longa (3797px) | Reveals sucessivos por pilar | — | Stagger por bloco | Transição para bloco de vídeo/contadores |
| 04 | Beyond the Screen / contadores | Mockup de "mobile content" + 4 métricas animadas (Countries, Followers, Impressions, Engagements) | `.scrollContainer/.stickyWrapper` pinado, 4 colunas | Números e vídeo avançam **sincronizados ao scroll** (scrub) | Usuário controla a velocidade da contagem rolando | Pin ativa ao entrar, números partem de 0 | Unpin ao final do contêiner alto (784px) |
| 05 | How We Roll (preview) | Intro curta + 3 pilares (Video/Photography/Animation) | Fundo escuro, texto claro | Reveal em stagger | — | — | Transição para bloco de citação |
| 06 | Culture quote (fechamento) | Citação/CTA final + "Let's connect" | Fundo escuro, texto amarelo (fecha o ciclo cromático aberto no hero) | Reveal de citação, provavelmente com ênfase tipográfica maior que o resto da página | CTA "Connect" com hover de marquee-label | — | Fim da home → footer |
| 07 | Footer | Endereço, contato, sitemap, redes sociais, "Join the movement" | Grid utilitário simples | Nenhuma animação notável | Links padrão | — | — |

---

## 13. Design system conceitual extraído

> Valores abaixo são **derivados por padrão observado**, não uma cópia 1:1 dos números exatos da HOY — servem como ponto de partida estrutural para o novo projeto, com paleta e proporções próprias a definir.

- **Grid**: 2 colunas assimétricas como unidade base de seção (coluna estreita de "label/index" + coluna larga de conteúdo), colapsando para 1 coluna empilhada em mobile, label sempre antes do conteúdo.
- **Spacing**: sistema de seções em blocos de cor cheios — o espaçamento vertical relevante é **entre seções** (altura da seção inteira), não padding interno pequeno; dentro da seção, o texto fica compacto e a "respiração" vem do vídeo/mídia ao redor.
- **Border radius**: pequeno e consistente em elementos de interface (botão "Connect" observado com `border-radius: 24px`, ou seja, formato pill/cápsula) — nada de cantos totalmente quadrados nos CTAs, mas também nada de cards muito arredondados tipo "app mobile".
- **Typography scale**: base fluida em `rem` sobre `html { font-size }` proporcional à viewport (não breakpoints fixos de `font-size` em cada elemento) — abordagem recomendada para o novo site: `clamp()` nativo em CSS moderno em vez do truque de `font-size` no `html`, atingindo o mesmo resultado (fluid type) com menos gambiarra de JS.
  - Papéis de escala a definir (nomeados por função, não por tag): `display` (hero/logo — pode ser substituído por elemento gráfico, como a HOY faz), `heading` (`normalTitle`-like), `subheading` (`smallTitle`-like), `label`/`eyebrow` (numeração de seção, categorias), `body`, `button/nav`.
- **Headline scale vs. body scale**: proporção observada entre `normalTitle` (36.8px) e `smallTitle` (19.2px) é quase exatamente **1.9x** — um salto de escala perceptível mas não extremo (não é um sistema de "títulos gigantescos" tipo 120px+; é mais contido, compensado pelo motion e pelo vídeo para gerar impacto).
- **Buttons**: pill-shaped, texto duplo (label fixo + marquee revelado no hover), transições curtas e específicas por propriedade (`background 0.3s, color 0.3s, box-shadow 0.3s, padding 0.3s` — cada propriedade com sua própria transição declarada, não um `transition: all`).
- **Links/nav**: caixa-alta reservada a elementos de ação/navegação (marquees, botões), texto normal-case reservado a conteúdo narrativo.
- **Section spacing/rhythm**: alternância obrigatória de "tema" (fundo escuro / fundo de destaque / fundo escuro) a cada 2–4 seções, nunca duas seções consecutivas com o mesmo fundo sólido sem uma seção "neutra"/vídeo entre elas.
- **Media ratios**: full-bleed (100vw/100vh) para momentos de impacto (hero, transições), contido em grid de cards para o portfólio de trabalhos — sem proporção fixa única (16:9) forçada em todo lugar; os cards de projeto variam de proporção entre si.
- **Motion timing (valores CSS reais capturados)**:
  - Micro-transições de UI: `0.3s ease-out` (cor, borda, transform de botões/links).
  - Reveals de conteúdo: `0.6s`–`0.9s ease-out`, frequentemente com delay adicional de `0.15s`–`0.45s` para criar stagger entre elementos irmãos.
  - Loops decorativos (`dwarrelAnimatie`): `linear`, `4.2s`–`8s`, `infinite` — durações propositalmente **não-uniformes** entre instâncias (evita sincronismo robótico de elementos repetidos).
  - Nenhum `cubic-bezier` custom foi capturado nas regras inspecionadas — a maior parte usa `ease`/`ease-out`/`linear` nativos do CSS, não easings customizados via GSAP `ease` strings complexas (ao menos nas transições CSS; as animações GSAP em si podem usar easings próprios não visíveis via CSSOM).
- **Hover philosophy**: nunca só cor — sempre um segundo elemento de conteúdo entra (marquee de texto, reveal de metadata) além da mudança cromática. Hover comunica **informação nova**, não só feedback de estado.

---

## Referências técnicas usadas nesta análise

Todas as evidências vieram de inspeção ao vivo em 2026 de `houseofyellow.nl` e suas páginas internas (`/made-by-yellow/`, `/culture/`, `/how-we-roll/`, `/connect/`): scripts carregados (`window.gsap`, `window.Lenis`, etc.), atributos `data-*` no DOM renderizado, `getComputedStyle` de elementos reais, `document.styleSheets` para regras de transição/animação, requisições de rede (`wp-content/uploads`, ausência de requests a `vimeo` antes do scroll), e testes de viewport mobile (375×812) via emulação de dispositivo.
