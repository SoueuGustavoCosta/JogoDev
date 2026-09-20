# CLAUDE-TEMPO.md — Branch definitiva: "Viajante do Tempo"

Este arquivo **complementa** o `CLAUDE.md` (arquitetura em camadas, mobile primeiro, métricas sem login, Pix, testes). Onde houver conflito de tema ou vocabulário, vale este arquivo. A direção RPG foi **descartada**; não use o que estiver em `_descartados/`.

## 0. Como trabalhar nesta branch

```bash
git checkout -b feat/time-traveler-theme
```

- Referências visuais e de comportamento: `Viajante_do_Tempo_Telas.html` (prólogo com diálogo, salto com paradoxo; **a tela 2, em forma de lista, foi substituída pelo mapa**), `Mapa_do_Tempo_Teste.html` (**home em forma de mini mapa**, a versão que vale) e `Viajante_do_Tempo_3D_Prototipo.html` (3D com giroscópio). Abra e reproduza.
- **Princípio:** o tema é uma camada de apresentação e de narrativa. O conteúdo técnico (módulos, quiz, missões) continua independente do tema, como no `CLAUDE.md`. O que muda é a moldura: eras, saltos, paradoxos, cristais.

## 1. Conceito

O aluno é um **viajante do tempo**. A Linha do Tempo da Tecnologia rachou: as eras ficaram embaralhadas e ninguém lembra **por que** as coisas foram inventadas. Ele viaja por cada era, descobre o problema que as pessoas enfrentavam, resolve os **paradoxos** que travam o tempo e acende **cristais**. Aprender *por que* algo existe é o coração do produto: cada lição parte de um problema real da época e chega na solução.

Guia: a **Sintaxe**, um **mini terminal flutuante** (a mesma janela estilo notebook da marca, com três bolinhas), com olhos brilhantes de cursor, um sorriso laranja, chaves `{ }` e um ponto e vírgula flutuando ao redor, e uma linha de texto que "digita" as falas, personagem **original** (não copie mascotes nem personagens existentes; em particular, **não faça nada parecido com o mascote-relógio de séries ou filmes**: a Sintaxe é um terminal, com identidade visual própria). Fala em tom acolhedor, direto e com um pouco de humor.

### Enredo central (proposta): o bug é a sua própria cópia

Inspiração declarada: histórias de viagem no tempo em que o herói persegue uma versão alternativa de si mesmo. **Não use nomes, termos, personagens, organizações ou cenas de nenhuma obra existente** (nada de agências do tempo, "variantes", "linha sagrada" e afins). O enredo abaixo é original.

- A Sintaxe conta que a Linha do Tempo racha porque existe um **Eco**: uma cópia com defeito do próprio viajante, que passou por cada era fazendo o "atalho errado" (a gambiarra que parece resolver e quebra tudo depois). O Eco é o **bug** da história.
- Em cada era, o viajante encontra **rastros** do Eco: uma decisão de projeto ruim que trava a época (dados espalhados sem estrutura, uma consulta sem filtro, um erro de lógica). Os **paradoxos** são esses rastros: acertar o quiz ou a missão no laboratório "conserta" o rastro.
- Metáfora pedagógica: **depurar é enfrentar o seu próprio erro**. O Eco fala com o viajante ("eu só quis fazer mais rápido!"), e a Sintaxe mostra a forma certa. Errar no quiz nunca é punição: é o Eco ganhando uma rodada, e a dica da Sintaxe ensina o caminho.
- Arco: começa no prólogo (pista de que o Eco existe), aparece em pequenos encontros nos saltos, e tem um encontro final ao concluir cada era (um desafio prático, como uma missão do laboratório). No fim da primeira era, o viajante descobre que o Eco não é vilão, é o **aprendiz que ele mesmo foi**. Ideia de fechamento para depois: o Eco vira aliado.
- Regras de tom: leve, curioso, sem violência, sem sarcasmo com quem erra. As falas do Eco e da Sintaxe são **texto**; sem voz gravada por padrão.
- Escopo: o enredo é uma camada fina de falas e ilustrações. Ele **não altera** os 22 módulos nem o laboratório. Se atrapalhar a leitura da lição, corte a fala e mantenha o conteúdo técnico.

### Essência do projeto (não negociável)

O coração do produto é o material que o autor já construiu: o **segundo HTML gerado**, `Trilha_PostgreSQL_com_Laboratorio.html`, com **22 módulos** de PostgreSQL (lições, quizzes, XP, troféu) e o **laboratório SQL** em que o aluno escreve e executa código de verdade no navegador (PGlite, com 12 missões). O viajante do tempo é a **moldura narrativa** em volta disso, nunca um substituto. Regras:

1. **Nenhum dos 22 módulos é removido, resumido ou fundido.** O texto, os exemplos, os quizzes e os resultados exibidos migram como estão (ajustes só de forma, para caber no tema).
2. **O laboratório SQL continua sendo uma parte central**, com os dois bancos ("Loja de exemplo" e "Banco vazio"), o botão "Abrir no laboratório" em todo bloco de código, os comandos `\dt` e `\d`, as dicas de erro em português e as **12 missões** com verificação automática. Ele passa a se chamar "Máquina do Tempo" na interface, mas faz exatamente o mesmo.
3. **A história é um acréscimo.** Os saltos históricos (IMS, Codd, SQL, Postgres...) ganham cenas da Sintaxe e paradoxos novos, mas os 22 módulos continuam completos dentro deles.
4. **Teste de não regressão obrigatório no CI:** o conteúdo migrado deve ter 22 módulos, todos os quizzes do protótipo e 12 missões, e todos os blocos de SQL devem executar no PGlite como no protótipo. Se algum número cair, o CI falha.
5. Em caso de dúvida entre "encaixar a narrativa" e "preservar o conteúdo técnico", **preserve o conteúdo técnico**.

**Como os 22 módulos se distribuem pelos saltos da Era dos Dados** (agrupamento por assunto; os carimbos de data só usam fatos conferidos da seção 6):

| Salto | Módulos do protótipo que ficam nele |
|---|---|
| 1 · IMS e o foguete (1963–1969) | 1 Por que existem bancos de dados |
| 2 · Bancos navegacionais (anos 1960 a 1971) | 2 Tipos de bancos, 3 Arquitetura do SGBD |
| 3 · Modelo relacional (1970) | 7 Modelo relacional e chaves, 12 Modelagem MER e DER, 14 Álgebra relacional, 17 Normalização |
| 4 · SEQUEL, System R e SQL (1973–1979) | 5 Sintaxe e indentação, 6 Tipos de dados, 8 CREATE DATABASE e TABLE, 9 INSERT e SELECT, 10 WHERE, ORDER BY, LIMIT, 11 UPDATE e DELETE, 13 Relacionamentos e JOIN, 15 Agregações e GROUP BY, 16 Subconsultas, CTE e janelas |
| 5 · Padronização do SQL (1986–1987) | Novo: dialetos e padrão SQL (com quiz). Sem módulo antigo obrigatório. |
| 6 · Do POSTGRES ao PostgreSQL (1986–1996) e o uso no dia a dia | 4 Conhecendo a interface, 18 Índices e desempenho, 19 Transações e concorrência, 20 Views, funções e triggers, 21 Segurança e permissões, 22 Projeto final |

Os saltos 7, 8 e 9 (objetos, NoSQL, hoje) são novos. O aluno vê todos os 22 módulos, na mesma ordem lógica de aprendizado do protótipo dentro de cada salto. O troféu final da Era dos Dados só libera depois dos 22 módulos e do projeto final.

### Foco no produto: a Sintaxe

A trilha total será enorme (lógica, banco de dados, linguagens, Git e GitHub, Docker, web e mais), mas **o foco é a sintaxe**: aprender a *escrever* código. Por isso:

- A **Praça da Sintaxe** é o centro do mapa e o ponto de partida recomendado: pontuação, indentação, nomes, comentários, blocos e o "jeito de ler" código. É conteúdo transversal (vale para quase toda linguagem), com o módulo "Sintaxe e indentação" do protótipo como base.
- Cada era mantém uma **cola de sintaxe** própria (SQL na Era dos Dados, depois Java, Python, PHP, comandos Git, Dockerfile), acessível da própria era e da Praça. O **laboratório** (Máquina do Tempo) é onde o aluno pratica essa sintaxe de verdade.
- A Sintaxe é a guia em todas as eras; os coadjuvantes abaixo cuidam de temas específicos.

### Elenco de apoio (personagens originais)

Além da **Sintaxe** (guia principal), o mundo tem personagens que aparecem no mapa como pequenos ícones flutuantes e que falam quando tocados:

| Personagem | Forma | Papel |
|---|---|---|
| **Dona Vírgula** | um `;` ciano | Guardiã das regras de escrita: pontuação, parênteses, erros de sintaxe. Aparece perto da Praça da Sintaxe |
| **Seu Bloco** | um par `{ }` laranja | Guarda de blocos e escopo: funções, laços, condições. Aparece perto das Eras da Lógica e das Linguagens |
| **Compila** | um losango azul | Construtora: transforma código em programa e leva ao ar (build, Docker, deploy). Aparece perto da Era das Nuvens |
| **O Eco** | um triângulo vermelho com "!" (glitch) | O bug: a cópia com defeito do viajante. Aparece como "rastro" nas eras que ainda têm paradoxos a resolver |

Observações: "Seu Bloco" foi o nome escolhido no lugar de "Chaves", que remete a um personagem famoso da TV. Todos são **originais** e simples (glifos de código). Falas curtas, sem voz gravada, tom acolhedor. Cada personagem tem uma fala de apresentação e dicas contextuais, nunca interrompe uma lição.

### Vocabulário

| Conceito neutro (código) | Na interface |
|---|---|
| App | Viajante do Tempo (nome provisório) |
| Trail | Era (ex.: Era dos Dados) |
| Module | Salto (uma parada em um ano ou período) |
| QuizItem | Paradoxo |
| XP | XP (mantido) e **cristais** (um por salto concluído) |
| Lab | Máquina do Tempo (laboratório onde o código roda de verdade) |
| Troféu da trilha | Artefato da era |
| Contribuição | "Colabore com o projeto" (link discreto; no modal, "abastecer a máquina do tempo") |

O código continua com `Trail`, `Module`, `QuizItem`. O vocabulário vive em `presentation/themes/time/copy.ts`.

## 2. Fluxo de primeira abertura (prólogo)

1. Tela cheia, fundo estrelado. A **Sintaxe** aparece e diz: "Olá, viajante do tempo. Qual é o seu nome?"
2. Campo de texto (máx. 20 caracteres, fonte de 16 px ou mais) + botão Enviar. Nome vazio vira "Viajante".
3. A Sintaxe responde usando o nome, se apresenta e conta o que aconteceu: a Linha do Tempo rachou e ninguém lembra por que as tecnologias foram inventadas.
4. Diálogo curto com **escolhas** do aluno (ex.: "Isso é sério?" / "O que eu preciso fazer?"), cada uma com uma resposta da Sintaxe, e depois convite para começar pela **Era dos Dados**.
5. Botão "Ir para a Era dos Dados". O nome fica salvo no navegador e aparece no cabeçalho e nas falas da Sintaxe.

Requisitos: balões de conversa com animação curta (desligada em `prefers-reduced-motion`), botão "Pular" sempre visível para quem já viu o prólogo, e possibilidade de trocar o nome depois na aba Viajante. Sem login, sem envio do nome para nenhum servidor e **sem o nome nos eventos de métricas**.

## 3. Estrutura do mundo

- **Home = Mini Mapa do Tempo (não é lista):** um mapa navegável que o aluno arrasta e amplia com os dedos (pinça). No **centro** fica a **Praça da Sintaxe** (o foco do produto) e, ao redor, as **eras** como estações ligadas a ela por caminhos luminosos. Cada era mostra ícone, nome, anel de progresso e etiqueta (Nova, Em breve). Eras futuras aparecem como **névoa** (inexplorada). Um **marcador** mostra onde o viajante está; ao tocar em uma era e em "Viajar até aqui", o marcador percorre o caminho e a câmera o acompanha. Há **minimapa** no canto (com a área visível e o marcador; tocar nele recentraliza), botões de zoom e "centralizar em mim". **Todas as eras abertas.** Sub-nós, como Java, Python e PHP ao redor da Era das Linguagens, mostram o que existe dentro de cada era. O mapa é SVG ou canvas leve, com alvos de 44 px ou mais, `aria-label` em cada nó, navegação por teclado (Tab e Enter) e alternativa em lista para leitores de tela.
- **Dentro de uma era:** os saltos aparecem em ordem cronológica (é a ordem natural de aprender *por que*). Modo "Explorar livremente" configurável, como no `CLAUDE.md`.
- **Salto (tela de lição):**
  1. Carimbo de data e lugar (ex.: "1970 · IBM, EUA").
  2. Fala da Sintaxe situando o problema da época.
  3. Conteúdo da lição (blocos do `CLAUDE.md`: texto, código, tabelas, laboratório).
  4. **Paradoxo:** pergunta que "trava o tempo" e é resolvida acertando. Errar **nunca** penaliza: só "Ainda não, tente outra opção". XP: 100 de primeira, 40 depois, +150 ao concluir o salto (regras do `CLAUDE.md`).
  5. Cristal aceso, confete curto, botão "Saltar para o próximo ano".
- **Navegação inferior (celular):** Eras, Viajante, Máquina do Tempo e Mais (44 px ou mais). A colaboração fica em "Mais" e no rodapé, não na barra.
- **Aba Viajante:** nome, nível, cristais, artefatos das eras, exportar/importar progresso.

## 3D e interação com o celular (camada opcional de encanto)

Referência: `Viajante_do_Tempo_3D_Prototipo.html` (Three.js, funciona no celular). Ele mostra o que é possível: um **túnel do tempo** em 3D, a Sintaxe como um **terminal 3D** que reage à **inclinação do aparelho** (giroscópio), um **salto com efeito de dobra** (a câmera acelera pelo túnel) e as eras como painéis no fundo do túnel, que o aluno percorre arrastando.

Regras para levar isso ao app:

1. **É um reforço, não uma dependência.** As lições, os quizzes e o laboratório funcionam 100% sem o 3D. Onde o WebGL falhar ou o aparelho for fraco, mostre a versão 2D simples da linha do tempo.
2. **Carregamento tardio:** Three.js só é carregado quando o aluno abre o prólogo ou a Linha do Tempo, com `import()` dinâmico e sem entrar no bundle inicial. Use apenas os módulos necessários (tree shaking) para não pesar no celular.
3. **Onde usar 3D** (e só aí): prólogo com o terminal 3D, Linha do Tempo (túnel), transição entre saltos (dobra curta de 1 a 3 s), cristal de recompensa. **Não use 3D dentro das lições** (texto, código, laboratório), que precisam de leitura e desempenho.
4. **Giroscópio (DeviceOrientation):** no iOS exige permissão pedida por um toque do aluno (botão "Ativar movimento"); no Android costuma funcionar direto. Sem giroscópio, use arrastar (toque) e movimento do mouse no desktop. Nunca dependa disso para navegar.
5. **Desempenho:** limite de pixel ratio a 2, no máximo cerca de mil partículas, sem sombras em tempo real, `powerPreference: high-performance`, pause a animação com a aba oculta (`visibilitychange`) e reduza qualidade se os quadros caírem (medir FPS nos primeiros segundos).
6. **Acessibilidade e conforto:** respeite `prefers-reduced-motion` (sem dobra, poucas partículas, sem giro), evite movimentos bruscos de câmera (risco de enjoo), mantenha texto do diálogo em HTML sobre o canvas (legível por leitor de tela, com contraste), e todo controle importante como botão comum de 44 px ou mais.
7. **Bateria e dados:** o 3D não deve rodar no laboratório nem enquanto o aluno estuda. Pause o loop de renderização nessas telas.
8. **Testes:** teste em um Android de entrada e em um iPhone real antes de liberar. Playwright com WebGL por software serve para capturar telas, não para medir desempenho.
9. **Privacidade:** dados de sensores (orientação) ficam só no aparelho; nunca são enviados nem registrados nas métricas.

Ideias para depois (se o desempenho permitir): cristal 3D que gira ao acender, artefato 3D de cada era ao concluí-la, terminal cuja tela mostra o progresso da era em forma de linhas de código sendo "compiladas", e um modo "ver o Eco" com realidade aumentada (fora do escopo inicial).

## 4. Arquitetura (o que acrescentar)

```
src/
  domain/
    era/              # Era, Jump (salto), Paradox, Crystal (tipos e regras puras)
    traveler/         # Traveler (nome, nível), conquistas, artefatos
  application/
    usecases/         # setTravelerName, completeJump, resolveParadox, getEraProgress...
  infrastructure/
    storage/          # LocalStorageTravelerRepository (versionado, com migração)
  presentation/
    themes/time/      # copy.ts, tokens, ilustrações da Sintaxe, cristais, artefatos
    features/
      prologue/       # diálogo inicial (máquina de estados: mensagens, escolhas, entrada de texto)
      map/            # home: mini mapa (nós, caminhos, marcador, minimapa, zoom e pan)
      jump/           # tela de salto + paradoxo
      time-machine/   # laboratório
      support/        # Pix (cristal), QR, confete
  content/
    eras/
      dados/          # era.ts + jumps/*.ts (+ missions.ts)
      logica/ ...
```

Regras (iguais ao `CLAUDE.md`): `domain` puro e sem `window`; componentes não chamam `localStorage` nem PGlite diretamente; `content` só conhece tipos do domínio; adicionar era = criar pasta em `content/eras/<id>/` e registrar em `registry.ts`; lint de fronteiras falha o CI. O **diálogo do prólogo** é dado (script de mensagens e escolhas em `content/` ou `themes/time/`), interpretado por uma máquina de estados em `application`, não código solto nos componentes. Cada salto tem um campo `year`/`period` e `place` no tipo do domínio, validados com Zod.

Tipos sugeridos:

```ts
type Jump = { id: string; year: string; place: string; title: string; tiquePrologue: string; blocks: Block[]; paradox: QuizItem[]; sources: Source[] };
type Source = { title: string; url: string };
```

## 5. Regra de ouro do conteúdo histórico

Este produto ensina história da tecnologia. **Cada data e cada fato devem ter fonte conferida.**

- Todo salto guarda `sources` (título + URL de fonte confiável: documentação oficial, artigos originais, Wikipedia como apoio, museus e universidades). O teste de conteúdo (Zod) **falha o CI** se um salto não tiver `year` e pelo menos uma fonte.
- Mostre ao aluno um link "Fontes" em cada salto.
- Quando houver divergência entre fontes, diga isso no texto ("segundo o registro da NASA..."), em vez de escolher uma versão em silêncio.
- **Não invente falas de pessoas reais.** Quem fala é a Sintaxe. Cite pessoas apenas com fatos verificados (quem publicou o quê e quando).
- Não afirme datas que você não conferiu. Se não achou fonte, deixe `TODO(autor)` e pergunte.

## 6. Era dos Dados (a primeira) — linha do tempo já conferida

Fatos abaixo foram conferidos em fontes públicas durante o planejamento (lista na seção 8). Use como espinha dorsal dos saltos; o texto da lição deve ser escrito com palavras próprias, sem copiar as fontes.

| Salto | Ano / período | Fato | Ideia que a lição ensina |
|---|---|---|---|
| 1 | 1963 → 1968/69 | O IMS (IBM) nasce para controlar a lista de materiais do foguete Saturn V, do programa Apollo. Origem em contrato da NASA de 1963; desenvolvimento a partir de 1966; primeira versão para o IBM System/360 concluída em 1967; instalado na North American Rockwell em 14 de agosto de 1968; lançado comercialmente como IMS/360 em 1969. Modelo **hierárquico**. | Por que existem bancos de dados; dados em árvore e seus limites |
| 2 | Anos 1960 → 1971 | Charles Bachman desenvolve o IDS (Integrated Data Store) e o padrão **CODASYL** (1971) formaliza o modelo **em rede**. Bancos "navegacionais": o programa segue ponteiros. | Navegar por ponteiros × buscar por conteúdo |
| 3 | 1970 | Edgar F. Codd (IBM) publica "A Relational Model of Data for Large Shared Data Banks": dados em tabelas, busca por conteúdo, separação entre estrutura lógica e armazenamento físico. | **Modelo relacional** (módulos de relacional, chaves, álgebra) |
| 4 | 1973 → 1979 | Chamberlin e Boyce começam o SEQUEL em 1973 (IBM San Jose), para o protótipo **System R** (1974/75). Nome mudou para SQL por conflito de marca. Oracle V2 chega ao mercado em junho de 1979 para VAX; IBM comercializa System/38 (1979), SQL/DS (1981) e Db2 (1983). | **SQL** (SELECT, WHERE, JOIN...) e por que ele é declarativo |
| 5 | 1986 → 1987 | SQL vira padrão **ANSI (1986)** e **ISO (1987)**. | Padronização e portabilidade; dialetos |
| 6 | 1986 → 1996 | Projeto **POSTGRES** (Berkeley, prof. Michael Stonebraker) começa em 1986; versão 1 externa em junho de 1989; em 1994 Andrew Yu e Jolly Chen acrescentam um interpretador SQL (**Postgres95**); em 1996 o nome muda para **PostgreSQL** e a numeração recomeça em 6.0. | Nasce o banco que o aluno usa na Máquina do Tempo |
| 7 | 1990s | Orientação a objetos e o "descompasso objeto-relacional"; surgem bancos de objetos e híbridos. | Por que ORMs e tipos avançados existem |
| 8 | 1998 / 2004–2009 | O termo "NoSQL" aparece em 1998 (Carlo Strozzi) e é retomado em 2009 (Johan Oskarsson) para bancos distribuídos não relacionais. Google começa o Bigtable em 2004 e publica o artigo em 2006 (OSDI). **MongoDB** (10gen) tem lançamento inicial em fevereiro de 2009; **Redis** (Salvatore Sanfilippo) em 2009. | Quando e por que usar NoSQL (e o cache do Redis) |
| 9 | Hoje | NewSQL e bancos na nuvem tentam unir garantias relacionais e escala. | Como escolher o banco certo |

Cada salto com módulos técnicos mantém o **laboratório SQL** do protótipo, com os mesmos exemplos executáveis. Os 22 módulos de `legacy/Trilha_PostgreSQL_com_Laboratorio.html` são distribuídos entre os saltos 1 a 6 conforme a tabela da seção 1 ("Essência"), **sem perder nada**. Os saltos 5, 7, 8 e 9 exigem texto e quiz novos, sempre além dos 22 módulos.

**Ainda para pesquisar antes de escrever (não afirme sem fonte):** ano exato do artigo do Dynamo (Amazon), lançamento do Cassandra, datas de MySQL, SQLite e SQL Server, e origem do CODASYL DBTG (relatório de 1969?). Marque com `TODO(autor)` até conferir.

## 7. Próximas eras (esboço, com datas a pesquisar)

Cada era segue o mesmo método: **pesquisar em fontes, montar a tabela de saltos com fatos e fontes, escrever a lição a partir do problema da época**, e só então publicar. Nenhuma data abaixo deve ser usada sem conferência.

| Era | Nome de trabalho | Saltos prováveis |
|---|---|---|
| 2 | **Era da Lógica** | Algoritmo e passo a passo, primeiras máquinas programáveis, fluxogramas, variáveis, condições, laços, funções |
| 3 | **Era das Linguagens** | Linguagens de baixo e alto nível, C, Java, Python, PHP: cada uma com o problema que veio resolver (uma sub-linha do tempo por linguagem) |
| 4 | **Era do Código Compartilhado** | Controle de versão (do arquivo com cópias ao Git), GitHub, revisão de código |
| 5 | **Era das Nuvens** | Servidores físicos, máquinas virtuais, containers e Docker, deploy |
| 6 | **Era da Web** | HTTP, HTML/CSS/JS, front e back-end, APIs |
| 7 | **Era da Inteligência** | Dados e aprendizado de máquina, modelos de linguagem (com cuidado redobrado com datas e atribuições) |

Ordem de criação sugerida: **Praça da Sintaxe (base)**, Dados, Lógica, Linguagens, Código Compartilhado, Nuvens, Web. A **Névoa da Inteligência** (IA e aprendizado de máquina) fica como era futura, mostrada no mapa como área inexplorada.

## 8. Fontes usadas na pesquisa desta linha do tempo (Era dos Dados)

- PostgreSQL Documentation, "A Brief History of PostgreSQL": https://www.postgresql.org/docs/current/history.html
- Wikipedia, "IBM Information Management System": https://en.wikipedia.org/wiki/IBM_Information_Management_System
- Wikipedia, "SQL": https://en.wikipedia.org/wiki/SQL
- Wikipedia, "Database": https://en.wikipedia.org/wiki/Database
- Wikipedia, "NoSQL": https://en.wikipedia.org/wiki/NoSQL
- Wikipedia, "Bigtable": https://en.wikipedia.org/wiki/Bigtable
- Wikipedia, "MongoDB": https://en.wikipedia.org/wiki/MongoDB
- Wikipedia, "Redis": https://en.wikipedia.org/wiki/Redis
- Alessandro Ferrini, "History of Databases and SQL: from IMS to the relational model": https://www.alessandroferrini.com/posts/the-origins-of-databases/

Antes de publicar, confirme os pontos principais também em fontes primárias (o artigo de Codd, de 1970, e o artigo do Bigtable, de 2006) e complemente a lista `sources` de cada salto.

## 9. Contribuição por Pix: "Abastecer a máquina do tempo"

Mesmas regras da seção 9 do `CLAUDE.md`, com a moldura do tema:

- **Presença discreta** (regras da seção 9 do `CLAUDE.md`): link pequeno "Colabore com o projeto" no rodapé e em "Mais". Sem botão fixo, sem cartões repetidos, sem pop-up. No máximo uma frase suave no fim de uma era concluída. A Sintaxe **nunca** pede contribuição durante as lições.
- Ao tocar: **cristal que se acende**, confete azul, roxo e dourado, e a mensagem **"Obrigado por contribuir! Isso ajuda a aumentar o código e ajuda todo mundo."** A Sintaxe também agradece pelo nome do viajante.
- QR do Pix estático, chave para copiar e "Pix copia e cola". Recebedor GUSTAVO COSTA GOMES, cidade IPATINGA (`config/pix.ts`). O payload de referência está no rodapé do protótipo e serve como valor esperado nos testes do gerador.
- Faça um Pix real de valor mínimo antes de divulgar, para conferir o destinatário no app do banco.
- **Honestidade:** o app não sabe se houve pagamento. Sem contador de apoiadores, sem lista de nomes, e **nenhum conteúdo, nível ou artefato é bloqueado** por contribuição. O cristal de doação é só a moldura visual: não some do saldo de cristais de estudo.

## 10. Identidade visual

- Base do `CLAUDE.md` (fundo `#0a0912`, roxo `#9b4dff`, laranja `#ff6b1f`), com **ciano `#5ee7ff`** como cor do tempo (linha do tempo, carimbos de data, cristais) e **dourado `#ffd479`** para XP e Pix.
- Fundo estrelado leve e discreto (sem animações pesadas no celular). Moldura "notebook" mantida para código e tabelas.
- Ilustrações em SVG **originais**: a Sintaxe, cristais, artefatos de cada era, ícones de era. Sem logotipos oficiais de linguagens ou empresas.
- Acessibilidade: contraste AA, `aria-label` nos botões de ícone, movimento reduzido respeitado (balões, confete, brilho), o diálogo do prólogo legível por leitor de tela (`role="log"`).

## 11. Métricas (eventos a mais)

`prologue_started`, `prologue_completed`, `prologue_skipped`, `era_opened {era}`, `jump_started {era, jump}`, `paradox_solved {era, jump, tries}`, `jump_completed {era, jump}`, `era_completed {era}`, `time_machine_opened`, `support_opened`, `pix_key_copied`. **Sem o nome do viajante** e sem nenhum dado pessoal.

## 12. Marcos desta branch

1. **T1:** camada de tema (`themes/time`), tokens, Sintaxe e cristais em SVG; linha do tempo (home) com o conteúdo já migrado.
2. **T2:** prólogo com máquina de estados de diálogo, nome guardado, botão "Pular" e testes de unidade da máquina.
3. **T3:** tela de salto + paradoxo com XP e cristais; migração **integral** dos 22 módulos para os saltos 1 a 6, com o teste de não regressão da seção 1 (22 módulos, quizzes, 12 missões, SQL executando).
4. **T4:** saltos novos da Era dos Dados (1, 2, 7, 8, 9) com fontes e teste de conteúdo (Zod) exigindo ano e fonte.
5. **T5:** Máquina do Tempo (laboratório SQL) e o modal discreto "Colabore" (Pix, cristal, confete, QR) com testes do gerador.
6. **T6:** exportar/importar progresso, PWA offline, OG images por era, revisão de acessibilidade e de desempenho em 360 px.
7. **T7:** segunda era (Era da Lógica), como prova de que a arquitetura aguenta uma era nova sem mudar outras pastas.

## 13. Decisões em aberto (pergunte ao autor)

- Nome final do produto ("Viajante do Tempo" é provisório).
- A Sintaxe deve ter voz (áudio) ou só texto? Recomendado: só texto, com som opcional e desligado por padrão.
- O aluno pode refazer o prólogo pelas configurações?
- Ordem das próximas eras depois da Era dos Dados.
- Licença do conteúdo (sugestão: CC BY-NC-SA) e créditos das fontes.
