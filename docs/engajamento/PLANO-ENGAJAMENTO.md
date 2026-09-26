# Plano de Engajamento — Viajante do Tempo (JogoDev)

> Documento para o Claude Code executar **em etapas**, uma de cada vez.
> Autor: Gustavo. Repositório: `SoueuGustavoCosta/JogoDev`.
> Coloque esta pasta inteira em `docs/engajamento/` dentro do repositório.

---

## Como usar este arquivo (leia primeiro, Gustavo)

1. Copie a pasta `plano-engajamento` para `C:\Programação\JogoDevPeloTempo\docs\engajamento\`.
2. Faça commit só dessa pasta: `git add docs/engajamento && git commit -m "docs: plano de engajamento"`.
3. Abra o Claude Code na pasta do projeto.
4. Cole **somente o prompt da Etapa 0**. Espere ele terminar e responder.
5. Teste no preview da Vercel pelo celular. Se estiver bom, faça o merge e passe para a próxima etapa.
6. **Nunca cole duas etapas juntas.** Se algo der errado, volte com `git checkout main` e descarte a branch da etapa.

Cada etapa trabalha numa **branch própria**, então a versão que está no ar nunca quebra.

---

## Regras de ouro (valem para TODAS as etapas)

O Claude Code deve seguir estas regras em cada etapa, além das seções 3 e 15 do `CLAUDE.md`:

1. **Uma etapa por vez.** Faça só o que a etapa pede. Se encontrar algo fora do escopo, anote em "Pendências" no final da resposta e não mexa.
2. **Nada de apagar conteúdo.** Nenhum módulo, bloco, pergunta, missão, chefe, insígnia ou texto histórico pode ser removido. Conteúdo só pode ser **reorganizado** ou **convertido** para outro formato.
3. **Testes de não regressão sempre verdes.** Os arquivos `nonRegression.test.ts` de cada ilha protegem o conteúdo. Nunca edite esses testes para "fazer passar". Se um teste falhar, o erro está na mudança.
4. **Progresso do jogador é sagrado.** Quem já jogou não pode perder XP, cristais, ofensiva, insígnias ou módulos concluídos. Toda mudança de formato de dados precisa de migração com teste.
5. **Arquitetura em camadas.** Regras de jogo ficam em `src/domain` (TypeScript puro, com testes). Casos de uso em `src/application`. Supabase, Vercel e navegador em `src/infrastructure`. Telas em `src/presentation`. O lint de fronteiras não pode ser desativado.
6. **Branch e commits.** Crie a branch `etapa-N-nome-curto` a partir da `main`. Commits pequenos, em português, sem build quebrado entre eles.
7. **Antes de dizer que terminou:** rode `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`. Tudo precisa passar.
8. **Mobile primeiro.** Teste cada tela em 390×844. Nada pode ficar coberto por botões flutuantes.
9. **Se faltar decisão**, deixe `TODO(autor)` e pergunte. Não invente.
10. **Resposta final de cada etapa:** o que mudou, como testar no celular, o que ficou pendente.
11. **Projeto 100% gratuito.** Só Vercel Hobby, Supabase Free e PostHog Free. Nenhum serviço pago nem recurso que exija plano pago. Se uma etapa só funcionar pagando, avise o autor **antes** e proponha uma alternativa grátis.
12. **Dados salvos continuam na versão 1.** Campos novos no progresso são opcionais (sem subir `PROGRESS_SCHEMA_VERSION`), e toda mudança atualiza também `domain/progress/merge.ts` (senão o campo some no próximo login ou backup), com teste.
13. **SQL do Supabase:** conferir contra o banco real (`information_schema`) antes de entregar. O autor aplica; o Claude Code nunca roda nada no banco.
14. **Nomes originais.** Nada de nomes, termos ou organizações de obras existentes (regra do `CLAUDE-TEMPO.md`). Usar: Liga dos Viajantes, Eco Solto, Convergência.

---

## 1. Diagnóstico (o que foi encontrado)

Análise feita no código da `main` em 25/09/2026, com prints em tela de celular (390×844).

### 1.1 Os números

| Ilha | Módulos | Leitura estimada | Widgets interativos | Quiz: alternativas × completar código |
|---|---|---|---|---|
| Banco de Dados | 22 | ~32 min | 1 | 81 × 3 |
| Lógica | 10 | ~20 min | 10 | 31 × 23 |
| Git e GitHub | 7 | ~6 min | 0 | 18 × 3 |
| Python | 8 | ~11 min | 0 | 32 × 8 |
| Java | 8 | ~8 min | 0 | 32 × 8 |
| PHP | 8 | ~7 min | 0 | 32 × 8 |

Cada módulo ocupa de **6 a 7 telas de rolagem** no celular antes de chegar ao quiz.

### 1.2 Os problemas de conteúdo

1. **Formato "aula + prova".** O `ModulePage` mostra todos os blocos numa página só e o `QuizRunner` vem no final. O Duolingo faz o contrário: explicação curtinha, desafio, explicação curtinha, desafio.
2. **Primeira impressão fraca.** O prólogo recomenda começar pela Era dos Dados, que é a ilha com mais texto e só 1 widget. O primeiro módulo (`porque`) tem 535 palavras e nenhum código.
3. **Muita múltipla escolha.** Cerca de 226 perguntas de alternativa contra 53 de completar código. O autor quer fugir da múltipla escolha.
4. **Molde repetido.** Python, Java e PHP têm a mesma estrutura: texto, código, 4 alternativas e 1 completar, sem nenhum widget.

### 1.3 Os problemas de engajamento (inspirados no Duolingo)

1. **Falta motivo para voltar amanhã.** A ofensiva existe (`domain/traveler/streak.ts`), mas conta só por abrir o app, sem precisar fazer nada.
2. **Recompensa longe demais.** A insígnia lendária só vem depois da ilha inteira e do chefe. Falta vitória pequena a cada 3–5 minutos.
3. **Nenhum lembrete.** Sem notificação, a pessoa esquece que o jogo existe.
4. **Pouco social.** O Hall dos Viajantes existe, mas não há disputa semanal nem meta coletiva da turma.

### 1.4 Problemas visuais (ver `imagens/atual-*.png`)

- **Três camadas flutuando ao mesmo tempo:** botão "Contribua" dourado brilhando no topo, botão "Salvar progresso" flutuando sobre o texto e a barra de navegação. No mapa, o "Salvar progresso" cobre a fala da Sintaxe. No módulo, cobre o texto da lição.
- **O "Contribua" chama atenção demais.** O `CLAUDE.md` seção 9 diz que o Pix deve ser discreto e voluntário. Hoje ele é o elemento mais brilhante da tela.
- **Cabeçalho do módulo ocupa ~40% da primeira tela** (perfil, chips, contagem de insígnias e os 22 círculos numerados). O conteúdo começa quase no fim da tela.
- **22 círculos numerados** passam a sensação de "curso longo de escola".
- **A fala da Sintaxe diz "Leia com calma"**, o que reforça que o jogo é de leitura.

### 1.5 O que está ótimo (e não pode ser perdido)

- A identidade visual: fundo escuro, neon, a Senhorita Sintaxe como terminal com rosto, o mapa com órbitas.
- Laboratório com **Postgres de verdade** no navegador (PGlite), **terminal Git** e **PHP em WASM**.
- Os 10 widgets da ilha de Lógica (jogo da velha, tabela verdade, montar o `for`...).
- O chefe de fase, as insígnias com arte própria, o prólogo com escolhas, o Hall e a presença online.
- Os fatos históricos em linha do tempo.

**A mecânica é boa. O problema é que ela aparece tarde demais.**

---

## 2. A visão da mudança

### 2.1 Aprender fazendo (lições em telas curtas)

Cada módulo vira uma sequência de **telas curtas**: no máximo 2–3 frases, um exemplo, e logo um desafio. Uma barra de progresso segmentada no topo, no lugar dos 22 círculos. Botão de fechar no canto. Sem "Contribua" e sem "Salvar progresso" dentro da lição.

Ver `imagens/novo-2-b-licao.png` e `imagens/novo-3-c-desafio.png`.

### 2.2 Menos alternativa, mais código

Novos formatos de desafio, todos jogáveis no celular sem teclado:

- **Toque no bloco que completa o código** (já existe no tipo `QuizItem` com `fill` + `wrong`).
- **Monte a linha:** ordenar blocos de código embaralhados.
- **O que aparece na tela?** Ler um código curto e escolher a saída.
- **Encontre o bug:** tocar na linha errada.
- **Rode você mesmo:** laboratório dentro da lição (SQL, PHP ou Git).

Feedback imediato em barra inferior verde ou vermelha, com +XP e contador de acertos seguidos. Ver `imagens/novo-3-c-desafio.png` e `imagens/novo-4-d-lab.png`.

### 2.3 A Anomalia do Dia (o coração do engajamento)

- Todo dia surge **uma anomalia na linha do tempo**: uma missão de ~3 minutos.
- **A mesma para todos os jogadores**, escolhida pela data. Assim a turma conversa: "já consertou a de hoje?".
- Tipos alternam: caçar o bug, completar o código, comando no terminal, "o que imprime?".
- Recompensa na hora: **XP + Fragmentos Temporais (◆)**.
- O card mostra quantos viajantes da turma já consertaram.

Ver `imagens/novo-1-a-hub.png`.

### 2.4 A Linha do Tempo (ofensiva com a história do Eco)

- Consertou a anomalia do dia: **+1 dia de linha estável**.
- Faltou um dia: **a linha ramifica** e o **Eco** (a cópia com defeito do jogador) avança uma era no mapa. Tensão, sem punição pesada.
- A cada 7 dias seguidos: ganha **1 Âncora Temporal**, que protege um dia perdido.
- Visual: a ofensiva é uma **linha de luz com 7 nós** (dias da semana), não só um número com foguinho.

Ver `imagens/novo-5-e-recompensa.png` e `imagens/novo-6-f-ramificou.png`.

### 2.5 Pequenos eventos (onde o autor quer investir mais)

| Evento | Frequência | O que é |
|---|---|---|
| **Anomalia do Dia** | Diária | Missão de 3 min, igual para todos |
| **Surto Temporal** | Fins de semana | XP em dobro |
| **Eco Solto** | 1x por semana (sexta) | Mini-chefe rápido com prêmio cosmético raro |
| **Convergência** | Mensal | Meta coletiva da turma (ex.: 100 anomalias juntos) desbloqueia um visual para todos |

Todos os eventos vêm de **um arquivo de calendário** (configuração), para o autor criar eventos novos sem mexer em código.

### 2.6 Recompensas frequentes

- XP em cada desafio (já existe).
- **Fragmentos Temporais (◆)**, moeda nova, ganhos em anomalias e eventos.
- Fragmentos compram **itens cosméticos para o avatar** da Praça da Sintaxe (cabelo, cor, acessórios, molduras do terminal).
- Insígnias continuam como estão: comum por módulo, rara pela ilha, lendária pelo chefe.

### 2.7 Lembretes

- Transformar o site em **PWA instalável**, com notificação web opcional.
- Mensagem sempre na voz da Sintaxe: "Detectei uma anomalia na linha do tempo. Só você pode consertar."
- No iPhone, notificação web só funciona com o app adicionado à tela inicial. Mostrar um passo a passo curto.
- Plano B sem código: um boletim diário no grupo de WhatsApp da turma com a anomalia do dia.

### 2.8 Social

- **Liga dos Viajantes:** ranking semanal por XP que **zera todo domingo**, para quem começou atrasado ter chance.
- **Convergência:** meta coletiva (cooperação, não só competição).
- Na Praça da Sintaxe, mostrar a linha do tempo ao lado do avatar de quem está online.

Ver `imagens/novo-7-g-liga.png`.

### 2.9 Limpeza visual

- **"Contribua"** sai do topo de todas as telas e vai para a aba Viajante e Configurações, como link discreto (cumprindo o `CLAUDE.md` seção 9).
- **"Salvar progresso"** deixa de flutuar. Vira um aviso que aparece só em momentos certos (ex.: depois da primeira insígnia) e fica na aba Viajante.
- **Navegação inferior** com 4 abas: Início, Mapa, Liga, Viajante.
- **Nova tela Início** com Linha do Tempo, Anomalia do Dia, "Continuar de onde parou" e evento ativo. O mapa continua existindo na aba Mapa.

### 2.10 Paleta e tipografia (manter as atuais)

Usar os tokens de `tokens.css`, sem criar paleta nova:

| Uso | Token | Cor |
|---|---|---|
| Fundo | `--color-bg` | `#0a0912` |
| Painel | `--color-panel` | `#151225` |
| Ação principal | `--color-purple` | `#9b4dff` |
| Linha do tempo / info | `--color-cyan` | `#5ee7ff` |
| Anomalia / urgência | `--color-orange` | `#ff6b1f` |
| Acerto | `--color-good` | `#3ee0a1` |
| Erro / Eco | `--color-bad` | `#ff5d7a` |
| XP / Âncora / eventos | `--color-gold` | `#ffd479` |

Fontes: Syne (títulos), Instrument Sans (texto), JetBrains Mono (código). **Desligar ligaduras** da JetBrains Mono em blocos de desafio (`font-variant-ligatures: none`), senão `==` e `=>` viram símbolos e confundem iniciantes.

### 2.11 Oficina do Viajante (desafios livres)

Mini projetos curtos em que **o jogador decide como fazer**. Exemplo: "Faça uma mini calculadora".

- **Não impor o jeito:** o jogo confere o **resultado**, não o código. Cada desafio vem com testes (ex.: `2 + 3 → 5`, `6 * 7 → 42`) e alguns testes surpresa. Qualquer solução que passe em todos está certa.
- **Escolher a linguagem antes.** No começo, só as que já têm motor no navegador: **PHP** (já existe em WASM) e **JavaScript** (roda nativo). **Python** entra depois com Pyodide, carregado só quando escolhido. **Java** fica para uma fase futura, porque não tem motor leve para o navegador.
- **Dois modos:** montar com **blocos** (linhas de código reais da linguagem escolhida, com peças a mais para a pessoa escolher o caminho: `if`, `elseif`, `switch`...) ou **escrever código** livremente. Dá para trocar de modo no meio.
- **A Senhorita Sintaxe ajuda sem entregar a resposta.** Ela lê quais testes passaram e falharam e fala em linguagem simples. Dicas em 3 níveis: (1) a ideia, (2) a estrutura, (3) um bloco pronto. Cada nível custa um pouco do XP extra.
- **Depois de acertar:** mostra outras formas certas de resolver (ex.: com `switch`), um **desafio extra** opcional (ex.: não travar com divisão por zero) e o **Mural da turma**, onde cada um publica sua solução e os outros dão estrela.
- A Oficina também alimenta os eventos: a **Eco Solto** de sexta pode ser um desafio livre, e o **Convergência** pode contar oficinas concluídas.

Ver `imagens/novo-8-h-oficina.png`, `imagens/novo-9-i-blocos.png` e `imagens/novo-10-j-solucoes.png`.

---

## 3. As etapas (cole uma por vez no Claude Code)

Ordem pensada para entregar valor rápido e com risco baixo primeiro.

| Etapa | Nome | Tamanho | Risco |
|---|---|---|---|
| 0 | Leitura e plano (sem mexer em código) | Pequeno | Nenhum |
| 1 | Medir onde as pessoas desistem | Pequeno | Baixo |
| 2 | Ajustes rápidos de visual e primeira impressão | Pequeno | Baixo |
| 3 | Motor de lição em telas curtas | Grande | Médio |
| 3.5 | Progresso do quiz por id de pergunta | Médio | Alto (mexe no progresso salvo) |
| 4 | Novos tipos de desafio | Médio | Médio |
| 5 | Converter conteúdo, uma ilha por vez | Grande | Médio |
| 6 | Laboratório dentro da lição | Médio | Médio |
| 7 | Anomalia do Dia | Grande | Médio |
| 8 | Linha do Tempo, Âncora e Eco | Médio | Médio |
| 9 | Fragmentos e cosméticos do avatar | Médio | Baixo |
| 10 | Liga dos Viajantes semanal | Médio | Médio |
| 11 | Calendário de eventos | Médio | Baixo |
| 12 | PWA e lembretes | Grande | Alto |
| 13 | Oficina do Viajante (desafios livres) | Grande | Médio |

> A Etapa 13 depende das Etapas 3, 4 e 6 (motor de telas, desafios e laboratório). Pode ser feita logo depois da Etapa 6, antes da Anomalia do Dia, se você quiser priorizar a prática livre.

---

### Etapa 0 — Leitura e plano (sem mexer em código)

**Objetivo:** o Claude Code entender o projeto e este plano antes de tocar em qualquer coisa.

```text
ETAPA 0 — LEITURA E PLANO. NÃO ALTERE NENHUM ARQUIVO DE CÓDIGO NESTA ETAPA.

1. Leia, nesta ordem: CLAUDE.md, CLAUDE-TEMPO.md, CLAUDE-STORY.md e docs/engajamento/PLANO-ENGAJAMENTO.md (inteiro, incluindo as "Regras de ouro").
2. Veja as imagens em docs/engajamento/imagens/ (atual-* é como está hoje, novo-* é como deve ficar).
3. Crie uma tag de segurança no commit atual da main: git tag antes-do-engajamento && git push origin antes-do-engajamento.
4. Rode npm run lint, npm run typecheck, npm test e npm run build e me diga se tudo passa HOJE (linha de base).
5. Responda com:
   - um resumo em até 10 linhas do que você entendeu do plano;
   - a lista de arquivos que cada etapa (1 a 12) provavelmente vai tocar;
   - riscos que você enxerga para o progresso salvo dos jogadores (localStorage chave arquipelago:progress:v1 e tabelas do Supabase);
   - perguntas para mim antes de começar a Etapa 1.
Não comece a Etapa 1. Espere minha confirmação.
```

**Pronto quando:** a tag existe no GitHub, a linha de base de testes foi informada e as perguntas foram respondidas.

---

### Etapa 1 — Medir onde as pessoas desistem

**Objetivo:** saber, com dados, em que ponto a galera fecha o jogo. Isso guia todas as outras etapas.

```text
ETAPA 1 — MÉTRICAS. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-1-metricas.

Hoje o app já envia page_view, prologue_*, island_opened, module_started, quiz_answered, module_completed,
island_completed, lab_opened, lab_query_run, mission_completed, boss_fight_started/won/lost e eventos de Pix
(conferido na Etapa 0). Os nomes boss_fight_* ficam como estão (decisão do autor).

1. Evento novo, via AnalyticsPort e sem dados pessoais:
   - module_left {island, module, percent} quando o jogador sai de um módulo sem concluir (percent = quanto rolou, arredondado de 10 em 10).
2. Provedor de eventos (decisão do autor, 2026-09-25): a Vercel fica SÓ para visitas (page views), porque eventos
   personalizados exigem plano pago. Os eventos vão para o PostHog (plano gratuito), num adaptador novo em
   src/infrastructure/analytics atrás do AnalyticsPort:
   - sem cookies e sem armazenamento persistente (persistence: 'memory'), sem identificar pessoas, sem autocapture,
     sem gravação de sessão, sem nome/e-mail/telefone/uuid nas props;
   - chave do projeto em variável de ambiente pública (VITE_POSTHOG_KEY / VITE_POSTHOG_HOST); sem chave, cai no NoopAnalytics;
   - biblioteca carregada sob demanda para não pesar o bundle inicial;
   - atualizar a página Privacidade e o CLAUDE.md seção 6 citando o PostHog.

Regras:
- Não mude nenhuma tela nem texto nesta etapa (exceto a página Privacidade).
- Crie testes para qualquer função nova de cálculo (ex.: o percentual).
Ao final: lint, typecheck, test e build verdes. Me explique como criar o projeto grátis no PostHog, onde colocar a chave na Vercel e como ver os eventos.
```

**Pronto quando:** os eventos aparecem no painel do PostHog (Activity) depois do deploy de preview, e as visitas continuam na Vercel.

> Dica para o Gustavo: deixe esta etapa rodando alguns dias no ar antes da Etapa 5. Os dados vão mostrar qual ilha converter primeiro.

---

### Etapa 2 — Ajustes rápidos de visual e primeira impressão

**Objetivo:** tirar a poluição visual e fazer o jogador começar pela parte mais jogável.

```text
ETAPA 2 — AJUSTES RÁPIDOS. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-2-ajustes-rapidos. Veja docs/engajamento/imagens/atual-*.png para entender o problema.

Faça SOMENTE isto:
1. Prólogo (src/content/prologue/script.ts): a recomendação final passa a ser a Era da Lógica em vez da Era dos Dados. Mantenha o tom e as outras falas. Atualize o teste do roteiro se ele verificar esse texto.
2. Mapa: destacar a Era da Lógica como "comece aqui" para quem ainda não concluiu nenhum módulo. As outras eras continuam liberadas (ordem livre).
3. Botão "Contribua": continua existindo, mas discreto (decisão do autor, 2026-09-25, CLAUDE.md seção 9): sem brilho dourado e sem ficar fixo no topo de todas as telas. Fica na aba Viajante/Configurações e no rodapé. O SupportModal, o foguete, o confete e o QR continuam iguais.
4. "Salvar progresso": deixa de ser botão flutuante. Vira (a) um item fixo na aba Viajante e (b) um aviso não intrusivo que aparece uma vez depois da primeira insígnia conquistada. Nada pode cobrir texto ou falas da Sintaxe.
5. Cabeçalho do ModulePage: no máximo 1 linha compacta (voltar, título curto do módulo, XP). Os chips de perfil e o contador de insígnias saem da página do módulo (continuam na aba Viajante).
6. Troque a fala da Sintaxe "Leia com calma..." por algo que convide a jogar, por exemplo: "Bora, {name}. Cada tela é curtinha e no fim tem um paradoxo pra resolver."

Não mude conteúdo de módulos, quiz, chefes nem Supabase.
Teste em 390x844: nenhuma tela pode ter botão cobrindo texto.
Ao final: lint, typecheck, test e build verdes + prints antes/depois do mapa e de um módulo.
```

**Pronto quando:** a primeira tela do módulo mostra o conteúdo logo no topo e não há nada flutuando por cima do texto.

---

### Etapa 3 — Motor de lição em telas curtas

**Objetivo:** trocar o formato "aula + prova" por telas curtas intercaladas com desafios, **sem reescrever o conteúdo**.

```text
ETAPA 3 — MOTOR DE LIÇÃO EM TELAS CURTAS. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-3-telas-curtas. Referência visual: docs/engajamento/imagens/novo-2-b-licao.png e novo-3-c-desafio.png.

Ideia: o conteúdo continua sendo o mesmo array Module.blocks + Module.quiz. O que muda é COMO ele é mostrado.

1. Domínio (src/domain/trail, TypeScript puro, com testes):
   - Crie a função paginateModule(module): LessonScreen[].
   - Regra de corte: cada tela tem no máximo ~60 palavras de texto OU 1 bloco de código/tabela/widget com até 1 parágrafo curto antes. Um título 'h' sempre abre uma tela nova. Notas 'note' e falas 'say' ficam na tela do conteúdo a que se referem.
   - Intercale as perguntas do quiz: depois de cada 2–3 telas de conteúdo, entra 1 pergunta. As perguntas que sobrarem ficam no final. A ordem original das perguntas não muda.
   - Teste: nenhum bloco e nenhuma pergunta pode sumir ou duplicar (compare contagens antes/depois para TODOS os módulos de TODAS as ilhas).
2. Apresentação: crie o LessonPlayer (em src/presentation/features/trail):
   - Barra de progresso segmentada no topo (um segmento por tela), botão × para sair, uma tela por vez, botão principal fixo embaixo ("Entendi" nas telas de conteúdo).
   - Pergunta errada: mostra a explicação e permite tentar de novo, como o QuizRunner faz hoje (mesmas regras de XP de domain/progress/xp.ts).
   - Feedback em barra inferior: verde no acerto (+XP), vermelha no erro. Contador "N seguidas" no topo.
   - Guardar a tela atual no progresso, para o jogador voltar de onde parou. Isso exige um campo novo opcional no ModuleProgress; faça a migração com teste para não quebrar progressos antigos.
3. Feature flag em src/config/exploration.ts: lessonMode = 'telas' | 'rolagem'. Padrão: 'telas'. O modo 'rolagem' (ModulePage atual) continua funcionando e fica acessível em Configurações como "Modo leitura".
4. Emitir o evento module_left com a tela em que o jogador saiu.

Não altere nenhum arquivo em src/content nesta etapa.
Ao final: lint, typecheck, test e build verdes + prints de 3 telas seguidas de um módulo da ilha Lógica e de um do Banco de Dados.
```

**Pronto quando:** qualquer módulo abre em telas curtas, dá para voltar ao modo leitura, e o progresso antigo continua intacto.

---

### Etapa 3.5 — Progresso do quiz por id de pergunta

**Objetivo:** hoje as respostas ficam guardadas pela **posição** da pergunta (`quizResults[índice]`). Se uma pergunta for inserida, reordenada ou convertida, o progresso antigo passa a apontar para a pergunta errada. Esta etapa tira esse risco **antes** das Etapas 4 e 5. (Adicionada pelo autor depois da Etapa 0.)

```text
ETAPA 3.5 — PROGRESSO POR ID DE PERGUNTA. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-3-5-id-pergunta.

1. Conteúdo: cada QuizItem ganha um id estável (único dentro do módulo). Gere os ids para TODAS as perguntas
   existentes, sem mudar texto, ordem nem quantidade. Zod passa a exigir o id e a unicidade.
2. Domínio: quizResults passa a ser indexado por id. O cálculo de XP, desbloqueio, merge (merge.ts) e recap usam o id.
3. Migração (formato continua v1, regra de ouro 12): ao carregar um progresso antigo indexado por posição,
   converter cada índice para o id da pergunta que estava naquela posição NO CONTEÚDO ATUAL. Isso vale para
   localStorage, para o backup da nuvem (progresso_completo) e para códigos de exportação antigos.
   Deve ser idempotente (rodar duas vezes não muda nada) e nunca apagar resultado que não conseguir converter
   (guardar à parte em vez de descartar).
4. Testes: XP de cada jogador igual antes e depois da migração (para um progresso completo de TODAS as ilhas),
   merge entre um progresso antigo e um novo, importação de código antigo.

Não altere textos, ordem ou quantidade de perguntas nesta etapa.
Ao final: lint, typecheck, test e build verdes.
```

**Pronto quando:** um progresso salvo antes da etapa abre com o mesmo XP e os mesmos módulos concluídos.

---

### Etapa 4 — Novos tipos de desafio

**Objetivo:** ter as ferramentas para trocar múltipla escolha por desafios de código.

```text
ETAPA 4 — NOVOS TIPOS DE DESAFIO. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-4-desafios. Referência: docs/engajamento/imagens/novo-3-c-desafio.png.

1. Domínio: amplie QuizItem (src/domain/trail/types.ts) com novos formatos, mantendo os dois atuais 100% compatíveis:
   - 'order': montar a linha. Campos: q, pieces: string[] (na ordem correta), distractors?: string[], explain, hint?
   - 'output': o que aparece na tela? Campos: q, code, lang, options, answer, explain. (Continua sendo escolha, mas sobre código real, não sobre teoria.)
   - 'bug': encontre o bug. Campos: q, lines: string[], bugLine: number, explain, hint?
   Crie validadores e testes no domínio para cada formato (correção da resposta, tentativas, XP).
2. Apresentação: um componente por formato, todos jogáveis só com toque (sem teclado), com área de toque de no mínimo 44px.
   - O formato 'fill' com 'wrong' já vira "toque no bloco": garanta que o visual siga a imagem de referência.
   - Desligue ligaduras da fonte mono nos desafios (font-variant-ligatures: none).
3. Crie UMA pergunta de exemplo de cada formato novo num módulo da ilha Lógica (sem apagar nenhuma pergunta existente), para eu testar.
4. Atualize a seção 10 do CLAUDE.md explicando os formatos novos para quem for criar conteúdo.
5. Testes de não regressão (decisão do autor): hoje eles exigem contagens exatas (ex.: Lógica = 54 perguntas,
   31 alternativas + 23 completar). A regra passa a ser "nenhum conceito sumiu e total ≥ ao atual". ANTES de
   aplicar, mostre ao autor o diff proposto dos nonRegression.test.ts e espere a aprovação.

Ao final: lint, typecheck, test e build verdes + prints de cada formato.
```

---

### Etapa 5 — Converter conteúdo, uma ilha por vez

**Objetivo:** reduzir a múltipla escolha e quebrar a repetição entre ilhas. **Rode esta etapa uma vez para cada ilha**, trocando o nome.

Ordem sugerida: Lógica → Banco de Dados → Python → Java → PHP → Git (ou a ordem que as métricas da Etapa 1 indicarem).

```text
ETAPA 5 — CONVERTER A ILHA <NOME DA ILHA>. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-5-conteudo-<id-da-ilha>. Trabalhe SOMENTE em src/content/trails/<id-da-ilha>/.

Meta para esta ilha:
- No máximo 40% das perguntas continuam como alternativa de teoria. O resto vira 'fill' com 'wrong' (toque no bloco), 'order', 'output' ou 'bug'.
- Cada módulo precisa ter pelo menos 1 desafio em que o jogador mexe em código.
- Parágrafos 'p' com mais de 60 palavras devem ser divididos em frases mais curtas, SEM perder informação. Se um trecho for claramente leitura extra, marque-o como opcional (ex.: bloco 'note' com k "Curiosidade") em vez de apagar.
- Python, Java e PHP não podem ter a mesma sequência de formatos: varie a ordem e os tipos de desafio entre as três.
- Mantenha os fatos históricos, as falas da Sintaxe e as fontes citadas.

Regras de segurança:
- Converter uma pergunta = substituir pelo novo formato cobrindo O MESMO conceito. Nunca apague um conceito.
- Os ids de módulo não mudam (o progresso salvo depende deles).
- Se o nonRegression.test.ts da ilha verificar a quantidade ou o texto das perguntas, NÃO edite o teste sozinho: me mostre o que precisaria mudar e por quê, e espere minha aprovação.

Ao final: tabela antes/depois (por módulo: palavras, alternativas, outros formatos), lint/typecheck/test/build verdes.
```

---

### Etapa 6 — Laboratório dentro da lição

**Objetivo:** trazer o melhor do jogo (Postgres, PHP e Git de verdade) para dentro dos módulos.

```text
ETAPA 6 — LABORATÓRIO DENTRO DA LIÇÃO. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-6-lab-na-licao. Referência: docs/engajamento/imagens/novo-4-d-lab.png.

1. Novo tipo de bloco em Block (src/domain/trail/types.ts): { t: 'try', engine: 'sql' | 'php' | 'git', brief, starter, solution | verify+expect, hint }.
   Reaproveite a lógica de verificação das missões SQL existentes (Mission 'select' e 'state') e do domínio do Git (src/domain/lab). Nada de duplicar motor.
2. O LessonPlayer mostra o bloco 'try' como uma tela própria: editor curto, barra de atalhos de toque (WHERE, =, AND, ;...), botão "Rodar", resultado e "bateu com o esperado ✓".
3. Os engines (PGlite e PHP WASM) devem ser carregados só quando uma tela 'try' aparecer (lazy), para não pesar a lição.
4. Adicione 1 bloco 'try' em 2 módulos do Banco de Dados (where e join) e 1 em um módulo de Git, como piloto.
5. As páginas de laboratório atuais (/laboratorio) continuam existindo sem mudança.

Ao final: lint, typecheck, test e build verdes + prints no celular + tamanho do bundle antes/depois.
```

---

### Etapa 7 — Anomalia do Dia

**Objetivo:** criar o motivo diário para voltar.

```text
ETAPA 7 — ANOMALIA DO DIA. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-7-anomalia-do-dia. Referência: docs/engajamento/imagens/novo-1-a-hub.png.

1. Conteúdo: crie src/content/anomalies/ com um banco de anomalias (comece com 30, cobrindo as ilhas que existem).
   Cada anomalia: id, era (id da ilha), título curto, história de 1 frase envolvendo o Eco, e UM desafio usando os formatos das Etapas 4 e 6. Duração alvo: até 3 minutos.
2. Domínio (puro, testado):
   - pickAnomaly(dateISO, pool): escolhe a anomalia do dia de forma determinística pela data no fuso America/Sao_Paulo. Todo mundo recebe a mesma no mesmo dia. Não repetir a mesma anomalia em menos de 20 dias.
   - Anomalias de eras que o jogador ainda não abriu são permitidas, mas devem ser do nível "Base".
   - Recompensa: +30 XP e +10 Fragmentos Temporais (a moeda entra na Etapa 9; por enquanto só registre o valor no progresso).
3. Supabase: tabela anomalias_resolvidas (uuid do jogador, anomalia_id, dia, resolvida_em), com RLS no mesmo padrão das tabelas existentes em supabase/schema.sql. Escreva a migração SQL em supabase/ e NÃO rode nada no banco: me entregue o SQL para eu aplicar.
   Contagem pública "N viajantes já consertaram" por dia, sem expor nomes.
4. Apresentação: nova tela Início (rota /) com o card da Anomalia do Dia no topo e "Continuar de onde parou" logo abaixo. O mapa atual vai para a rota /mapa e para a aba Mapa. Navegação inferior: Início, Mapa, Liga (pode ficar "em breve"), Viajante.
   O prólogo continua abrindo na primeira visita.
5. Offline (sem Supabase configurado): a anomalia funciona igual, só sem o contador da turma.
6. Eventos: anomaly_opened {anomaly}, anomaly_solved {anomaly, tries}.

Ao final: lint, typecheck, test e build verdes + prints.
```

---

### Etapa 8 — Linha do Tempo, Âncora Temporal e o Eco

**Objetivo:** transformar a ofensiva em história (história do Eco, enredo original do CLAUDE-TEMPO.md).

```text
ETAPA 8 — LINHA DO TEMPO. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-8-linha-do-tempo. Referências: novo-1-a-hub.png, novo-5-e-recompensa.png e novo-6-f-ramificou.png.

1. Domínio (src/domain/traveler/streak.ts e testes):
   - O dia só conta quando o jogador consertar a Anomalia do Dia OU concluir uma lição inteira. Abrir o app deixa de contar.
   - MIGRAÇÃO: quem já tem ofensiva mantém o número atual. A regra nova vale a partir do deploy.
   - Âncora Temporal: +1 a cada 7 dias seguidos, máximo 3 guardadas. Se o jogador perder 1 dia e tiver âncora, pode usá-la para manter a linha.
   - Linha ramificada: perdeu o dia sem usar âncora, a sequência volta a 1 e o Eco avança 1 era (guardar "posição do Eco" no progresso).
   - Todas as datas no fuso America/Sao_Paulo.
2. Apresentação:
   - Componente LinhaDoTempo: linha de luz com 7 nós (dias da semana), nó de hoje pulsando em laranja, dias feitos em ciano. Substitui o foguinho no Início.
   - Tela de recompensa depois da anomalia (número grande de dias, progresso até a próxima âncora, botão "Mandar pra turma" usando navigator.share quando existir).
   - Tela "A linha ramificou" ao abrir o app depois de perder um dia, com opção de usar a âncora.
   - No mapa, o Eco aparece como um terminal vermelho perto da era em que ele está.
3. Nada de punição além disso: XP, insígnias e módulos nunca são perdidos.

Ao final: lint, typecheck, test e build verdes + testes cobrindo virada de dia, âncora e migração.
```

---

### Etapa 9 — Fragmentos Temporais e cosméticos do avatar

**Objetivo:** dar valor ao que o jogador ganha todo dia.

```text
ETAPA 9 — FRAGMENTOS E COSMÉTICOS. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-9-fragmentos.

1. Domínio: Fragmentos Temporais (◆) guardados como HISTÓRICO de ganhos e gastos (cada lançamento com id único); o saldo é sempre calculado a partir do histórico, nunca guardado solto. O merge entre aparelhos faz a união dos lançamentos por id, para não perder nem duplicar ◆ com dois aparelhos (decisão do autor). Testes para saldo nunca negativo e para o merge.
2. Conteúdo: catálogo de cosméticos em src/content/cosmetics/ (molduras do terminal, cores, acessórios, cabelos), cada um com preço em ◆ e raridade. Alguns itens só saem em eventos (não podem ser comprados).
3. Integrar com o avatar da Praça da Sintaxe que já existe (não recriar a Praça). Itens equipados salvos no Supabase junto do avatar.
4. Tela "Loja do Viajante" dentro da aba Viajante.
5. Nada de compra com dinheiro real. Os ◆ só se ganham jogando.

Ao final: lint, typecheck, test e build verdes + prints.
```

---

### Etapa 10 — Liga dos Viajantes semanal

**Objetivo:** competição leve que recomeça toda semana.

```text
ETAPA 10 — LIGA DOS VIAJANTES. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-10-liga. Referência: docs/engajamento/imagens/novo-7-g-liga.png.

1. Supabase: registrar XP ganho por semana (semana começa segunda 00:00 e termina domingo 23:59, fuso America/Sao_Paulo). Pode ser uma tabela xp_semanal ou uma view a partir de eventos de XP. Explique a escolha. Entregue o SQL com RLS para eu aplicar; não rode nada no banco.
2. Aba Liga: ranking da semana (avatar, nome, dias de linha, XP), com o jogador destacado e contagem regressiva para o reset.
3. Linha "top 3 ganham o selo da semana" (selo cosmético guardado no perfil). Sem rebaixamento nem punição.
4. Proteção básica (decisão do autor: por enquanto só isso, a turma é pequena): XP por semana com teto razoável validado no servidor, para não aceitar valores absurdos do cliente. Deixe TODO(autor) para o valor do teto.

Ao final: lint, typecheck, test e build verdes + prints.
```

---

### Etapa 11 — Calendário de eventos

**Objetivo:** o autor criar eventos sem programar.

```text
ETAPA 11 — CALENDÁRIO DE EVENTOS. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-11-eventos.

1. Arquivo de configuração src/content/events/calendar.ts com eventos datados. Tipos:
   - 'surto': multiplicador de XP (ex.: 2x) entre duas datas. Padrão: todo fim de semana.
   - 'eco-solto': mini-chefe rápido (reusar o motor de src/domain/bossFight com 3 rodadas) com prêmio cosmético raro. Padrão: toda sexta.
   - 'convergencia': meta coletiva (ex.: 100 anomalias da turma no mês) que libera um cosmético para todos quando atingida. Contagem pelo Supabase.
2. Domínio puro para: evento ativo em uma data, multiplicador de XP aplicado, progresso da meta da Convergência.
3. Início e Liga mostram o evento ativo (faixa discreta, como na imagem novo-1-a-hub.png) e o card da Convergência.
4. Documente no CLAUDE.md como eu (autor) crio um evento novo só editando calendar.ts.

Ao final: lint, typecheck, test e build verdes.
```

---

### Etapa 12 — PWA e lembretes

**Objetivo:** o jogo lembrar o jogador de voltar. É a etapa mais complexa: faça por último.

```text
ETAPA 12 — PWA E LEMBRETES. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-12-lembretes.

Parte A (faça primeiro e pare para eu testar):
- Verifique se o app já é PWA instalável (manifest, ícones, service worker). Complete o que faltar. (Na Etapa 0: existe só o manifest; ainda não há service worker nem modo offline.)
- Tela curta "Adicionar à tela inicial" com instruções para Android e para iPhone, mostrada uma vez depois da primeira anomalia resolvida (evento install_prompt_shown).

Parte B (só depois que eu aprovar a A):
- Notificação web opcional (Web Push). O jogador escolhe o horário. Pedir permissão só depois que ele tocar em "Quero ser lembrado", nunca ao abrir o app.
- Envio pelo Supabase (Edge Function agendada) com chaves VAPID em variáveis de ambiente, nunca no repositório.
- Texto sempre na voz da Sintaxe, curto, sem culpa exagerada. Máximo 1 lembrete por dia, e nenhum se a anomalia do dia já foi resolvida.
- Explique as limitações no iPhone (só funciona com o app instalado na tela inicial).

Ao final: lint, typecheck, test e build verdes + passo a passo para eu configurar as chaves no Supabase e na Vercel.
```

---

### Etapa 13 — Oficina do Viajante (desafios livres)

**Objetivo:** mini projetos em que o jogador escolhe a linguagem e o jeito de resolver, com a Sintaxe ajudando.

Faça em **duas partes**, parando para teste entre elas.

```text
ETAPA 13A — OFICINA: MOTOR E MODO ESCREVER. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Branch: etapa-13-oficina. Referências: docs/engajamento/imagens/novo-8-h-oficina.png e novo-10-j-solucoes.png.

Princípio: o jogo confere o RESULTADO, nunca a forma do código. Qualquer solução que passe nos testes está certa.

1. Domínio (puro, testado), em src/domain/workshop/:
   - Tipo Workshop: id, título, história de 1 frase (com o Eco), enunciado curto, nível, linguagens permitidas, entradas (variáveis que o desafio já entrega prontas, ex.: $a, $b, $op), testes visíveis e testes surpresa (entrada → saída esperada), desafio extra opcional, soluções de referência por linguagem (para mostrar "outros jeitos" DEPOIS do acerto) e escada de dicas em 3 níveis.
   - Comparação de saída tolerante: ignorar espaços e quebra de linha no fim, aceitar 5 e 5.0 quando o teste for numérico.
   - XP: +50 ao passar em todos os testes, +25 pelo desafio extra, menos 10 por nível de dica usado (nunca abaixo de 20).
2. Infraestrutura: porta CodeRunnerPort com run(linguagem, código, entradas) → { saída, erro, tempo }.
   - PHP: reaproveitar o PhpWasmEngine existente.
   - JavaScript: executar num Web Worker isolado, sem acesso a DOM, rede ou storage, com limite de tempo (ex.: 2 s) para laço infinito não travar o celular.
   - Python: deixe TODO(autor) preparado para Pyodide carregado sob demanda. Não inclua agora.
   - Java: não oferecer por enquanto.
   - Cada teste roda com suas entradas injetadas como variáveis antes do código do jogador.
3. Conteúdo: src/content/workshops/ com 6 oficinas iniciais de nível Base: mini calculadora, par ou ímpar, tabuada, maior de três números, contador de vogais, conversor de temperatura.
4. Apresentação (modo escrever primeiro):
   - Tela de escolha: história da Sintaxe, enunciado, testes visíveis, escolha de linguagem.
   - Editor com barra de atalhos de toque (como no laboratório SQL), botão "Testar", contador de testes (ex.: 3/5).
   - Sintaxe explica em linguagem simples qual teste falhou e o que saiu vs. o que era esperado. Nunca mostra a solução antes do acerto.
   - Tela de sucesso: "outros jeitos certos" com as soluções de referência, desafio extra opcional.
   - Entrada pela tela Início (card "Oficina") e dentro de cada ilha, depois do módulo relacionado.
5. Eventos: workshop_started {workshop, lang}, workshop_test_run {workshop, passed, total}, workshop_solved {workshop, lang, hints}.

Não altere módulos, quizzes, chefes nem laboratórios existentes.
Ao final: lint, typecheck, test e build verdes + prints. PARE e espere eu testar antes da 13B.
```

```text
ETAPA 13B — OFICINA: MODO BLOCOS, DICAS E MURAL. Siga as Regras de ouro de docs/engajamento/PLANO-ENGAJAMENTO.md.
Mesma branch da 13A (ou etapa-13b-oficina-blocos). Referência: docs/engajamento/imagens/novo-9-i-blocos.png.

1. Modo blocos:
   - Cada oficina define, por linguagem, uma PALETA de blocos: linhas de código reais da linguagem (if, elseif, switch, atribuições, echo/print...), incluindo peças que levam a caminhos diferentes. NÃO é uma resposta embaralhada: a pessoa escolhe quais usar.
   - Toque adiciona o bloco no fim; arrastar muda a ordem; blocos de abertura/fechamento ({ }) controlam a indentação; segurar abre edição do valor (ex.: trocar "+" por "*").
   - Os blocos viram código de verdade e passam pelo mesmo CodeRunnerPort e pelos mesmos testes do modo escrever.
   - Botão para alternar entre blocos e escrever sem perder o que já foi feito (blocos → texto sempre; texto → blocos só se o código ainda couber na paleta, senão avisar).
2. Dicas da Sintaxe em 3 níveis (ideia, estrutura, bloco pronto), com o custo de XP da 13A. As mensagens usam o resultado dos testes (ex.: "soma e subtração já funcionam, o teste 6 * 7 ainda não tem resposta").
3. Mural da turma (Supabase):
   - Tabela solucoes_oficina (uuid do jogador, workshop_id, linguagem, código, criada_em) e estrelas_solucao (uuid de quem deu, solução). RLS no padrão do schema.sql. Entregue o SQL; não rode no banco.
   - Só aparece no mural quem tocar em "Publicar no mural". Limite de tamanho do código e filtro básico de palavrões.
   - O mural de uma oficina só abre DEPOIS que o jogador resolve ela (para não copiar).
4. Integração com eventos (Etapa 11), se ela já existir: a Eco Solto pode apontar para uma oficina, e a Convergência pode contar oficinas resolvidas.

Ao final: lint, typecheck, test e build verdes + prints do modo blocos no celular (390x844).
```

---

## 4. Decisões em aberto (Gustavo decide)

| Decisão | Recomendação |
|---|---|
| O que conta como "dia jogado" na linha do tempo | Anomalia do Dia **ou** uma lição completa |
| Quantas âncoras o jogador pode guardar | Até 3 |
| Horário da virada do dia | Meia-noite de Brasília |
| A Liga é da turma toda ou dividida em grupos | Turma toda no começo; dividir quando passar de 50 jogadores ativos |
| Recompensa da Liga | Selo cosmético semanal, sem rebaixamento |
| Nome da moeda | Fragmentos Temporais (◆) |
| Lembretes | Começar pelo grupo de WhatsApp enquanto a Etapa 12 não fica pronta |

### Decididas pelo autor depois da Etapa 0 (2026-09-25)

| Decisão | Resposta |
|---|---|
| Custos | Projeto 100% gratuito: Vercel Hobby, Supabase Free, PostHog Free (regra de ouro 11) |
| Métricas | Vercel só para visitas; eventos no PostHog Free, sem cookies e sem dados pessoais, via AnalyticsPort |
| Nomes | Liga dos Viajantes, Eco Solto e Convergência (nada de nomes de obras existentes) |
| Pix | O botão continua, mas discreto: sem brilho dourado e sem ficar fixo no topo de todas as telas |
| Posição das perguntas | Progresso passa a usar id de pergunta, na Etapa 3.5, antes da Etapa 4 |
| Testes de não regressão | Regra "nenhum conceito sumiu e total ≥ ao atual", mostrada ao autor antes de aplicar |
| Formato salvo | Continua v1, só com campos opcionais novos |
| Fragmentos | Histórico de ganhos e gastos, não saldo solto |
| XP falso na Liga | Por enquanto só teto no servidor |
| Etapa 1 | Só adicionar module_left; manter os nomes boss_fight_* |
| Linguagens da Oficina no lançamento | PHP e JavaScript; Python depois; Java no futuro |
| Mural da turma | Só abre depois de resolver a oficina, e publicar é opcional |
| Sintaxe com IA de verdade nas dicas | Não no começo (exigiria servidor e custo por uso). Dicas prontas em 3 níveis + leitura dos testes resolvem bem |

---

## 5. Como saber se deu certo

Acompanhe no painel da Vercel e no Supabase:

- **Quantos voltam no dia seguinte** (principal métrica do Duolingo).
- **Quantos chegam a 7 dias de linha estável.**
- **Em qual tela as pessoas saem** (evento `module_left`). Se a saída se concentrar numa tela, o problema é aquela tela.
- **Anomalias resolvidas por dia** e progresso do Convergência.

Mudança boa é mudança medida: compare os números antes da Etapa 2 com os de depois da Etapa 8.

---

## 6. Índice das imagens

| Arquivo | O que mostra |
|---|---|
| `atual-1-prologo.png` | Prólogo atual (está bom, manter) |
| `atual-2-mapa.png` | Mapa atual: "Salvar progresso" cobrindo a fala da Sintaxe e "Contribua" em destaque |
| `atual-3-modulo.png` | Módulo atual: cabeçalho ocupando ~40% da tela e texto longo |
| `atual-4-quiz.png` | Quiz atual: múltipla escolha no fim do módulo |
| `novo-1-a-hub.png` | Nova tela Início: Linha do Tempo, Anomalia do Dia, continuar, evento ativo |
| `novo-2-b-licao.png` | Lição em tela curta com a Sintaxe |
| `novo-3-c-desafio.png` | Desafio "toque no bloco" com feedback de acerto |
| `novo-4-d-lab.png` | Laboratório SQL dentro da lição |
| `novo-5-e-recompensa.png` | Recompensa depois da anomalia, progresso até a Âncora |
| `novo-6-f-ramificou.png` | A linha ramificou: o Eco avançou, opção de usar a âncora |
| `novo-7-g-liga.png` | Liga dos Viajantes semanal com Convergência e Eco Solto |
| `novo-8-h-oficina.png` | Oficina: história, testes visíveis, escolha de linguagem e modo |
| `novo-9-i-blocos.png` | Oficina: montando a calculadora com blocos e a Sintaxe comentando os testes |
| `novo-10-j-solucoes.png` | Oficina: sucesso, outros jeitos certos, mural da turma e desafio extra |
| `painel-todas-as-telas.png` | Todas as telas novas lado a lado |
| `mockups-fonte.html` | Código das telas novas (o Claude Code pode abrir para copiar medidas e cores) |

As imagens PNG ainda mostram os nomes antigos ("Liga da TVA", "Evento Nexus", "Variante solta"); valem os nomes novos deste documento.

Os mockups são referência de **direção visual**, não um layout para copiar pixel a pixel. Os componentes reais devem usar os tokens de `tokens.css` e o design-system existente.

---

## 7. Pendências (fora das etapas)

Coisas que ficaram para depois. Nenhuma etapa deve fazê-las sem o autor pedir.

| Desde | Pendência | O que falta |
|---|---|---|
| Etapa 1 | **Configurar as métricas de eventos** | O código já envia os eventos para o PostHog, mas nada sai enquanto não houver chave. Falta: criar o projeto no PostHog (plano Free), ligar "Discard client IP data" em Settings → Project, criar `VITE_POSTHOG_KEY` e `VITE_POSTHOG_HOST` na Vercel (Production e Preview) e fazer um novo deploy. Também ligar a aba **Analytics** do projeto na Vercel para contar visitas. Detalhes em `.env.example` e `src/config/analytics.ts`. |
| Etapa 1 | Saídas não contadas no celular | Quem só troca de app e tem a aba fechada pelo sistema em segundo plano pode sair sem gerar `module_left`. |
| Etapa 1 | `module_left` em telas | Na Etapa 3, o `percent` do `module_left` passa a contar telas vistas, não rolagem. |
| Etapa 2 | Pix fora do mapa | Decisão do autor: na tela do mapa (sem rodapé) o Pix fica só na aba Viajante. Nada a fazer. |
| Etapa 2 | Nível do módulo | O nível ("Base", "Intermediário"...) saiu da página do módulo junto com a linha antiga do topo. Voltar de forma discreta dentro do LessonPlayer, na Etapa 3. |
