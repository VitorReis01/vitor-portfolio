# Vitor — Portfólio pessoal — Direção criativa

> Documento de direção criativa. Nenhuma linha de código de página foi escrita a partir daqui — este arquivo define conceito, sistema visual, motion e storyboard para aprovação antes da implementação.
>
> Referência de qualidade/experiência: [`docs/house-of-yellow-analysis.md`](house-of-yellow-analysis.md) (House of Yellow) — usada como **parâmetro de nível** (ritmo, ousadia, tipografia, movimento, storytelling, interação), nunca como fonte a copiar. Nenhuma cor, fonte, texto, layout completo, asset ou trecho de código da HOY é reutilizado aqui.
>
> Fontes de conteúdo real usadas: (1) arquitetura, segurança e monitoramento já validados no projeto `imesul-vendas`; (2) os números de performance fornecidos diretamente pelo usuário nesta conversa; (3) o perfil público do Instagram **[@vitor.systems](https://www.instagram.com/vitor.systems/)** (bio, nome de exibição, e as legendas completas dos 2 posts públicos visíveis sem login, extraídas do JSON público da página em 2026). Nenhum dado de formação, cargo, cliente, certificação ou número foi inventado — o que não está confirmado está listado explicitamente na seção 19 (Conteúdo faltante).

---

## 1. Conceito central

**"Sistema, não superfície."**

Vitor não se apresenta como alguém que desenha telas bonitas — ele se apresenta como alguém que constrói o **sistema inteiro** por trás da tela: da ideia à interface, da interface ao servidor, do servidor à segurança e ao monitoramento que garantem que aquilo continue de pé depois do lançamento. É exatamente a linguagem que ele já usa para se descrever publicamente (bio do Instagram: *"Dev Full Stack | Systems Builder — Construindo sistemas reais (web & mobile) — Performance • Segurança • Escala"*) — o site não inventa um posicionamento novo, **traduz editorialmente o que ele já é** em uma experiência digital à altura disso.

O portfólio em si deve ser a prova do conceito: uma peça de design que também é uma peça de engenharia — motion cuidado, mas com Core Web Vitals saudáveis; interações ricas, mas com fallback de acessibilidade; uma experiência autoral, mas construída com disciplina de produto.

## 2. Posicionamento

Não "Desenvolvedor Front-end". Não "Full Stack Developer" genérico de currículo.

**Vitor é um construtor de sistemas digitais completos** — a pessoa que consegue tirar uma ideia do papel e entregá-la funcionando: pensando a estratégia, desenhando a experiência, construindo o front-end e o back-end, protegendo os dados, medindo o resultado e mantendo tudo no ar. Design, desenvolvimento, automação, IA aplicada e marketing digital não são "extras" na bio — são parte do mesmo processo de construção de produto, e o site precisa comunicar isso como um fluxo único, não como uma lista de disciplinas separadas.

A camada de IA no processo é tratada como **ferramenta de engenharia avançada usada com critério** (prototipagem, debugging assistido, geração de conceitos, automação de workflow) — nunca como atalho ou terceirização do pensamento. O site deve deixar claro que a direção e a validação de tudo que é produzido — com ou sem IA no processo — são de Vitor.

## 3. Personalidade visual

| É | Não é |
|---|---|
| Editorial, com respiro e hierarquia clara | Denso feito dashboard de SaaS |
| Técnico como material (grid, mono, dados reais) | Técnico como clichê (ícones de circuito, neon "hacker") |
| Escuro, contido, cinematográfico | Escuro só por estética "dark mode moderno" |
| Um acento de cor usado com intenção e raridade | Paleta multicolor decorativa |
| Motion que **revela informação** | Motion que só decora |
| Silêncio entre seções (espaço negativo real) | Scroll infinito de blocos idênticos |
| Tipografia grande porque **é** a peça central | Tipografia grande porque é tendência |

A palavra-guia é **precisão** — visual e tecnicamente. Cada escolha (uma cor, uma animação, um número exibido) deve parecer calculada, não decorativa.

## 4. Paleta sugerida

Deliberadamente **oposta** à paleta da referência (amarelo pastel + preto quente da HOY) e sem nenhuma relação com a identidade do case (Imesul). Sistema de 4 tokens principais + 1 utilitário raro:

| Token | Valor sugerido | Papel |
|---|---|---|
| `--ink` | `#0A0B0D` (quase-preto neutro, levemente azulado) | Fundo dominante — a maior parte do site vive aqui |
| `--paper` | `#F3F1EA` (off-white quente, não branco puro) | Fundo de seções "invertidas" (Manifesto ou Case), texto sobre `--ink` |
| `--graphite` | `#8B8D93` | Texto secundário, labels, linhas divisórias, estados inativos |
| `--signal` | `#FF5A2E` (laranja-sinal, quente, saturado mas não neon) | **Único acento de cor do site** — CTA primário, cursor/hover, destaques de dado, indicadores "ao vivo" |
| `--terminal` (utilitário raro) | `#43FF9C` (verde-terminal contido) | Só em contexto literal de sistema/monitoramento (status "online", pontos de saúde no case Digital Commerce Platform) — nunca decorativo |

Regras de uso (para não virar "gradiente aleatório" nem "SaaS genérico"):
- Nunca mais de **uma** cor de acento visível por composição de tela.
- `--signal` não é usado em blocos grandes de fundo — só em elementos pequenos e específicos (traço, ponto, número, CTA, cursor). É sinal, não papel de parede.
- `--terminal` só aparece dentro do Case Principal e da seção Technology, sempre associado a um dado real (status, uptime, health check) — nunca como "cor bonita".
- Gradientes: no máximo um gradiente sutil de luz (não de matiz) por seção — ex. um leve *vignette* radial escurecendo os cantos de um vídeo — nunca gradiente arco-íris/roxo-azul genérico de landing page de SaaS.
- Sem glassmorphism como estilo padrão. Blur/transparência só quando houver uma razão funcional (ex. barra de navegação fixa sobre conteúdo em movimento), nunca em cards.

## 5. Tipografia sugerida

Diferente da referência (que resolve o hero com uma marca vetorial e mantém a tipografia relativamente contida), aqui a **tipografia grande é o elemento de impacto principal do hero**, porque não existe (ainda) uma marca gráfica própria para Vitor — então o sistema tipográfico carrega mais peso autoral do que carregou na HOY.

**Par tipográfico proposto** (2 famílias, papéis bem distintos — evita o "tudo-Poppins" da referência e evita também a armadilha de fontes batidas de SaaS tipo Inter/Manrope/Space Grotesk puro):

- **Display/editorial** — uma grotesca de caráter técnico-mecânico para headlines gigantes (candidatas: *PP Neue Machina*, *Founders Grotesk*, *Aeonik*, *Neue Montreal* — licenciamento a confirmar; fallback de sistema: `"Helvetica Neue", Arial, sans-serif` com `font-weight` alto).
- **Mono técnica** — para labels, numeração de seção, tags, dados/estatísticas, eyebrow text (candidatas: *JetBrains Mono*, *IBM Plex Mono*, *Fragment Mono*; fallback: `ui-monospace, "SF Mono", Consolas, monospace`). Essa é a peça que dá o tom "sistema/engenharia" ao layout — cumpre o papel que na HOY é cumprido pela numeração editorial (`[ 01 ]`), mas aqui reforçado por ser uma família tipográfica literalmente técnica.
- **Corpo** — uma grotesca neutra de leitura confortável em bloco de texto (candidatas: *General Sans*, *Inter* apenas para corpo — nunca para display —, ou a própria família de display em peso regular se tiver boa legibilidade em texto corrido).

**Escala fluida**: `clamp()` nativo de CSS (não o truque de `font-size` no `<html>` observado na referência), com pelo menos 3 "papéis" nomeados por função, não por tag HTML: `--fs-display` (hero/headlines de seção), `--fs-heading` (subtítulos), `--fs-label` (mono, uppercase, tracking largo), `--fs-body`.

Regras de uso:
- Caixa-alta + tracking largo reservada à camada mono/label (numeração, tags, navegação) — nunca em texto corrido.
- Headlines em caixa normal (sentence case), nunca uppercase — reforça o tom editorial/humano contra o tom "corporativo gritado".
- Peso: display em peso alto (600–700) só nas headlines centrais; peso regular/médio no resto — evitar "tudo em negrito".

## 6. Grid

- **Desktop**: 12 colunas, margem lateral única (`--gutter`) consistente em todas as seções, coluna de "label" (mono, 2–3 colunas) + coluna de conteúdo (9–10 colunas) como padrão herdado — como *princípio estrutural*, não como cópia literal — da referência, usado nas seções Manifesto, Case e Capabilities.
- **Mobile**: 4 colunas, label sempre acima do conteúdo (nunca lado a lado forçado).
- **Unidade vertical**: seções cheias de viewport (`100svh`/`100dvh`, nunca `100vh` puro — evita o bug de barra de endereço mobile) como unidade-base de composição para Intro, Hero e transições de Case; seções de conteúdo mais denso (Selected Work, Capabilities, Technology) podem exceder 1 viewport de altura livremente.
- **Ritmo de espaço negativo**: cada seção principal é precedida/sucedida por uma faixa de respiro mínima fixa (`--section-gap`) — nunca duas seções "coladas" sem transição perceptível, mesmo quando o fundo não muda de cor.

## 7. Arquitetura da homepage (visão geral)

```
00  INTRO / LOADER        — boot sequence curto, sem spinner
01  HERO                  — VITOR + headline editorial, fullscreen
02  MANIFESTO              — ideia → estratégia → design → dev → produto
03  SELECTED WORK          — projetos em blocos cinematográficos (vertical)
04  CASE PRINCIPAL         — Digital Commerce Platform (multi-bloco)
05  CAPABILITIES           — índice editorial de competências
06  TECHNOLOGY             — mapa interativo de tecnologias
07  ABOUT VITOR             — trajetória + humano
08  CONTACT                 — CTA final, Instagram, contato
```

(Renumerado aqui de 00–08 por conveniência técnica; no brief original as seções são 01–09 — mantido o mesmo conteúdo e ordem, apenas ajustando o índice para incluir o loader como "00".)

Fluxo de leitura: **prova de capacidade → prova de método → prova de resultado → prova de amplitude → prova humana → ação**. Cada seção existe para responder a uma pergunta do visitante nessa ordem (quem é / como pensa / o que já fez de mais denso / o que mais sabe fazer / com quem eu estou falando / como eu falo com ele).

---

## 8. Storyboard completo

### 00 — Intro / Loader

- **Aparência inicial**: tela cheia `--ink`, sem nenhum elemento de UI padrão (sem logo girando, sem barra de progresso genérica, sem spinner). Centro da tela: uma única linha mono, pequena, tipo terminal.
- **Composição**: elemento central único, verticalmente e horizontalmente centralizado; um traço horizontal fino abaixo do texto, largura 0.
- **Headline**: nenhuma headline — é pré-hero. Texto mono utilitário, ex. `inicializando composição visual` (trocando 2–3 vezes por uma palavra/estado diferente, tipo log de boot), terminando em algo como `pronto.`
- **Conteúdo**: contador percentual mono (`00 → 100`) alinhado ao mesmo baseline do texto, discreto, não é o protagonista.
- **Mídia**: nenhuma (propositalmente — o loader não deve competir com o hero em peso visual).
- **Animação de entrada**: fade-in do texto em ≤150ms; o traço horizontal cresce da esquerda para a direita em sincronia com o contador (0→100%) usando `--signal` como cor do traço — a única cor viva na tela inteira nesse momento, plantando o acento antes de qualquer outra coisa.
- **Comportamento durante o "scroll"**: não há scroll disponível durante o loader — scroll é bloqueado (lock) até o loader concluir, para preservar a coreografia.
- **Interação com o mouse**: nenhuma interação esperada; loader é não-interativo por design (evita cliques acidentais que quebrem a coreografia).
- **Animação de saída**: ao concluir, o traço horizontal se expande verticalmente para virar uma "cortina" que sobe (clip-path/`inset()` de baixo para cima) revelando o Hero por trás — a Hero já está montada e pronta, não é carregada depois da cortina subir (evita flash/salto).
- **Transição para próxima seção**: contínua — no instante em que a cortina revela o topo da tela, o texto do Hero já começa seu próprio stagger de entrada, sem espera morta entre as duas.
- **Mobile**: idêntico em conceito; duração total do loader reduzida (dispositivos móveis costumam ter conexões mais lentas — o loader real deve durar o tempo real de preparo dos assets críticos, com um teto máximo curto, nunca artificialmente esticado para "parecer bonito").
- **Regra de exceção**: loader roda **uma vez por sessão** (sessionStorage) — em navegações internas ou retorno à home na mesma sessão, pula direto para o Hero já montado. Com `prefers-reduced-motion`, pula para o Hero instantaneamente, sem qualquer animação de boot.

---

### 01 — Hero

- **Aparência inicial**: fundo `--ink` (ou vídeo/textura muito sutil por trás, ver "mídia"), tipografia display gigante ocupando a maior parte da largura útil.
- **Composição**: `VITOR` como wordmark tipográfico gigante (não é logo vetorial — é a própria fonte display em peso alto), alinhado à esquerda seguindo a margem do grid (não centralizado — centralizar tende a "achatar" o impacto editorial). Abaixo/ao lado, uma headline conceitual de uma linha (ver seção 13) e um label mono pequeno funcionando como assinatura de posicionamento (ex. `SYSTEMS BUILDER — DESIGN / DEV / PRODUTO`).
- **Headline**: ver opções na seção 13 (Textos provisórios) — uma frase editorial curta, autoral, sem clichê.
- **Conteúdo**: wordmark + headline + label de posicionamento + um indicador de scroll minimalista (não uma seta genérica — ex. um traço vertical curto com o mesmo tratamento do traço do loader, com `--signal` pulsando sutilmente no topo, como um "cursor piscando").
- **Mídia**: camada de fundo quase imperceptível — uma textura/linha técnica (ex. um traçado tipo diagrama de sistema, linhas finas em `--graphite` a ~4–6% de opacidade) posicionada atrás do texto, nunca competindo com ele. Sem vídeo de fundo full-bleed no MVP (diferente da HOY) — decisão deliberada: Vitor ainda não tem footage própria de "processo/estúdio" para sustentar esse tipo de abertura com autenticidade (ver seção 18, Assets a produzir, para a opção de evoluir isso depois).
- **Animação de entrada**: o wordmark `VITOR` entra por stagger de caractere (cada letra sobe com leve atraso, easing de entrada assinado, ver seção 10), a headline entra logo em seguida por palavra (não por letra — headline mais longa não deve ficar lenta), o label mono faz um fade+slide curto por último. A textura de fundo faz um fade-in lento e contínuo, começando já durante a cortina do loader.
- **Comportamento durante o scroll**: ao rolar, o wordmark `VITOR` sofre uma leve escala para baixo (ex. 100%→92%) e desloca-se para cima mais rápido que o resto do conteúdo (parallax leve, nunca mais que ~15% de diferença de velocidade) — dá sensação de profundidade sem ser um efeito "explosivo". A textura de fundo se move mais devagar que o texto (parallax inverso), reforçando profundidade em camadas.
- **Interação com o mouse**: o indicador de scroll reage a hover (o traço "acorda" e pulsa mais rápido). Nenhum cursor customizado inteiro nesta seção — reservar cursor customizado para onde ele **significa algo** (ver seção 11).
- **Animação de saída**: opacidade do wordmark cai a zero antes de sair totalmente da viewport (evita o texto gigante "cortado" feio no meio pela borda da tela); a headline permanece visível um pouco mais, criando uma leve defasagem de saída entre os elementos.
- **Transição para próxima seção**: corte de cor — o fundo já começa a transicionar para `--paper` (Manifesto é a seção "invertida") nos últimos ~20% do scroll da Hero, então quando o Manifesto começa, a inversão de contraste já está em andamento, não é um corte seco.
- **Mobile**: wordmark reduz de escala (ainda grande, mas sem quebrar em mais de 1 linha), headline permanece 2–3 linhas no máximo, label mono pode mover para baixo do wordmark. Parallax reduzido a quase zero (custo de performance/jank em scroll nativo mobile); textura de fundo pode ser removida em telas muito pequenas se pesar no LCP.

---

### 02 — Manifesto

- **Aparência inicial**: fundo `--paper`, texto `--ink` — a primeira e principal inversão de contraste do site (equivalente estrutural ao bloco amarelo da HOY, mas em linguagem própria).
- **Composição**: seção pinada (sticky/pin) de altura estendida — o scroll dentro da seção controla a progressão de 5 palavras-chave, não o avanço para a próxima seção.
- **Headline**: as 5 palavras da mentalidade de trabalho, uma de cada vez, em tipografia display grande: **ideia → estratégia → design → desenvolvimento → produto funcionando**.
- **Conteúdo**: cada palavra pode vir acompanhada de uma frase de apoio de no máximo 6–8 palavras (nunca um parágrafo) — ex. sob "produto funcionando": "não entregue até estar de pé." Um traço/linha fina conectando os pontos (literal "wireframe" de processo) se desenha progressivamente conforme o usuário rola, terminando completo só quando a 5ª palavra é alcançada.
- **Mídia**: nenhuma foto/vídeo — a seção é deliberadamente só tipografia + traço, para funcionar como "respiro" depois do impacto audiovisual do Hero e antes do peso visual do Selected Work.
- **Animação de entrada**: a seção "prende" o scroll (pin) assim que entra; a primeira palavra já está visível ao prender, sem delay.
- **Comportamento durante o scroll**: 100% scrub — a posição de scroll dentro da seção pinada controla diretamente qual palavra está em foco (opacidade alta) e quais estão esmaecidas (opacidade baixa, leve blur opcional), e quanto do traço de conexão já foi desenhado. É a aplicação mais literal do padrão "pin + scrub" mapeado na referência (contadores da HOY), aqui a serviço de uma ideia (processo), não de uma métrica.
- **Interação com o mouse**: nenhuma interação obrigatória — a seção é guiada por scroll. Opcionalmente, cada palavra pode reagir a hover com um leve destaque em `--signal` no traço correspondente (bônus, não essencial).
- **Animação de saída**: ao alcançar a 5ª palavra ("produto funcionando") com o traço completo, a seção libera o pin (unpin) e a transição para Selected Work começa.
- **Transição para próxima seção**: o traço de conexão final se transforma visualmente na primeira linha divisória do Selected Work (elemento que "atravessa" a costura entre as duas seções) — um link visual literal entre "isso é como eu penso" e "isso é o que isso já produziu".
- **Mobile**: a lógica de scrub é mantida (é leve — só opacidade/translate de texto, sem vídeo pesado), mas a altura total da seção pinada é reduzida para não exigir scroll excessivo em tela pequena; frases de apoio podem ser omitidas em telas muito estreitas, mantendo só as 5 palavras + traço.

---

### 03 — Selected Work

- **Aparência inicial**: volta ao fundo `--ink`. Primeiro projeto já visível ao entrar na seção, ocupando a maior parte da viewport.
- **Composição**: **pilha vertical de blocos full-bleed** (nunca grade de cards pequenos) — um projeto por "capítulo" de scroll, mídia grande (imagem estática de alta qualidade ou clipe curto em loop) com um bloco de metadado mínimo sobreposto (título do projeto, ano, 2–3 tags de stack/papel).
- **Headline**: o nome de cada projeto, tratado como headline própria (tipografia display média — menor que o Hero, maior que corpo de texto).
- **Conteúdo**: 2–4 projetos no MVP — o Digital Commerce Platform tem sua própria seção dedicada mais adiante (04), então aqui ele aparece de forma resumida/teaser, com CTA explícito "ver o case completo"; os demais projetos (o que houver disponível e apropriado — ver seção 19) aparecem no mesmo tratamento visual, sem hierarquia de "principal vs. secundário" na composição, só no aprofundamento posterior.
- **Mídia**: imagem estática cover de alta qualidade como padrão seguro (ver seção 18); clipe de vídeo curto em loop mudo como enriquecimento opcional projeto a projeto, nunca obrigatório — a seção precisa funcionar bem só com imagens tratadas.
- **Animação de entrada**: cada bloco de projeto entra com um **reveal de máscara** (clip-path inset de 100%→0%, direção vertical) revelando a mídia como se uma cortina subisse — não um simples fade, para dar peso cinematográfico —, sincronizado com o texto do metadado entrando por baixo com leve atraso.
- **Comportamento durante o scroll**: leve parallax da mídia em relação ao texto sobreposto (mídia se move um pouco mais devagar que o metadado, mesma lógica do Hero); a mídia pode sofrer uma escala sutil de 104%→100% enquanto a seção está em foco central da viewport (efeito "assentar", não "zoom dramático").
- **Interação com o mouse**: hover no bloco revela informação adicional (não só cor) — ex. um resumo de uma linha do desafio do projeto e as tags de stack aparecem/reforçam opacidade; em telas com ponteiro fino, o cursor customizado (ver seção 11) muda para um label pequeno tipo `ver projeto`.
- **Animação de saída**: mídia perde saturação/ganha leve escurecimento nos últimos instantes visíveis antes do próximo bloco cobrir, criando uma sensação de "página virando", não um corte seco.
- **Transição para próxima seção**: o último item da pilha (o teaser do Digital Commerce Platform) já é visualmente tratado como "portal" — ao ser clicado ou ao final do seu scroll, expande para ocupar a tela inteira e literalmente **se torna** o topo da seção 04 (continuidade de elemento, não troca abrupta de contexto).
- **Mobile**: pilha vertical mantida (já é o formato natural para mobile); parallax reduzido; o reveal de máscara simplificado para fade+slide vertical curto (clip-path complexo pode custar caro em GPUs móveis mais fracas); metadado sempre abaixo da mídia, nunca sobreposto em texto pequeno ilegível sobre imagem.

---

### 04 — Case Principal (Digital Commerce Platform)

- **Aparência inicial**: continuação direta do "portal" do Selected Work — abre em tela cheia com o nome do case e uma linha de contexto ("plataforma comercial digital para um distribuidor de materiais metálicos" — sem nome comercial em destaque, o foco é o desafio técnico, não a marca do cliente).
- **Composição**: multi-bloco narrativo, cada bloco com o mesmo padrão label(mono)+conteúdo do grid geral:
  1. **Problema** — o que precisava existir (site institucional + experiência comercial real para um catálogo grande e tecnicamente complexo, sem virar e-commerce tradicional).
  2. **Processo** — decisões de arquitetura de experiência: dois caminhos de entrada (**"Tenho um Projeto"** vs. **"Já Sei o Material"**), para atender tanto quem chega sem saber o que precisa quanto quem já sabe exatamente a especificação.
  3. **Arquitetura** — diagrama simplificado (não um diagrama de infraestrutura corporativo genérico) mostrando a relação entre catálogo (~42 produtos/subprodutos, ~297 combinações), motor de especificação, geração de orçamento e o hand-off para WhatsApp com roteamento de vendedor.
  4. **Interface** — capturas/telas reais do catálogo, do fluxo de especificação e da jornada de orçamento.
  5. **Performance** — os três números reais como peça visual central (ver abaixo).
  6. **Analytics & Segurança & Monitoramento** — tratado como texto editorial + poucos números reais (rate limiting, HMAC, painel administrativo, health checks), nunca como lista de ícones de feature.
  7. **Resultado** — fechamento em uma frase, sem métricas de negócio inventadas (views, clientes, faturamento) — só o que é tecnicamente verificável.
- **Headline**: `Digital Commerce Platform` (nome provisório, tratado como headline de abertura do case) + subheadline curta de contexto.
- **Conteúdo**: números reais fornecidos (usar exatamente como dados, nunca arredondar para "mais impressionante"):
  - **First Load JS**: ~345 KB → ~153 KB
  - **Assets públicos**: ~8,96 MB → ~4,81 MB
  - **Vídeos WebM**: ~2,74 MB → ~1,43 MB
- **Mídia**: telas reais do produto (catálogo, fluxo "Tenho um Projeto"/"Já Sei o Material", orçamento, painel admin) — nunca mockup genérico de dispositivo (evitar aquele "iPhone flutuante 3D" clichê de portfólio). Um diagrama vetorial simples e original para a arquitetura (não um print de ferramenta de diagramação genérica).
- **Animação de entrada**: bloco "Performance" é o ponto alto de motion do case — os números não aparecem estáticos: **barras/contadores fazem scrub 1:1 com o scroll**, indo do valor "antes" ao valor "depois" conforme o usuário rola por aquele bloco (aplicação direta e honesta do padrão de pin+scrub mapeado na referência, aqui usado para dados reais e verificáveis, não decorativo).
- **Comportamento durante o scroll**: o bloco "Arquitetura" pode ser pinado enquanto o diagrama se constrói progressivamente por partes (nó a nó) conforme o texto explicativo ao lado avança — reforça literalmente a metáfora de "sistema sendo construído".
- **Interação com o mouse**: no diagrama de arquitetura, hover em cada nó revela um tooltip textual curto (não um card decorado) explicando aquela parte do sistema. Nas capturas de tela, hover pode revelar um leve zoom/pan controlado (nunca lightbox genérico de galeria).
- **Animação de saída**: o bloco "Resultado" fecha com todo o conteúdo anterior recolhendo em opacidade, deixando só a frase de fechamento centralizada por um instante antes de liberar o scroll para a próxima seção — um "respiro" deliberado depois do bloco mais denso do site.
- **Transição para próxima seção**: fade/corte de cor simples para Capabilities — depois da densidade técnica do case, a transição deve ser a mais "calma" do site, sem efeito extra.
- **Mobile**: os blocos narrativos empilham 1 a 1 sem pin (pin complexo com diagrama construindo nó a nó é o principal candidato a ser **desligado** em mobile via `ScrollTrigger.matchMedia`, substituído por reveal simples em sequência); os números de performance mantêm a animação de contagem (é leve, só texto), mas sem scrub — dispara ao entrar em viewport uma única vez.

---

### 05 — Capabilities

- **Aparência inicial**: fundo `--ink`. Nada de grade de ícones — a seção abre como um **índice editorial**, tipo sumário de revista.
- **Composição**: lista vertical de 6 grupos, cada um como uma linha grande de largura total: `DESIGN` · `DEVELOPMENT` · `MOTION` · `SYSTEMS` · `AUTOMATION` · `AI`. Cada linha tem: numeração mono à esquerda (`01`–`06`), o nome do grupo em tipografia display média, e um espaço à direita reservado para o conteúdo expandido.
- **Headline**: os próprios 6 nomes de grupo funcionam como headlines da seção — sem um "título de seção" genérico tipo "Minhas Habilidades" acima deles.
- **Conteúdo por grupo** (exemplos de tags reais a popular — sem inventar o que não está na lista de habilidades fornecida):
  - `DESIGN`: interfaces, direção de arte digital, hierarquia visual, UI/UX, tratamento de assets para web.
  - `DEVELOPMENT`: Next.js, React, JavaScript, Tailwind CSS, arquitetura de componentes, APIs, rotas server-side, autenticação, banco de dados.
  - `MOTION`: GSAP, ScrollTrigger, Framer Motion, scroll-driven animation, transições cinematográficas, reduced-motion fallback.
  - `SYSTEMS`: catálogo/configurador, jornadas comerciais, analytics próprio, rate limiting, monitoramento, segurança.
  - `AUTOMATION`: fluxos de lead/WhatsApp, workflows assistidos por IA, automações de processo.
  - `AI`: engenharia de prompt, prototipagem acelerada, debugging assistido, geração de conceito/asset, direção e validação do resultado.
- **Mídia**: nenhuma imagem — a riqueza vem só de tipografia + espaço + motion de expansão.
- **Animação de entrada**: as 6 linhas entram em stagger vertical rápido (cada uma ~60–80ms depois da anterior), como uma lista sendo "digitada" na tela.
- **Comportamento durante o scroll**: nenhuma dependência de scrub — a seção não é pinada; o scroll simplesmente revela cada linha ao entrar em viewport.
- **Interação com o mouse**: **o coração da seção.** Hover (desktop) ou tap (mobile/touch) em uma linha expande aquele grupo — as tags entram por stagger curto à direita, e as outras 5 linhas recolhem levemente em opacidade (~40–50%), focando a atenção. Ao tirar o hover, recolhe de volta ao estado neutro. Isso substitui a "lista convencional com ícones" por uma peça interativa que se comporta como um índice que o visitante folheia.
- **Animação de saída**: ao sair da viewport, qualquer grupo expandido recolhe automaticamente (nunca deixar estado "aberto" grudado ao trocar de seção).
- **Transição para próxima seção**: corte direto — Technology já começa com sua própria abertura interativa, sem necessidade de efeito de costura elaborado (a mudança de "lista" para "mapa interativo" já é, por si, uma transição de linguagem perceptível).
- **Mobile**: hover vira tap; um grupo por vez expandido (accordion), com os demais recolhidos por padrão desde o início (diferente do desktop, onde todos começam visíveis e "iguais") — em telas pequenas, mostrar 6 blocos de tags todos abertos ao mesmo tempo seria denso demais.

---

### 06 — Technology

- **Aparência inicial**: fundo `--ink`, tela cheia dedicada a uma peça mais experimental — o momento "playground" do site.
- **Composição**: um **mapa/constelação leve** das tecnologias centrais (Next.js, React, GSAP, Tailwind, Postgres, APIs, Sentry, etc. — extraído das mesmas competências já listadas, sem introduzir tecnologias novas não mencionadas pelo usuário), desenhado como nós conectados por linhas finas, agrupados espacialmente por categoria (front-end / motion / dados / infraestrutura), sem legenda pesada — os nomes aparecem junto ao próprio nó.
- **Headline**: um label mono curto de abertura (ex. `como as peças se conectam`), sem um título display grande — aqui o protagonista é o próprio mapa, não a tipografia.
- **Conteúdo**: nós = nomes de tecnologia/competência; linhas = relações reais de uso (ex. GSAP conectado a "motion", Next.js conectado a "front-end" e a "infraestrutura/deploy"); um nó central maior pode representar "produto" ou "sistema", com todas as categorias convergindo nele — reforça visualmente o conceito central do documento (seção 1).
- **Mídia**: renderização em **Canvas 2D leve ou SVG animado** (nunca WebGL/Three.js — a própria referência analisada não usa 3D real-time, e para um mapa de poucos nós isso seria sobre-engenharia cara em performance sem ganho perceptível).
- **Animação de entrada**: os nós "nascem" no centro e se distribuem para suas posições finais com um leve *ease-out*, as linhas se desenham por último conectando os nós já posicionados.
- **Comportamento durante o scroll**: a composição pode ter uma leve deriva contínua (nós oscilando muito sutilmente, tipo "respiração", `requestAnimationFrame` em baixa amplitude) — mas só enquanto a seção está em viewport ativa; fora dela, a animação **pausa** (economia de CPU/bateria, ver seção 15).
- **Interação com o mouse**: nós próximos ao cursor se afastam suavemente (leve repulsão) ou se destacam em `--signal`; passar o mouse sobre um nó específico ilumina só as conexões daquele nó, esmaecendo o resto — permite ao visitante "explorar" a rede em vez de só olhar um gráfico estático. Em touch, o equivalente é tap-para-focar em um nó por vez.
- **Animação de saída**: a deriva contínua desacelera e para suavemente ao sair da viewport (nunca corte abrupto de uma animação em movimento).
- **Transição para próxima seção**: fade simples para About — depois de duas seções mais abstratas/técnicas (Capabilities, Technology), a entrada em About deve ser a mais "calma e humana" do site, sinalizada por uma composição muito mais simples logo em seguida.
- **Mobile**: repulsão por cursor não existe em touch — substituída por tap-para-focar; a densidade de nós pode ser reduzida (agrupar por categoria em vez de nó-por-tecnologia) para manter legibilidade em tela pequena; a deriva contínua deve ter amplitude ainda menor ou ser desligada com `prefers-reduced-motion`/dispositivos de baixa performance.

---

### 07 — About Vitor

- **Aparência inicial**: fundo `--paper` (segunda e última grande inversão de contraste do site, fechando o mesmo padrão rítmico usado no Manifesto) — sinaliza "isto é pessoal", diferente do `--ink` técnico do resto.
- **Composição**: assimétrica, mais próxima de uma página editorial de revista do que de um "card de perfil": bloco de texto em coluna estreita (não a largura total), com bastante espaço negativo ao redor.
- **Headline**: um label mono curto (`sobre`) + uma frase de abertura pessoal (não um "Olá, eu sou o Vitor" genérico).
- **Conteúdo**: parágrafo curto conectando a mentalidade de "systems builder" (linguagem já usada por ele mesmo publicamente) com o que o Digital Commerce Platform representa como prova prática, mais uma menção honesta a projetos autorais em desenvolvimento (mencionados publicamente por ele — ver seção 19 sobre o nível de detalhe apropriado para citar SYNTRA e LOOKOUT aqui) como evidência de iniciativa própria além do trabalho sob demanda. Sem tabela de currículo, sem lista de "hard skills/soft skills", sem timeline formal — texto corrido, humano, curto.
- **Mídia**: retrato de Vitor (asset a produzir/fornecer — ver seção 18) tratado com o mesmo rigor de direção de arte do resto do site (preto e branco ou baixa saturação, enquadramento editorial, nunca foto de banco de imagens ou selfie casual).
- **Animação de entrada**: fade+slide vertical curto do texto (sem stagger elaborado — esta seção é a mais "quieta" do site, o motion precisa refletir isso); o retrato entra com um reveal de máscara suave.
- **Comportamento durante o scroll**: parallax mínimo/nenhum — deliberadamente a seção "mais parada" da experiência, como contraponto de ritmo depois do mapa interativo da seção anterior.
- **Interação com o mouse**: nenhuma interação elaborada necessária; no máximo, um link inline para o Instagram com o mesmo tratamento de hover discreto usado nos links de todo o site.
- **Animação de saída**: fade simples.
- **Transição para próxima seção**: corte de cor de volta para `--ink` — o site "escurece" de novo para o fechamento em Contact, criando uma sensação de retorno ao tom inicial (fecha o ciclo cromático `ink → paper → ink → paper → ink`, análogo ao ciclo mapeado na referência, mas com paleta própria).
- **Mobile**: retrato acima do texto (empilhado), texto mantém coluna estreita mesmo em mobile via padding lateral generoso (evita texto "esticado" de margem a margem, que prejudica leitura).

---

### 08 — Contact

- **Aparência inicial**: fundo `--ink`, a seção mais minimalista do site inteiro — "pouquíssimos elementos" como pedido.
- **Composição**: centralizada verticalmente, uma única coluna de conteúdo.
- **Headline**: uma frase de fechamento forte e direta (curta, sem clichê tipo "vamos conversar!") + um CTA claro logo abaixo.
- **Conteúdo**: CTA principal (ex. abrir conversa/Instagram Direct — hoje o único canal público confirmado, ver seção 19), e uma lista mínima de contatos públicos disponíveis (Instagram como confirmado; outros canais só se/quando Vitor os fornecer).
- **Mídia**: nenhuma — última seção deliberadamente sem imagem/vídeo, para terminar em silêncio visual depois de um site denso em movimento.
- **Animação de entrada**: a headline entra por stagger de palavra (eco do Hero, fechando o ciclo de abertura/fechamento do site com a mesma assinatura de motion), o CTA entra logo depois com leve destaque em `--signal`.
- **Comportamento durante o scroll**: nenhum — é a última seção, sem necessidade de efeito adicional.
- **Interação com o mouse**: CTA principal com o hover mais "caprichado" do site (ver seção 11 — magnetic button), já que é o elemento de conversão mais importante da página inteira.
- **Animação de saída**: não aplicável (fim da página) — mas o footer/rodapé abaixo (ano, eventualmente um link de voltar ao topo) deve ter tratamento visual mínimo, mono, discreto.
- **Transição para próxima seção**: não há próxima seção.
- **Mobile**: CTA em largura confortável para toque (alvo mínimo de 44×44px), lista de contatos empilhada, mesma composição centralizada.

---

## 9. Comportamento do scroll (visão consolidada)

- **Smooth scroll** em toda a página (Lenis ou equivalente) para dar a mesma sensação de inércia contínua mapeada na referência — mas **sempre com fallback nativo** quando `prefers-reduced-motion` estiver ativo ou em dispositivos de baixa performance detectada.
- **Pin real (com scrub)** usado só em 2 pontos deliberados: Manifesto (5 palavras) e o bloco Performance do Case Principal (contadores) — nunca "porque dá para fazer", só onde scrub comunica algo que um reveal simples não comunicaria (progressão de processo; progressão de dado antes/depois).
- **Reveal simples (sem pin)** em todo o resto — Selected Work, Capabilities, Technology (entrada), About, Contact.
- **Nunca mais de uma seção pinada disputando o scroll ao mesmo tempo.**
- **Indicador de progresso opcional**: uma linha mono fina no canto (ex. `02 / 08`) acompanhando a seção ativa — eco discreto da numeração editorial da referência, sem replicar o visual dela.

## 10. Motion system

| Papel | Duração | Easing | Observação |
|---|---|---|---|
| Micro (hover, press, cursor) | 120–180ms | `cubic-bezier(0.65,0,0.35,1)` | Resposta imediata, nunca "molenga" |
| Reveal padrão (texto, blocos) | 500–650ms | `cubic-bezier(0.16,1,0.3,1)` | "Expo-out" — chega rápido, desacelera suave no fim |
| Cinematográfico (hero, transições de seção, loader→hero) | 900–1400ms | `cubic-bezier(0.16,1,0.3,1)` | Mesma família de easing do reveal padrão, só mais longa — consistência de "assinatura" de movimento em toda a experiência |
| Scrub (pin) | ligado 1:1 à posição de scroll | linear (sem easing próprio — o "easing" é a curva de leitura do usuário) | Manifesto e Performance apenas |
| Ambient/loop (deriva do mapa Technology) | contínuo, baixa amplitude | linear | Pausado fora de viewport |

**Entrada de texto**: stagger por palavra como padrão geral (headline, CTAs); stagger por caractere reservado só ao wordmark `VITOR` no Hero e ao fechamento do Contact — usar com moderação, não em todo título do site (custo de nós DOM e de "cansaço" visual se repetido demais, lição direta tirada da análise da referência).

**Saída de texto**: opacidade sempre chega a 0 antes do elemento cruzar a borda da viewport (nunca cortar texto/animação no meio pela borda da tela).

**Imagens/vídeo — reveal por máscara**: `clip-path: inset()` de 100%→0%, direção vertical no Hero/Selected Work, horizontal nas capturas de tela do Case — nunca formas de máscara "criativas" (blobs, círculos) — mantém o tom minimalista.

**Parallax**: só em camadas de fundo/decorativas e na relação mídia↔texto do Selected Work — nunca em texto principal isolado, nunca em CTAs, nunca em mais de ~15% de diferença de velocidade (evita sensação de "quebra-cabeça se movendo") — respeita explicitamente o pedido de "não anime tudo".

**Hover**: filosofia herdada como **princípio** (não como implementação) da análise da referência — hover deve revelar informação nova sempre que fizer sentido (Selected Work, Capabilities), não só mudar cor. Um único "magnetic button" (o cursor puxa levemente o botão em sua direção dentro de um raio pequeno) reservado ao CTA de Contact — usado uma única vez no site inteiro para não virar tique repetitivo.

**Page transitions**: o MVP é uma página única (scroll contínuo, sem rotas internas) — não há transição de página a desenhar agora. Caso o portfólio evolua para incluir uma página de case dedicada (`/work/digital-commerce-platform`) ou um arquivo de projetos, reservar aqui o mesmo padrão de fade contido (nunca um "wipe" chamativo) para manter consistência com o resto do motion system — a decidir apenas se/quando essa expansão for aprovada.

**`prefers-reduced-motion`** (regra global, não por seção): desliga parallax, scrub de pin (Manifesto e Performance passam a reveal simples ao entrar em viewport, sem prender o scroll), deriva contínua do mapa Technology, e reduz toda animação de entrada a fade simples ≤200ms. O loader pula direto para o Hero. Nenhuma informação pode depender exclusivamente de uma animação para ser compreendida (ex. os números de performance também precisam aparecer legíveis mesmo sem a contagem animada).

## 11. Microinterações

- **Cursor customizado contextual**: por padrão, cursor nativo. Só vira elemento customizado (um ponto pequeno em `--signal`) sobre elementos que têm ação real — Selected Work (label `ver projeto`), nós do mapa Technology, CTA de Contact. Nunca ativo sobre texto corrido comum — diferente da referência, que troca o cursor em seções inteiras; aqui a troca é **por elemento**, mais precisa e menos "chamativa por toda a página".
- **Botões**: transições declaradas por propriedade (não `transition: all`), no espírito do que foi observado na referência — cor, fundo e borda cada um com sua própria curva.
- **Links de navegação/rodapé**: sublinhado que se desenha da esquerda para a direita no hover (`transform: scaleX`), não sublinhado que só aparece/desaparece.
- **Indicador "ao vivo"** (usado só no Case Principal, no bloco de monitoramento): um ponto pequeno em `--terminal` com pulso sutil — literal, não decorativo, associado a um texto real (ex. referência a health checks existentes no projeto).
- **Feedback de formulário de contato** (se houver formulário, ver seção 17): estado de envio com o mesmo traço mono de progresso do loader — reforça a assinatura visual do início ao fim da experiência.

## 12. Mídia necessária

| Seção | Mídia | Prioridade |
|---|---|---|
| Hero | Textura/linha técnica de fundo (SVG/CSS, gerável sem fotografia) | Alta — bloqueia o Hero |
| Selected Work | Imagens cover de cada projeto (tratadas, alta qualidade); clipes curtos opcionais | Alta — bloqueia a seção |
| Case Principal | Capturas reais do produto (catálogo, fluxos, admin); diagrama vetorial original de arquitetura | Alta — é o case central |
| About | Retrato de Vitor, tratado (P&B ou baixa saturação) | Alta — bloqueia a seção |
| Technology | Nenhuma (gerado em Canvas/SVG) | — |
| Capabilities/Manifesto/Contact | Nenhuma (só tipografia/motion) | — |

## 13. Textos provisórios

**Hero — headline principal (opção recomendada)**:
> "Eu não construo telas. Eu construo os sistemas que sustentam essas telas."

**Alternativas para escolha/teste**:
1. "Ideia é o ponto de partida. Sistema é o que continua de pé."
2. "Entre a ideia e o produto no ar, existe um sistema — é isso que eu construo."

**Label de posicionamento (Hero, mono)**:
> `SYSTEMS BUILDER — DESIGN / DESENVOLVIMENTO / PRODUTO`

**Manifesto**:
> ideia → estratégia → design → desenvolvimento → produto funcionando
> (apoio sob a última palavra) "não entregue até estar de pé."

**Case Principal — abertura**:
> "Digital Commerce Platform" — uma experiência comercial completa para um catálogo real, complexo e cheio de especificação técnica — sem virar um e-commerce genérico.

**Contact — headline de fechamento (opção recomendada)**:
> "Se a ideia já existe, falta o sistema. Vamos construir."

Todos os textos acima são **provisórios** — devem ser validados/ajustados por Vitor antes da implementação, especialmente os que tocam em posicionamento pessoal.

## 14. Estratégia mobile

- Vídeo/parallax/pin complexos são os primeiros a serem simplificados abaixo do breakpoint definido (`ScrollTrigger.matchMedia`), nunca removidos silenciosamente — sempre substituídos por uma versão mais simples do mesmo conteúdo (reveal ao invés de scrub, fade ao invés de máscara complexa).
- Cursor customizado desligado inteiramente em touch (`matchMedia('(hover: hover) and (pointer: fine)')`), nunca escondido só via CSS.
- Hero: wordmark reduz de escala mas permanece o elemento dominante da tela; textura de fundo pode ser removida se pesar no LCP mobile.
- Capabilities: hover vira accordion tap-to-expand, um grupo aberto por vez.
- Technology: repulsão por cursor vira tap-to-focus; densidade de nós reduzida.
- Todas as seções pinadas têm altura de "trilho" de scroll reduzida em mobile (o pin ainda existe onde fizer sentido, mas exige menos distância de rolagem física do polegar).

## 15. Performance

Meta declarada: o site precisa ser, ele mesmo, prova das competências de performance listadas (First Load JS controlado, mídia otimizada, Core Web Vitals saudáveis) — não é aceitável um portfólio sobre performance que performa mal.

- **Vídeo**: só usado onde justificado (Selected Work, opcional); sempre `preload="metadata"`, sempre lazy via `IntersectionObserver`, sempre com pausa ao sair de viewport; formato WebM/MP4 com poster estático.
- **Imagens**: AVIF com fallback WebP, `next/image` (ou equivalente) com dimensões explícitas para evitar layout shift.
- **JS**: motion pesado (GSAP/ScrollTrigger) carregado sem bloquear o LCP do Hero; SplitText/stagger de texto só nos pontos mapeados no motion system, não em todo título da página; o mapa de Technology (Canvas/SVG) carregado sob demanda quando a seção se aproxima da viewport, não no bundle inicial.
- **Fontes**: self-host, `font-display: swap`, subset latino.
- **`content-visibility: auto`** em seções abaixo da dobra para reduzir custo de layout inicial.
- **Orçamento de referência** (a validar durante a implementação, não uma promessa fechada neste documento): mirar em First Load JS na mesma ordem de grandeza do resultado já demonstrado no Case Principal (~150 KB), já que é literalmente o número que o site vai exibir como prova.

## 16. Tecnologias

Stack alinhado 1:1 com as competências reais listadas pelo usuário — o site é também a demonstração viva do stack:

- **Framework**: Next.js (App Router) + React.
- **Estilo**: Tailwind CSS + PostCSS.
- **Motion**: GSAP + ScrollTrigger (+ SplitText se licenciado — Club GreenSock, mesmo plugin identificado na referência) para os pontos de pin/scrub/stagger; Framer Motion para microinterações de componente (hover states, accordion do Capabilities, entrada/saída de elementos de UI simples) — divisão clara de responsabilidade entre as duas libs para não sobrepor sistemas de animação.
- **Smooth scroll**: Lenis.
- **Mapa Technology**: Canvas 2D nativo ou SVG animado via GSAP — sem dependência 3D.
- **Formulário de contato (se houver)**: rota server-side própria (Next.js Route Handler), sem serviço de terceiro exposto no client.
- **Deploy**: Vercel, domínio próprio a definir.
- **Monitoramento leve**: Sentry (mesmo já usado no ecossistema Imesul, portanto já dominado) para captura de erro em produção desde o dia 1.

## 17. Estrutura de componentes (proposta inicial)

```
app/
 ├─ layout.jsx
 ├─ page.jsx                      (orquestra as seções na ordem do storyboard)
 └─ (rotas futuras opcionais: /work/[slug])

components/
 ├─ intro/
 │   └─ BootLoader.jsx
 ├─ hero/
 │   ├─ HeroWordmark.jsx
 │   └─ HeroBackgroundTexture.jsx
 ├─ manifesto/
 │   └─ ManifestoScrubber.jsx      (pin + scrub das 5 palavras)
 ├─ work/
 │   ├─ SelectedWorkList.jsx
 │   └─ WorkBlock.jsx
 ├─ case/
 │   ├─ CaseIntro.jsx
 │   ├─ CaseArchitectureDiagram.jsx
 │   ├─ CasePerformanceStats.jsx   (contadores com scrub)
 │   └─ CaseSecurityMonitoring.jsx
 ├─ capabilities/
 │   └─ CapabilitiesIndex.jsx      (accordion editorial)
 ├─ technology/
 │   └─ TechnologyMap.jsx          (canvas/SVG interativo)
 ├─ about/
 │   └─ AboutBlock.jsx
 ├─ contact/
 │   └─ ContactCTA.jsx
 └─ system/
     ├─ CustomCursor.jsx
     ├─ SmoothScrollProvider.jsx   (Lenis)
     ├─ MotionProvider.jsx         (registro central do GSAP/ScrollTrigger, respeita prefers-reduced-motion)
     └─ SectionLabel.jsx           (numeração mono reutilizável, ex. "03 / 08")

lib/
 └─ motion/
     ├─ easings.js
     ├─ durations.js
     └─ useReducedMotion.js
```

Princípio geral: **um provider central de motion** (`MotionProvider`) decide, uma única vez, se o dispositivo/preferência do usuário permite animação completa, reduzida ou nenhuma — todos os componentes de seção consultam esse estado em vez de reimplementar a checagem de `prefers-reduced-motion` individualmente.

## 18. Assets que precisamos produzir

| Asset | Necessário para | Status |
|---|---|---|
| Retrato tratado de Vitor | About | **A produzir/fornecer** |
| Capturas de tela reais do Digital Commerce Platform (catálogo, fluxos, admin) | Case Principal | **A reunir** — provavelmente já existem, extraíveis do projeto `imesul-vendas` |
| Diagrama vetorial original da arquitetura do case | Case Principal | **A produzir** (design próprio, não reaproveitar nenhum diagrama interno do repositório Imesul) |
| Imagens/clipes de 2–4 projetos adicionais para Selected Work | Selected Work | **A definir quais projetos** (ver seção 19) |
| Textura/linha técnica de fundo do Hero | Hero | Gerável em design (SVG/CSS), sem necessidade de fotografia |
| Favicon/identidade mínima (sem logotipo obrigatório) | Global | **A decidir** — o wordmark tipográfico pode ser suficiente, sem exigir uma marca gráfica separada |

## 19. Conteúdo faltante

Itens que **não podem ser inventados** e precisam vir diretamente de Vitor antes da implementação final:

- **Canal de contato**: hoje o único canal público confirmado é o Instagram (`@vitor.systems`, bio indica "Projetos / parcerias: Direct"). Não há e-mail nem telefone público disponível na bio. Definir se Contact deve: (a) linkar direto para o Instagram Direct, (b) incluir um e-mail que Vitor forneça, e/ou (c) incluir um formulário próprio.
- **Projetos adicionais para Selected Work**: além do Digital Commerce Platform, o Instagram público de Vitor menciona dois projetos autorais em construção — **SYNTRA** (sistema de aprendizado adaptativo, descrito pelo próprio Vitor como "ainda em desenvolvimento") e **LOOKOUT — Operational Awareness Engine** (plataforma de observabilidade operacional: monitoramento de dispositivos em tempo real, execução remota de comandos, acesso a tela com consentimento, log de auditoria, apoio a compliance via OCR). Ambos podem ser candidatos fortes ao Selected Work **desde que Vitor confirme o nível de detalhe público apropriado para cada um** (especialmente o LOOKOUT, que trata de acesso remoto a dispositivos — vale checar se há algo que não deva ser detalhado publicamente) e o status real de cada um (protótipo, em desenvolvimento, etc.) para não apresentar como "pronto" algo que não está.
- **Nome completo/sobrenome** (se desejado no site) — não confirmado publicamente, hoje só "Vitor"/"VitorSystems | DEV".
- **Formação, tempo de experiência, localização, disponibilidade para novos projetos** — nenhum desses dados foi encontrado publicamente; nada disso deve aparecer no site até Vitor fornecer.
- **Nível de exposição do nome do cliente no Case Principal** — o brief pede foco no desafio técnico, não em propaganda do cliente; confirmar com Vitor se o nome comercial pode aparecer (mesmo que discretamente) ou se deve permanecer descrito apenas como "distribuidor de materiais metálicos".
- **Licenciamento das fontes sugeridas** (seção 5) — as famílias citadas são sugestões de direção; a escolha final depende de licença disponível/orçamento.

## 20. Riscos técnicos

- **Pin/scrub em excesso causando jank em dispositivos médios/baixos** — mitigado pela regra explícita de só 2 pontos de pin no site inteiro (seção 9) e por `ScrollTrigger.matchMedia` desligando os mais pesados em mobile.
- **SplitText em textos longos** (custo de DOM) — mitigado por reservar stagger por caractere só a 2 momentos (wordmark do Hero, fechamento do Contact); todo o resto usa stagger por palavra ou reveal simples.
- **Conflito entre GSAP e Framer Motion** controlando o mesmo elemento — mitigado por divisão de responsabilidade clara (seção 16): GSAP/ScrollTrigger para tudo ligado a posição de scroll; Framer Motion só para estados de interação de componente isolado (hover, accordion) que não dependem de scroll.
- **Lenis (smooth scroll) interferindo em `scrollIntoView`/navegação por teclado/leitor de tela** — exige teste dedicado de acessibilidade (tab order, skip-link, foco visível) antes do lançamento; não assumir que "funciona" só porque funciona visualmente.
- **Mapa interativo (Technology) sem fallback** em navegadores/dispositivos que não suportam bem Canvas ou com JS parcialmente bloqueado — precisa de um fallback estático (lista simples das mesmas tecnologias) caso a renderização interativa falhe.
- **Dependência de dados reais do case** (números de performance, capturas de tela) que podem ficar desatualizados se o projeto `imesul-vendas` mudar depois da publicação do portfólio — os números devem ser tratados como "snapshot datado", não como métrica ao vivo, e revisados periodicamente.
- **Excesso de zelo estético sobre substância** — maior risco conceitual do brief inteiro: como o objetivo explícito é evitar "estética de site feito automaticamente por IA" e parecer "criado por um estúdio digital", cada decisão de motion precisa passar pelo filtro "isso comunica algo ou só decora?" antes de entrar na implementação (regra já reforçada em todo o documento, mas o maior risco é ela ser relaxada sob pressão de prazo durante a construção).

---

## Storyboard — resumo para aprovação

1. **Intro/Loader** — boot sequence mono de ~1–2s, sem spinner, vira cortina que revela o Hero.
2. **Hero** — `VITOR` gigante + headline editorial autoral + textura técnica sutil; parallax leve.
3. **Manifesto** — pin+scrub das 5 palavras do processo, fundo invertido (`--paper`).
4. **Selected Work** — pilha vertical cinematográfica de projetos, reveal por máscara, hover revela contexto.
5. **Case Principal (Digital Commerce Platform)** — narrativa completa problema→processo→arquitetura→interface→performance (números reais com scrub)→segurança/monitoramento→resultado.
6. **Capabilities** — índice editorial de 6 grupos (DESIGN/DEVELOPMENT/MOTION/SYSTEMS/AUTOMATION/AI), expansão por hover/tap.
7. **Technology** — mapa interativo leve (Canvas/SVG) das tecnologias, reage a cursor/tap.
8. **About** — fundo invertido (`--paper`) de novo, texto curto e humano + retrato tratado.
9. **Contact** — fechamento minimalista, CTA forte, Instagram como canal confirmado.

Paleta própria (`--ink` / `--paper` / `--graphite` / `--signal` laranja / `--terminal` verde-utilitário), tipografia editorial + mono técnica, motion system com 3 durações e 2 famílias de easing documentadas, `prefers-reduced-motion` tratado como regra global desde o design — não como adendo.

**Aguardando aprovação deste storyboard antes de qualquer implementação.**
