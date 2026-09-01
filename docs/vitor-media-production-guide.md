# Vitor Portfolio — Media Production Guide

> Especificação técnica e artística para os 5 assets reais que faltam em `/prototype/vitor`. Documento de referência para produção — **nenhum código foi alterado para gerar isto**. Todos os números abaixo vêm diretamente da implementação atual (grid, aspect ratios, transforms de scroll já escritos no código), não são estimativas soltas.

## 0. Constantes compartilhadas (valem para os 5 assets)

- **Viewport de referência do layout**: 1440×900 (é o que foi priorizado até aqui; todos os cálculos de largura em coluna abaixo usam essa referência).
- **Grid**: 12 colunas, `gutter = clamp(1.25rem, 4vw, 3.5rem)` (56px de margem lateral a 1440px), gap de coluna de 24px (`gap-6`) ou 40px (`gap-10`) dependendo da seção — indicado caso a caso.
- **Não há largura máxima de container.** O conteúdo estica com a viewport (sem `max-width` central tipo 1440/1920px fixo). Em monitores muito largos (2560px+) os blocos de mídia ficam maiores que os números de referência abaixo — por isso as resoluções recomendadas já incluem margem de segurança, não são just-enough para 1440px.
- **Paleta a respeitar na direção de cor**: `--ink #0A0B0D` (quase-preto), `--paper #F3F1EA` (off-white quente), `--graphite #8B8D93`, `--signal #FF5A2E` (laranja raro — não pinte assets nessa cor, ela é reservada para UI/interação), `--terminal #43FF9C` (verde raro, só contexto literal de sistema/status). Fotografia/vídeo não precisam "vestir" essas cores — precisam **não competir** com elas: evitar saturação alta, evitar tons que rivalizem com o laranja de sinal.
- **Orçamento de peso**: o próprio case do Digital Commerce Platform, dentro do site, exibe como resultado real `2.74 MB → 1.43 MB` de vídeo WebM e `8.96 MB → 4.81 MB` de assets públicos totais. Os 5 assets novos precisam ser produzidos com a mesma disciplina — os limites por asset abaixo foram calculados para que a SOMA dos 5 fique bem abaixo desses números de referência.
- **Placeholder atual** ([MediaPlaceholder.jsx](../vitor-portfolio/components/prototype/MediaPlaceholder.jsx)): moldura com cantos de enquadramento, borda `graphite/20` sobre fundo `ink/40`, tag de projeto no canto superior esquerdo, label centralizado. O asset real vai substituir esse `<div>` por uma tag `<img>`/`<video>` real (ou `next/image`) — isso é uma tarefa de código pequena da próxima etapa, não desta.
- **Canvas / sequência de frames**: nenhum dos 5 assets precisa disso. Nenhum dos 5 pontos tem hoje um mecanismo de scroll-scrub quadro-a-quadro (esse padrão existe em outro protótipo do repositório, `imesul/app/prototype/scroll-frame-hero`, mas é de um projeto diferente e não faz parte do motion system do `vitor-portfolio`). Vídeo/imagem tradicional resolve os 5 casos.

---

## 1. VIDEO — SYNTRA

### Onde vive e o que já anima
[SelectedWorkSection.jsx](../vitor-portfolio/components/prototype/SelectedWorkSection.jsx) — bloco `SyntraBlock`, primeiro "momento" do Selected Work (`PROJECT.01`). Reveal por máscara vertical (`clip-path: inset()`, de baixo para cima) ao entrar em viewport, e depois **cresce continuamente em escala** (de `scale: 1` até `scale: 1.16`) enquanto o bloco inteiro passa pela tela — o crescimento é 100% CSS/GSAP, não precisa estar "embutido" no arquivo de vídeo.

| Campo | Especificação |
|---|---|
| Aspect ratio | **3:4** (vertical) — `aspect-[3/4]`, fixo, sem variante mobile no código atual |
| Dimensão em tela (1440px, referência) | ~765×1020px, chegando a ~887×1184px no pico do zoom de scroll |
| Resolução recomendada | Mínimo **1350×1800px**; ideal **1620×2160px** (dá nitidez confortável até o zoom de 1.16× e em monitores grandes) |
| FPS | 30fps (24fps é aceitável se a gravação for mais "editorial"/pausada; evitar 60fps — não há ganho aqui e o arquivo fica maior) |
| Duração | 5–8s, **loop perfeito e imperceptível** (o vídeo toca em `loop` de fundo; qualquer corte visível no loop quebra a composição) |
| Formato | **MP4 (H.264, yuv420p, faststart)** como principal; **WebM (VP9)** opcional como fonte mais leve — ver seção 0 sobre disciplina de peso |
| Peso máximo | **2,5 MB** (WebM) / **4 MB** (MP4) — se ultrapassar isso, prefira reduzir para uma imagem estática tratada (ver abaixo) |
| Alternativa recomendada | **Imagem estática funciona igualmente bem aqui.** Como o crescimento já é feito em CSS, se o SYNTRA ainda não tiver uma interface polida o bastante para gravar (é um projeto "em desenvolvimento", como o texto do próprio site já admite), uma screenshot tratada em alta resolução é uma escolha honesta e visualmente idêntica em repouso. Nesse caso: AVIF/WebP, ≤ 400 KB, mesma resolução mínima acima. |

**Enquadramento**: o bloco de texto (`PROJECT.01`, título, categoria, frase, natureza) ocupa as colunas 6–11 de um grid de 12, enquanto a mídia ocupa as colunas 1–7 — ou seja, **as colunas 6–7 são compartilhadas**. Isso significa que o texto se sobrepõe visualmente aos ~25–30% direitos da imagem, na região superior/média (o bloco de texto sobe com `-mt-16` de 64px). **Mantenha o assunto principal (UI, tela, elemento central) nos ~70% esquerdos do enquadramento**; a faixa direita deve ter conteúdo mais "quieto" (fundo, área negativa da própria interface) para não competir com o título "SYNTRA" em cima dela.

**Área segura para texto**: margem de ~28% a partir da borda direita, concentrada na metade superior do quadro.

**Direção visual**: mesma linguagem do resto do site — fundo escuro/neutro, sem gradientes coloridos, sem UI com paleta em conflito com o `--signal` laranja. Se for screen recording/screenshot de produto, mostrar a interface real do SYNTRA (não mockup genérico de dispositivo, não "iPhone flutuante").

**Movimento necessário no próprio arquivo (se vídeo)**: mínimo — uma micro-interação da interface (cursor se movendo, um dado sendo atualizado, uma transição de tela) é suficiente. **Evite qualquer movimento de câmera/pan no arquivo** — o zoom de scroll já é aplicado por cima; um vídeo que já pan/zoom sozinho vai brigar com esse movimento.

**Tratamento de cor**: se for interface de produto, cores nativas da própria UI estão ok (não precisa "recolorir" para bater com a paleta do site) — só evitar vinheta/moldura colorida ao redor. Se for fotografia/still de apoio: baixa saturação, sem realces estourados.

**Mobile**: aspect ratio único hoje (sem variante mobile no código); ao produzir, mantenha o assunto principal centrado nos 80% centrais do quadro para permitir um recorte futuro mais quadrado/vertical sem perder o essencial.

---

## 2. VIDEO/SCREENSHOT — LOOKOUT

### Onde vive e o que já anima
[SelectedWorkSection.jsx](../vitor-portfolio/components/prototype/SelectedWorkSection.jsx) — bloco `LookoutBlock`, segundo momento (`PROJECT.02`). **Este é o mais dependente de vídeo dos 5.** Em desktop, a mídia fica **pinada (`position: sticky`) por 230vh de scroll** enquanto o texto ao lado se revezasse em 4 estágios (tag+título → categoria → frase → natureza) por cima de um scrub. Em mobile o pin é desativado (cai para bloco estático normal, sem scroll travado).

| Campo | Especificação |
|---|---|
| Aspect ratio | **16:9** (horizontal), fixo no código (`aspect-[16/9]`) |
| Dimensão em tela (1440px, referência) | ~872×490px |
| Resolução recomendada | Mínimo **1920×1080px** (Full HD); aceitável até 2560×1440px se a fonte permitir |
| FPS | 30fps |
| Duração | **8–15s, loop perfeito** — este é o mais longo dos 3 vídeos porque fica pinado por bastante distância de scroll; um loop curto demais vai repetir de forma perceptível enquanto o usuário ainda está lendo os 4 estágios de texto |
| Formato | **MP4 (H.264)** principal; **WebM (VP9)** como fonte leve alternativa |
| Peso máximo | **4 MB** (WebM) / **6 MB** (MP4) — folga maior que os outros por causa da duração, mas ainda disciplinado |
| Vídeo vs. screenshot | **Vídeo é fortemente preferível aqui.** O conceito do LOOKOUT é "observar um feed em tempo real" — uma screenshot estática entrega só metade da ideia. Se só houver screenshot disponível por enquanto, uma imagem estática funciona como placeholder editorial (mesma resolução/peso de imagem dos outros itens), mas o efeito perde a força pretendida. |

**Enquadramento**: mídia (colunas 8) e texto (colunas 4) **não se sobrepõem** — são colunas separadas do grid, então **não há restrição de área segura para texto aqui**. Use o quadro inteiro.

**Direção visual**: um dashboard/tela de monitoramento real do LOOKOUT — dados, status, lista de dispositivos, gráfico. Se possível, mostrar um estado "ativo"/"ao vivo" (algo mudando: um contador, uma lista, um indicador de status) — é literalmente o que o texto ao lado descreve (monitoramento em tempo real, execução remota, log de auditoria).

**Movimento necessário**: real e contínuo — é o único dos 5 assets onde o movimento no PRÓPRIO arquivo carrega parte do significado (o site não adiciona zoom/pan aqui, só troca o texto ao lado). Cursor se movendo, gráfico atualizando, uma notificação aparecendo — qualquer coisa que sugira "isso está rodando agora".

**Tratamento de cor**: cores nativas da UI do LOOKOUT. Evitar telas com muito vermelho/alerta piscando (competiria com o `--signal` laranja do resto do site) — se houver estados de alerta na interface real, prefira capturar um momento mais neutro/operacional.

**Mobile**: como o pin é desligado abaixo de 768px, o vídeo aparece **inline, tocando em loop normalmente**, sem a coreografia de texto trocando por cima — ele precisa parecer bem "sozinho", sem depender da sincronia com o texto. Isso já é automático no código; não precisa de um corte de vídeo separado para mobile, só considerar que ele será visto sem o storytelling de 4 estágios.

---

## 3. VIDEO/SCREENSHOT — DIGITAL COMMERCE PLATFORM

### Onde vive e o que já anima
[SelectedWorkSection.jsx](../vitor-portfolio/components/prototype/SelectedWorkSection.jsx) — bloco `CommerceTeaserBlock`, terceiro e último momento do Selected Work (`PROJECT.03`). Reveal por escala ao entrar, e depois — este é o ponto de "handoff físico" do site — **a mídia cresce de `scale: 1` até `scale: 1.4` e se apaga (`opacity: 1 → 0`) exatamente enquanto a headline da seção Commerce (`From catalog to digital system.`) nasce por trás**, num único scrub compartilhado entre as duas seções.

| Campo | Especificação |
|---|---|
| Aspect ratio | **4:5** (vertical/quadrado-alto), fixo (`aspect-[4/5]`) |
| Dimensão em tela (1440px, referência) | ~765×956px, chegando a ~1071×1339px no pico do handoff (scale 1.4×) |
| Resolução recomendada | Mínimo **1600×2000px**; ideal **2000×2500px** — a folga extra aqui é por causa do 1.4× de escala no handoff, mais agressivo que o do SYNTRA |
| FPS | 30fps |
| Duração | 4–6s, loop perfeito (o vídeo passa a maior parte do tempo visível parado/em loop simples — o handoff em si dura só a extensão de um scroll rápido) |
| Formato | **MP4 (H.264)** principal; WebM opcional |
| Peso máximo | **2 MB** (WebM) / **3,5 MB** (MP4) |
| Vídeo vs. screenshot | Como este é um produto **já em produção real** (não "em desenvolvimento" como os outros dois), uma captura de tela real do site ao vivo é totalmente viável — scrollando o catálogo, abrindo uma especificação, um hover de configuração. Imagem estática também funciona bem aqui (o crescimento+fade já é feito em CSS/GSAP), então escolha o que for mais fácil de produzir com qualidade. |

**Enquadramento**: mídia (colunas 1–7) e texto (colunas 8–12) não se sobrepõem — sem restrição de área segura. Como o quadro cresce e desaparece simultaneamente durante o handoff, não há risco de o conteúdo do vídeo ficar "cortado feio" sobre o texto vizinho.

**Direção visual**: **não é propaganda da empresa-cliente** — enquadre a interface (catálogo, especificação técnica, fluxo de orçamento), nunca a marca/identidade visual do cliente em destaque. Foque em telas que mostrem a densidade técnica do produto (grade de produtos, um seletor de especificação, um passo da jornada de orçamento).

**Movimento necessário (se vídeo)**: leve — um scroll pela interface real, uma seleção de opção. Como no SYNTRA, evite pan/zoom de câmera próprio; o crescimento já é aplicado por fora.

**Tratamento de cor**: cores nativas do produto real (que já tem sua própria identidade visual, distinta da paleta do portfólio — está tudo bem, é esperado, é uma captura de outro produto).

**Mobile**: aspect ratio único no código hoje; ao gravar/capturar, mantenha a composição central e evite elementos essenciais nos 10% das bordas para permitir recorte futuro.

---

## 4. SCREENSHOT — CATALOG / SPECIFICATION

### Onde vive e o que já anima
[CommerceCaseSection.jsx](../vitor-portfolio/components/prototype/CommerceCaseSection.jsx) — a prévia do case, ao lado dos números de catálogo (42 / 297) e das métricas de performance. **É o único dos 5 assets sem nenhuma animação de entrada própria hoje** — aparece estático, junto com o resto da seção. É explicitamente definido como screenshot (não vídeo) desde o briefing.

| Campo | Especificação |
|---|---|
| Aspect ratio | **4:5** (vertical), fixo (`aspect-[4/5]`) |
| Dimensão em tela (1440px, referência) | ~530×662px |
| Resolução recomendada | Mínimo **1200×1500px**; ideal **1600×2000px** |
| FPS | não aplicável (imagem estática) |
| Duração | não aplicável |
| Formato | **AVIF** (preferencial) com fallback **WebP**; manter um master em PNG para edição |
| Peso máximo | **400 KB** (a versão de entrega em AVIF/WebP) |
| Vídeo vs. imagem | Imagem — já definido no briefing, e faz sentido: é a peça mais "documental" do case, não precisa de movimento |

**Enquadramento**: sem sobreposição de texto (colunas 1–5 dedicadas só à imagem, números e métricas ficam nas colunas 6–12). Sem restrição de área segura.

**Direção visual**: mostrar o catálogo real e/ou a tela de especificação técnica do produto (a mesma densidade que o texto da seção descreve — "catálogo técnico denso, motor de especificação"). Pode ser uma composição de 1 tela só ou um recorte que mostre claramente a estrutura de navegação por categoria/especificação — o objetivo é comunicar "isto é tecnicamente denso e bem organizado", não só "aqui está um site".

**Movimento**: nenhum.

**Tratamento de cor**: cores nativas do produto.

**Mobile**: sem variante no código hoje; ao capturar, dar preferência a uma tela onde o conteúdo essencial esteja nos 80% centrais, para permitir recorte futuro sem perder a legibilidade.

---

## 5. PORTRAIT — VITOR

### Onde vive e o que já anima
[AboutSection.jsx](../vitor-portfolio/components/prototype/AboutSection.jsx). Diferente dos outros 4, este já está **estruturalmente preparado para sobreposição**: a headline ("I like building things that work.") começa na coluna 4 enquanto o retrato ocupa as colunas 1–5 — ou seja, colunas 4–5 são compartilhadas, com a headline puxada para cima (`-mt-6`, um overlap moderado, intencionalmente contido) sobre o topo/canto superior direito do retrato. Reveal por máscara vertical ao entrar em viewport, com leve parallax de scroll (±3% de deslocamento vertical).

| Campo | Especificação |
|---|---|
| Aspect ratio | **3:4 em mobile, 4:5 em desktop** (`aspect-[3/4] md:aspect-[4/5]`) — **único dos 5 assets com crop diferente por breakpoint já no código** |
| Dimensão em tela (1440px, referência) | ~539×674px (desktop, 4:5) |
| Resolução recomendada | Mínimo **1600×2000px** (4:5) — dessa resolução dá para extrair também o recorte 3:4 do mobile sem perda de qualidade; ideal **2000×2500px** |
| FPS | não aplicável |
| Duração | não aplicável |
| Formato | **AVIF** preferencial, fallback **WebP**; master em formato sem perda (TIFF/PNG ou RAW da câmera) para tratamento |
| Peso máximo | **350 KB** (versão de entrega AVIF/WebP) |
| Vídeo vs. imagem | Imagem — retrato fotográfico, não vídeo |

**Enquadramento**: **atenção especial aqui** — o canto superior direito do retrato (aproximadamente os 40% direitos da faixa superior, ~25% da altura) vai ficar próximo/sob a headline. Enquadre o rosto/sujeito principal deslocado para a esquerda ou centro do quadro, deixando o canto superior direito mais "neutro" (fundo liso, sem detalhe importante) para a sobreposição funcionar sem brigar visualmente com o texto.

**Área segura para texto**: canto superior direito, aproximadamente 40% de largura × 25% de altura a partir do topo.

⚠️ **Pendência já sinalizada no código** (comentário em `AboutSection.jsx`): a seção usa texto na cor `--ink` (escuro) sobre fundo `--paper` (claro) — isso só funciona bem se a **parte do retrato sob a headline for clara/neutra**. Se o enquadramento final tiver um fundo escuro atrás do sujeito nessa área, meu próximo passo de código vai precisar ajustar a cor do texto ali (ou adicionar um scrim sutil) — não é algo para resolver na produção da foto, mas influencia qual enquadramento evitar: **prefira fundo claro ou neutro no canto superior direito do quadro**, se possível, para já entrar funcionando sem ajuste extra depois.

**Direção visual**: editorial, contido — coerente com o resto do site (tipografia grande, silêncio visual, nada "corporativo sorridente" nem "foto de banco de imagens"). Recomendo preto e branco ou dessaturação forte, contraste moderado (nada estourado), enquadramento sério/direto — mais parecido com retrato de revista de design do que headshot de LinkedIn. Luz natural ou softbox simples, sem fundo decorado.

**Movimento**: nenhum (só o parallax de scroll de ±3%, já aplicado em CSS).

**Tratamento de cor**: P&B ou dessaturação forte recomendados; se optar por manter cor, manter saturação baixa e evitar tons que rivalizem com o laranja `--signal` (ex.: evitar roupa/fundo em laranja/vermelho vibrante).

**Mobile**: **já tem crop dedicado no código** (3:4 em vez de 4:5) — ao fotografar, enquadrar com folga suficiente para que tanto o corte 4:5 (mais alto) quanto o 3:4 (mais quadrado) funcionem a partir da mesma imagem-mestre, sem precisar de uma segunda sessão de foto.

---

## Resumo de entrega

| # | Asset | Formato de entrega | Peso máx. | Resolução mín. |
|---|---|---|---|---|
| 1 | SYNTRA | MP4/WebM *ou* AVIF/WebP | 4 MB / 400 KB | 1350×1800 |
| 2 | LOOKOUT | MP4/WebM (vídeo fortemente preferido) | 6 MB | 1920×1080 |
| 3 | Digital Commerce Platform | MP4/WebM *ou* AVIF/WebP | 3,5 MB / 400 KB | 1600×2000 |
| 4 | Catalog / Specification | AVIF/WebP | 400 KB | 1200×1500 |
| 5 | Portrait — Vitor | AVIF/WebP | 350 KB | 1600×2000 |

Assim que os arquivos chegarem, a integração em código (trocar `MediaPlaceholder` por `<video>`/`next/image` reais, com os `source`/`sizes` corretos) é uma tarefa pequena e isolada — nenhuma mudança estrutural adicional é necessária nas seções para recebê-los.
