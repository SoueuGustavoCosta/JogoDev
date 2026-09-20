# CLAUDE.md — Arquipélago (plataforma de ensino em ilhas)

Este arquivo é a especificação do projeto. Leia inteiro antes de escrever código e siga-o em toda tarefa.
O autor é Gustavo Costa Gomes (estudante de Ciência da Computação). Comunique-se com ele em português do Brasil. Nomes de código (arquivos, funções, tipos) ficam em inglês; textos para o aluno ficam em português do Brasil.

---

## 1. Visão do produto

Um app web gratuito e interativo para estudantes (principalmente colegas de faculdade) aprenderem tecnologia do zero ao avançado, jogando e praticando.

- O app é um **arquipélago**: a home é um mapa com várias **ilhas**. Cada ilha é uma trilha de estudo independente, com símbolo próprio.
- O aluno pode entrar em **qualquer ilha**, sem ordem obrigatória entre ilhas.
- **Sem login e sem cadastro.** O progresso fica no navegador do aluno.
- Ilhas planejadas (em ordem de criação):
  1. **Banco de Dados** (PostgreSQL) — já existe como protótipo, ver seção 12.
  2. **Lógica de Programação**
  3. Linguagens: Java, Python, PHP (uma ilha por linguagem)
  4. Docker
  5. Git e GitHub
  6. Outras que surgirem
- Cada ilha tem: módulos com lição + quiz, XP, laboratório prático quando fizer sentido, e um troféu ao concluir.
- O projeto é sustentado por **contribuição voluntária via Pix** (seção 9). Nunca bloqueie conteúdo por causa disso.

> Se a metáfora de "ilha" não combinar com alguma parte da interface, o termo pode mudar na UI. No código, use sempre o termo neutro `Trail` (trilha) para o conceito e `island` apenas para o tema visual/rota. Ver seção 3.

---

## 2. Stack e infraestrutura

- **Vite + React + TypeScript (strict)**. Sem back-end próprio nesta fase.
- **React Router** com rotas por ilha, carregadas sob demanda (`React.lazy`), para o celular baixar só o que usa.
- **Estilo:** CSS Modules ou Tailwind, à escolha, mas com **design tokens** centralizados (seção 8). Não misture os dois.
- **Banco de prática no navegador:** PGlite (Postgres em WebAssembly), carregado só quando o aluno abre o laboratório (dynamic import). Nunca no bundle inicial.
- **Métricas:** ferramenta pronta e sem cookies (Vercel Web Analytics e/ou PostHog/Plausible), atrás de uma interface (seção 6). Não crie back-end para isso.
- **Deploy:** repositório no GitHub, projeto importado no Vercel, deploy automático a cada push na `main`, preview em cada pull request.
- **Testes:** Vitest (domínio e aplicação), Playwright (fluxos principais em viewport de celular), e um teste que executa todos os blocos de SQL do conteúdo (seção 11).
- **Qualidade:** ESLint, Prettier, `tsc --noEmit` e testes rodando no CI (GitHub Actions) em todo PR.

Fora de escopo por enquanto: login, banco de dados na nuvem, Supabase, Java/Spring, Docker, Redis, pagamentos além do Pix voluntário. Não introduza nenhum deles sem pedido explícito. A arquitetura abaixo deve permitir adicioná-los depois sem reescrever o resto.

---

## 3. Arquitetura em camadas (regra mais importante)

Quatro camadas, com dependência **sempre para dentro**:

```
presentation  →  application  →  domain
infrastructure →  application  →  domain      (infrastructure implementa as portas)
content       →  domain                        (conteúdo só conhece os tipos do domínio)
```

### Estrutura de pastas

```
src/
  domain/                 # regras puras. TypeScript puro: SEM React, SEM window, SEM localStorage
    trail/                # Trail, Module, Block, Quiz, Mission (tipos e validações)
    progress/             # Progress, cálculo de XP, desbloqueio, conclusão, troféu
    support/              # regras da contribuição (constantes, texto), sem I/O
  application/            # casos de uso + portas (interfaces)
    ports/                # ProgressRepository, AnalyticsPort, SqlEnginePort, ClipboardPort
    usecases/             # completeModule, answerQuiz, getIslandProgress, exportProgress, importProgress...
  infrastructure/         # adaptadores: tudo que toca o mundo externo
    storage/              # LocalStorageProgressRepository (com versão e migração)
    analytics/            # adaptador do provedor de métricas + NoopAnalytics
    sql/                  # PgliteEngine (dynamic import) implementa SqlEnginePort
    pix/                  # gerador do BR Code + QR
    clipboard/            # navigator.clipboard com fallback
  presentation/           # React
    app/                  # bootstrap, providers, router, error boundaries
    shell/                # layout, cabeçalho, navegação inferior (mobile), rodapé
    design-system/        # botões, cards, modal, toast, moldura "notebook" (Mac frame)
    blocks/               # renderizadores de cada tipo de bloco de conteúdo
    features/
      archipelago/        # home: mapa das ilhas
      trail/              # tela da ilha, módulo, quiz, troféu
      lab/                # laboratório SQL (editor, resultados, missões)
      support/            # link discreto "Colabore", modal, foguete, confete, QR
  content/                # DADOS, não código de tela
    trails/
      banco-de-dados/     # trail.ts (metadados + símbolo) + modules/*.ts + missions.ts
      logica-de-programacao/
      ...
    registry.ts           # lista de todas as ilhas (único ponto que precisa mudar para adicionar uma)
  config/                 # constantes de ambiente e do projeto (ex.: pix.ts)
  main.tsx
```

### Regras que você deve fazer cumprir

1. `domain/` não importa nada de `application/`, `infrastructure/`, `presentation/` nem de bibliotecas de UI. Nada de `window`, `document`, `localStorage`, `fetch`.
2. `application/` conhece só `domain/` e as **interfaces** das portas. Nunca importa de `infrastructure/`.
3. `infrastructure/` implementa as portas. Componentes React **nunca** chamam `localStorage`, provedor de métricas ou PGlite diretamente: sempre via casos de uso ou hooks que recebem as portas por injeção (Context/Provider montado em `presentation/app`).
4. `presentation/` não contém regra de negócio (XP, desbloqueio, aprovação de quiz). Isso vive em `domain/` e é testado sem React.
5. `content/` é só dado tipado. Um módulo de lição é um objeto que segue o tipo `Module`. **Adicionar uma ilha = criar `content/trails/<id>/` + registrar em `registry.ts`.** Nenhuma outra pasta deve mudar. Se precisar mudar outra pasta para uma ilha nova, a arquitetura falhou: corrija a arquitetura.
6. Cada ilha é uma **fatia independente**: uma ilha não importa arquivos de outra. O que for comum sobe para `domain/`, `design-system/` ou `blocks/`.
7. Imports entre camadas passam pelo `index.ts` público de cada pasta. Configure regra de lint (`eslint-plugin-boundaries` ou `dependency-cruiser`) para **falhar o CI** se alguma dessas regras for violada.
8. Ilhas são carregadas com `React.lazy` + `import()` dinâmico. O bundle inicial contém apenas o shell e a home.

### Modelo de domínio (resumo dos tipos)

```ts
type Trail = { id: string; title: string; tagline: string; symbol: SymbolId; accent: string; modules: Module[]; missions?: Mission[]; lab?: 'sql' | null };
type Module = { id: string; short: string; title: string; lead: string; level: 'Base' | 'Intermediário' | 'Avançado'; blocks: Block[]; quiz: QuizItem[] };
type QuizItem =
  | { q: string; options: string[]; answer: number; explain: string }
  | { q: string; fill: true; pre: string; post: string; accept: string[]; placeholder?: string; explain: string };
type Block =
  | { t: 'h' | 'p'; x: string } | { t: 'note'; k: string; x: string; warn?: boolean }
  | { t: 'cards'; items: { h: string; x: string }[] } | { t: 'ul' | 'ol'; items: string[] }
  | { t: 'code'; file: string; x: string; nolab?: boolean }   // botão "Abrir no laboratório" quando aplicável
  | { t: 'table'; cols: string[]; rows: string[][]; file?: string; mac?: boolean }
  | { t: 'flow'; items: string[] } | { t: 'raw'; file: string; x: string }  // SVG/HTML confiável do próprio projeto
  | { t: 'gui' } | { t: 'syntax' };                            // widgets interativos registrados por id
```

Valide todo conteúdo com **Zod** em teste de build: um erro de conteúdo deve quebrar o CI, não a tela do aluno.

---

## 4. Navegação e progresso

- **Home (arquipélago):** mapa de ilhas em cartões grandes (grade de 1 coluna no celular, 2 a 3 no desktop). Cada cartão mostra símbolo, nome, barra de progresso e estado ("Começar", "Continuar", "Concluída").
- **Todas as ilhas ficam abertas.** Dentro de uma ilha, os módulos seguem em sequência por padrão (o protótipo já é assim), mas ofereça o modo **"Explorar livremente"** (desbloqueia todos os módulos). Decisão pendente com o autor: qual será o padrão. Deixe isso em uma constante de configuração.
- **XP:** 100 por pergunta certa de primeira, 40 se errou antes, +150 ao concluir o módulo. O XP máximo é calculado a partir do conteúdo, nunca escrito à mão.
- **Troféu por ilha** e um **"Passaporte"** com todos os troféus (tela simples). Confete só uma vez por conquista, respeitando `prefers-reduced-motion`.
- **Progresso** guardado em `localStorage` por trás de `ProgressRepository`:
  - chave versionada (`arquipelago:progress:v1`) com **migração** entre versões (aprendemos isso no protótipo: mudar a estrutura sem versão apaga o progresso do aluno);
  - falha silenciosa e segura se o armazenamento estiver bloqueado (modo privado): o app continua funcionando, só sem salvar, e mostra um aviso discreto;
  - **exportar/importar progresso** como um texto/código (JSON em base64) na tela de configurações, porque sem login o progresso some ao trocar de aparelho ou limpar o navegador.

---

## 5. Mobile primeiro (a maioria vai acessar pelo celular)

Projete e teste em **360 × 640** primeiro; depois amplie para tablet e desktop. Critérios de aceite obrigatórios:

- Nenhuma rolagem horizontal da página em nenhuma tela, de 320 px até 1440 px.
- Alvos de toque de **no mínimo 44 × 44 px**; espaçamento suficiente entre botões de resposta do quiz.
- Navegação principal em **barra inferior** no celular (Início, Ilha atual, Laboratório, Contribuir); no desktop, barra lateral. Menu lateral com a lista de módulos vira **gaveta (drawer)** no celular.
- Use `dvh` (não `vh`) para alturas de tela cheia, `env(safe-area-inset-*)` para telas com entalhe, e `viewport-fit=cover`.
- Fonte-base de **16 px ou mais** nos campos de texto (evita o zoom automático do iOS ao focar).
- Blocos de código e tabelas rolam **dentro do próprio bloco** (`overflow-x: auto`), nunca alargam a página.
- **Editor de SQL no celular:** área de texto confortável, teclado sem autocorreção (`autocapitalize="off" autocorrect="off" spellcheck="false"`), e uma **barra de atalhos** acima do teclado com os símbolos difíceis de digitar: `;  ,  '  (  )  *  =  %  _`, mais botões "Executar" e "Limpar". Resultados em tabela com rolagem horizontal interna.
- **Peso e velocidade:** meta de LCP menor que 2,5 s em 4G. Fontes hospedadas no próprio projeto (subset latino, `font-display: swap`), sem bibliotecas grandes no caminho crítico, imagens em SVG/WebP. O PGlite (vários MB) só carrega ao abrir o laboratório, com barra de progresso e texto claro ("Preparando seu banco de dados, só na primeira vez").
- **PWA instalável:** `manifest.webmanifest`, ícones, `theme-color`, e service worker que deixa as lições funcionarem offline depois do primeiro acesso (o laboratório pode pedir internet na primeira vez). Sugira "Adicionar à tela inicial" de forma discreta, uma vez.
- **Aparelhos fracos:** se o navegador não suportar WebAssembly ou o PGlite falhar ao carregar, mostre uma mensagem amigável e mantenha as lições e quizzes funcionando. O laboratório é um extra, nunca um requisito para aprender.
- Compartilhamento por WhatsApp é o principal canal: defina `og:title`, `og:description` e `og:image` (1200 × 630) por ilha, para o link aparecer bonito quando colado em conversas.

---

## 6. Métricas (sem login, sem dados pessoais)

Objetivo do autor: saber quantas pessoas acessam e como usam.

- Toda medição passa por `AnalyticsPort` com um método `track(event, props?)`. Há um adaptador real (Vercel Analytics e/ou PostHog/Plausible) e um `NoopAnalytics` para testes e desenvolvimento.
- **Sem cookies, sem identificar pessoas, sem coletar nome, e-mail ou IP próprio.** Não adicione banner de cookies; adicione uma página curta "Privacidade" dizendo o que é medido (contagem anônima de acessos e de uso) e citando a LGPD.
- Eventos mínimos (nomes em `snake_case`, props sem dados pessoais):
  `page_view`, `island_opened {island}`, `module_started {island, module}`, `quiz_answered {island, module, correct, tries}`, `module_completed {island, module}`, `island_completed {island}`, `lab_opened`, `lab_query_run {ok}`, `mission_completed {mission}`, `support_opened`, `pix_key_copied`, `pix_qr_shown`, `progress_exported`, `install_prompt_shown`.
- Com isso o autor consegue ver: visitantes, ilhas mais abertas, em qual módulo as pessoas desistem, e quantas chegam a contribuir. Não meça o valor de nenhuma contribuição (o app não tem como saber).

---

## 7. Laboratório SQL (ilha Banco de Dados e futuras)

- `SqlEnginePort` esconde o PGlite: `init()`, `reset(dataset)`, `run(sql) → blocos de resultado` (tabela, ok, erro, info).
- Conjuntos de dados: **"Loja de exemplo"** (categorias, produtos, clientes, pedidos, contas) e **"Banco vazio"**. O botão "Abrir no laboratório" dos blocos de código leva o SQL para o editor.
- Comandos do `psql` mais comuns (`\dt`, `\d tabela`) e mensagens de erro do Postgres traduzidas em dicas para iniciantes.
- `CREATE DATABASE` / `DROP DATABASE` são interceptados com explicação (o laboratório já é um banco pronto).
- **Missões práticas** verificadas comparando o resultado (consultas) ou o estado final do banco (DDL/DML). Já existem 12 no protótipo.
- O laboratório deve ser reutilizável: uma futura ilha de Python ou JavaScript pode ter outro motor por trás de outra implementação da mesma porta.

---

## 8. Identidade visual

- **Tema escuro** como padrão: fundo `#0a0912`, painéis `#151225` / `#1b1731`, texto `#ece9f8`, apoio `#9b94b8`, linhas `#2c2647`.
- **Acentos:** roxo choque `#9b4dff` (claro `#c9a2ff`) e laranja choque `#ff6b1f` (claro `#ffa36b`). Sucesso `#3ee0a1`, erro `#ff5d7a`.
- **Tipografia:** Syne (títulos), Instrument Sans (texto), JetBrains Mono (código).
- **Moldura "notebook" (Mac frame):** códigos, tabelas e ilustrações ficam dentro de uma tela estilo MacBook com barra de título e três bolinhas. É a marca visual do projeto.
- Cada ilha tem um **símbolo próprio** em SVG (banco de dados: cilindro; lógica: fluxograma/losango; Java, Python etc.: um ícone geométrico original) e uma **cor de acento** derivada dos tokens. Não use logotipos oficiais de linguagens ou empresas nem copie mascotes: crie símbolos próprios e simples.
- Todos os tokens vivem em um único arquivo (`design-system/tokens`). Nenhuma cor "solta" em componentes.
- Acessibilidade: contraste mínimo AA, foco visível, `aria-label` nos botões de ícone, estrutura semântica de títulos, `prefers-reduced-motion` respeitado em confete e foguete, navegação por teclado no desktop.

---

## 9. Colaboração por Pix (discreta e voluntária)

A contribuição é **voluntária**. Nada é bloqueado por ela.

**Dados do recebedor** (ficam em `src/config/pix.ts`, e só ali):

```ts
export const PIX = {
  key: 'bce1f476-88b0-4951-9433-40fc22d98de5', // chave aleatória (EVP)
  receiverName: 'GUSTAVO COSTA GOMES',          // até 25 caracteres, MAIÚSCULAS, sem acento
  receiverCity: 'IPATINGA',                     // Ipatinga, MG. Até 15 caracteres, MAIÚSCULAS, sem acento
};
```

**Tom e presença (importante): a colaboração é discreta, nunca insistente.** O Pix precisa estar ao alcance de quem quiser ajudar, mas o app não pede, não cobra e não interrompe o estudo. Regras:
- Um link pequeno e de baixo contraste, "Colabore com o projeto", no **rodapé** e na tela de configurações/perfil. **Decisão do autor (2026-09-20):** além disso, uma bolinha dourada fixa no canto superior direito, "Contribua com o meu Pix", que só abre o modal ao toque. Continua sem item na barra de navegação e sem cartão em todas as telas.
- **No máximo uma menção suave por marco grande**, na tela de troféu de uma trilha (uma frase curta e um link, sem destaque de cor).
- **Nada de pop-up, banner, contador ou lembrete automático**, nem depois de módulos concluídos. O modal só abre quando o aluno toca no link.
- Nenhuma frase de culpa ou urgência ("ajude a manter o projeto vivo!"). Tom de convite: "Se a trilha te ajudou e você quiser colaborar, o Pix está aqui."

**Ao tocar em "Colabore com o projeto"** (ação do próprio aluno) abre um modal (bottom sheet no celular) com:

1. **Animação do foguete** decolando e **confete** (canvas leve, uma vez por abertura, desligado com `prefers-reduced-motion`).
2. Mensagem: **"Obrigado por contribuir! Isso ajuda a aumentar o código e ajuda todo mundo."**
3. **QR Code do Pix** (estático, sem valor definido, para o aluno escolher quanto quer dar).
4. A chave em texto, o botão **"Copiar chave"** (com fallback) e o **"Pix copia e cola"** (o código do BR Code) com botão de copiar.
5. Um texto curto: "Contribuição voluntária. A trilha continua aberta para todos."
6. Confirmação de destinatário: exiba o nome do recebedor ("Gustavo Costa Gomes") para o aluno conferir no app do banco.

**Geração do QR:** gere o **BR Code estático do Pix (padrão EMV)** no cliente, em `infrastructure/pix`, com biblioteca de QR (`qrcode` ou similar). Estrutura do payload (TLV, campos `ID + tamanho com 2 dígitos + valor`):

```
00 02 01                              Payload Format Indicator
01 02 11                              Ponto de iniciação: estático
26 ..  00 14 BR.GOV.BCB.PIX           Merchant Account Information (GUI)
       01 ..  <chave Pix>             chave
52 04 0000                            Merchant Category Code
53 03 986                             Moeda: BRL
58 02 BR                              País
59 ..  <nome do recebedor>
60 ..  <cidade do recebedor>
62 ..  05 03 ***                      Additional Data (txid "***")
63 04 <CRC16>                         CRC16-CCITT (polinômio 0x1021, inicial 0xFFFF), calculado sobre todo o payload incluindo "6304"
```

Escreva **testes unitários** do gerador (tamanhos dos campos, CRC, nome/cidade normalizados e truncados). O QR é considerado correto só depois de o autor **testar um Pix real de valor mínimo** no app do banco dele; registre isso no README. Se algum dado do recebedor mudar ou estiver incerto, não invente: deixe um `TODO(autor)` e avise.

**Honestidade:** o app não consegue saber se o Pix foi feito. Nunca mostre "pagamento confirmado", contador de apoiadores nem lista de nomes gerados a partir disso.

---

## 10. Módulo "ilha": como criar conteúdo novo

Passo a passo que você (Claude Code) deve seguir ao criar uma ilha:

1. Criar `src/content/trails/<id>/trail.ts` (metadados, símbolo, cor) e `modules/*.ts`, opcionalmente `missions.ts`.
2. Registrar em `src/content/registry.ts`.
3. Rodar a validação Zod de conteúdo e os testes (`pnpm test`).
4. Conferir no celular (Playwright em viewport 360 px) que a nova ilha aparece na home, abre, roda o quiz e conclui.
5. Nenhum outro arquivo do projeto deve ter sido alterado (exceto docs e ícones/OG da ilha).

Diretrizes de conteúdo: português do Brasil, tom acolhedor e direto, um exemplo real por conceito, exemplos que o aluno consegue **executar**, quiz ao fim de cada módulo (perguntas de múltipla escolha e de completar). O conteúdo é **original**: use materiais da faculdade e vídeos só como inspiração, sem copiar trechos, nem figuras.

---

## 11. Qualidade e testes

- `domain/` e `application/`: Vitest, cobertura alta, sem DOM.
- **Teste de conteúdo (obrigatório no CI):** validar o esquema Zod de todas as ilhas; para a ilha de banco de dados, **executar cada bloco `code` no PGlite** e falhar se der erro inesperado (blocos que erram de propósito recebem a marca `expectError: true`); comparar tabelas de resultado exibidas com o resultado real quando o bloco seguinte for uma tabela.
- Playwright em viewport de celular (Pixel 5 / iPhone 12) para: abrir home, entrar na ilha, responder quiz, abrir laboratório, executar SQL, abrir modal de contribuição, exportar/importar progresso. Verificar ausência de rolagem horizontal.
- Sem `any` e sem `// @ts-ignore` sem justificativa em comentário.
- Erros de execução caem em um **Error Boundary** com mensagem amigável e botão "Voltar ao início", e são reportados como evento anônimo.

---

## 12. Ponto de partida (protótipo existente)

O autor já tem um protótipo em **arquivo único**: `Trilha_PostgreSQL_com_Laboratorio.html` (será colocado na raiz do repositório em `legacy/`). Ele contém:

- O array `MODS` com 22 módulos (lições + quiz) da ilha de Banco de Dados.
- O array `MISSIONS` com 12 missões e o `SEED_LOJA` (dados da loja).
- O motor (renderização de blocos, quiz, XP, mapa, troféu, confete, laboratório) e todo o CSS.

Tarefa inicial: **migrar** esse protótipo para a arquitetura desta especificação **sem perder conteúdo nem comportamento**:

1. Extrair `MODS`/`MISSIONS`/`SEED_LOJA` para `content/trails/banco-de-dados/` como dados tipados.
2. Reimplementar o motor em `domain/` + `application/` + `presentation/` conforme as camadas.
3. Trocar o `localStorage` direto por `ProgressRepository` (com versão e migração).
4. Trocar o acesso direto ao PGlite por `SqlEnginePort`.
5. Transformar a seção "Contribua" existente no fluxo discreto da seção 9 (link no rodapé; modal com foguete, confete e QR só quando o aluno tocar).
6. Só então criar a home com o arquipélago e a ilha de Lógica de Programação.

O visual e o texto do protótipo são a referência de qualidade. Não simplifique o conteúdo.

---

## 13. Ordem de entrega sugerida (marcos)

1. **M1:** projeto Vite + TS + lint de fronteiras entre camadas + CI + deploy de "olá" no Vercel.
2. **M2:** domínio e casos de uso com testes; repositório de progresso; adaptador de métricas.
3. **M3:** ilha Banco de Dados migrada (lições, quiz, XP, troféu) em layout mobile-first.
4. **M4:** laboratório SQL com barra de atalhos para celular e missões.
5. **M5:** contribuição Pix completa (foguete, confete, QR, copia e cola) e testada com Pix real.
6. **M6:** home do arquipélago, passaporte, PWA offline, OG images, exportar/importar progresso.
7. **M7:** ilha Lógica de Programação (primeira ilha nova, prova de que a arquitetura aguenta).

Ao terminar cada marco: rodar CI, abrir o preview do Vercel, testar em celular real ou emulado, atualizar o README com o que mudou.

---

## 14. Decisões em aberto (pergunte ao autor antes de assumir)

- Nome final do produto (usei "Arquipélago" como nome de trabalho).
- Padrão dentro da ilha: sequencial ou livre?
- Ferramenta de métricas: Vercel Analytics apenas, ou também PostHog/Plausible para eventos personalizados?
- Domínio próprio (ex.: `.com.br`) ou subdomínio do Vercel no começo?
- Licença do código e do conteúdo (sugestão: código MIT; conteúdo CC BY-NC-SA, se o autor quiser permitir reuso não comercial).

## 15. Regras de conduta para o Claude Code

- Faça mudanças pequenas e verificáveis; rode lint, tipos e testes antes de dizer que terminou.
- **Commits atômicos:** cada commit deve conter uma mudança coesa e completa (uma camada, uma feature, uma correção), com mensagem curta em português descrevendo o quê e o porquê. Não misture migrações grandes num único commit gigante; não deixe o build quebrado entre commits.
- Não adicione dependências grandes sem justificar o peso no bundle mobile.
- Não coloque segredos, chaves de API ou dados pessoais no repositório. (A chave Pix e o nome do recebedor são públicos por natureza e ficam em `config/pix.ts`.)
- Não invente dados do autor. Se faltar informação, deixe `TODO(autor)` visível e pergunte.
- Não escreva conteúdo que reproduza materiais protegidos (apostilas, vídeos, livros): reescreva com exemplos próprios.
- Ao concluir uma tarefa, responda com um resumo curto: o que mudou, como testar, o que ficou pendente.
