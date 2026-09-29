# Plano de Expansão — Jogo Dev

Coloque este arquivo em `docs/expansao/PLANO-EXPANSAO.md` no repositório.
Cada etapa vira **uma branch e um PR**. O Gustavo faz o merge antes da próxima.

## Regras para todas as etapas

- Leia `CLAUDE.md` antes de começar e siga a arquitetura do projeto (domain / application / infrastructure / presentation / content).
- Faça **só a etapa pedida**. Não adiante etapas e não refatore o que não foi pedido.
- **Nunca apague conteúdo** (módulos, perguntas, missões, anomalias, oficinas). Mover pode; apagar não.
- **Ids publicados nunca mudam** (módulos, perguntas, anomalias, oficinas, insígnias). O progresso dos jogadores é salvo por id.
- Tudo continua **100% gratuito** (Vercel Hobby, Supabase Free). Nada de serviço pago ou API externa nova.
- **Fora do escopo agora:** liberar sistemas aos poucos por dias de jogo, e medir no Supabase onde os jogadores param. Não implemente isso.
- Texto para o jogador: português do Brasil, simples, com o tom da Senhorita Sintaxe e do Eco.
- Antes do PR: `npm run lint`, `npm test` e `npm run build` passando. Atualize o `CLAUDE.md` se algo novo precisar ser explicado.
- Se alguma decisão depender do autor, deixe um `TODO(autor)` e anote no PR.

---

## Etapa 14 — Luas da Era dos Dados

Objetivo: a ilha Banco de Dados tem 22 módulos, o que cansa. Ela passa a ter **10 módulos principais**, e o resto vira **2 luas com 5 módulos cada**, usando o mesmo sistema de luas da Era da Lógica (`satellites` em `mapData.ts`, trilha própria em `content/trails/`, registro em `content/registry.ts`).

Nova divisão (os ids atuais dos módulos continuam iguais):

| Onde | Módulos |
|---|---|
| Ilha principal `banco-de-dados` (10) | porque, relacional, **sintaxe + tiposdados** (fundidos), create, insert, where, update, join, agg, subconsultas |
| Lua da Modelagem (5) | **tipos + arquitetura** (fundidos), interface, mer, algebra, norm |
| Lua do Guardião (5) | indices, transacoes, views, seguranca, projeto |

### 14A — Reorganização e migração do progresso (sem mudar o mapa ainda)

1. Crie duas trilhas novas em `content/trails/`: `dados-modelagem` e `dados-guardiao`, e registre em `content/registry.ts`.
2. Mova os arquivos de módulo para as trilhas certas, **sem mudar ids de módulo nem de pergunta**.
3. Módulos fundidos: `sintaxe` absorve o conteúdo de `tiposdados`; `tipos` absorve o conteúdo de `arquitetura`. O módulo fundido mantém o id do primeiro. Nenhuma pergunta é perdida.
4. **Migração do progresso** (local e o que vem da nuvem), rodando uma vez e sem efeito se rodar de novo:
   - o que o jogador fez nos módulos movidos passa de `trails['banco-de-dados']` para a trilha nova;
   - módulo fundido conta como concluído se o jogador tinha concluído **qualquer um** dos dois antigos, e as respostas de perguntas vão junto;
   - XP, missões do laboratório (m1 a m12), chefe e insígnia do Arquivista ficam como estão.
5. O chefe **Arquivista** continua na ilha principal (ele cobra CREATE com FK, JOIN, WHERE e UPDATE, que ficaram lá). Confira se as dicas e textos que citam "módulo 6" etc. ainda batem com a nova ordem.
6. Atualize os textos que falam em "22 módulos".
7. Testes: migração com jogador novo, jogador no meio da trilha e jogador que já terminou tudo; e o teste `nonRegression` do banco deve continuar achando todas as perguntas (agora espalhadas nas 3 trilhas).

### 14B — Luas no mapa

1. Adicione `satellites` na era `dados` em `mapData.ts`, igual à Era da Lógica: Lua da Modelagem e Lua do Guardião, com cor e ícone próprios.
2. As luas liberam **depois de vencer o Arquivista**, com a mesma regra de `unlocked` do `TimeMap.tsx`. Antes disso, a fala da Sintaxe explicando que a lua abre depois do chefe.
3. Ajuste a posição (ângulo) para as luas não ficarem em cima do nome da era.
4. Jogador que já venceu o Arquivista vê as luas liberadas na hora.

### 14C — Chefes e insígnias das luas

Cada lua ganha um chefe e uma insígnia, no mesmo formato de `bossFight` das outras trilhas (3 rodadas, `badgeId` novo). Sugestões (o autor pode trocar):

- **Lua da Modelagem** — chefe **Duplicador**, uma cópia do Eco que repete dados em todo lugar. Rodadas: identificar entidades num cenário, montar o relacionamento certo (1:N / N:N), normalizar uma tabela bagunçada. Insígnia: **Arquiteto de Dados**.
- **Lua do Guardião** — chefe **Impasse**, que trava tudo e vaza dados. Rodadas: escolher onde um índice ajuda, fechar uma transação com COMMIT/ROLLBACK certo, dar só a permissão necessária (GRANT). Insígnia: **Guardião das Transações**.

Insígnias novas aparecem na página de insígnias ao lado das "Luas" de Python, Java e PHP.

**Prompt para o Claude Code (uma parte por vez):**

> Leia `CLAUDE.md` e `docs/expansao/PLANO-EXPANSAO.md`. Faça **somente a Etapa 14A**, seguindo as "Regras para todas as etapas". Crie a branch `etapa-14a-luas-dados`, rode lint, testes e build, e abra o PR explicando o que mudou e como a migração protege o progresso dos jogadores.

(Depois troque para 14B e 14C.)

---

## Etapa 15 — Mais anomalias do dia

Hoje são 30 anomalias (5 por ilha). Em uma semana o jogador já viu todas.

1. Suba para **12 anomalias por ilha** (Lógica, PHP, Python, Java, Banco de Dados, Git) e crie **5 para cada lua nova** da Etapa 14 (Modelagem e Guardião).
2. Varie os tipos que já existem (`bug`, `output`, `order`, etc.) e os níveis (Base, Intermediário, Avançado).
3. O sorteio do dia (em `domain/anomaly`) **não repete** uma anomalia até o jogador ter visto todas daquela ilha.
4. As saídas de PHP e SQL precisam rodar nos testes de conteúdo; Python e Java vão para `docs/engajamento/conferir-output.md`, como já é feito.
5. Ids novos, nunca reaproveitados.

Faça em partes para o PR não ficar enorme: **15A** (sorteio sem repetir + Lógica e Banco), **15B** (PHP, Python, Java), **15C** (Git e as duas luas).

**Prompt:**

> Leia `CLAUDE.md` e `docs/expansao/PLANO-EXPANSAO.md`. Faça **somente a Etapa 15A**, seguindo as regras. Crie a branch `etapa-15a-anomalias`, rode lint, testes e build, e abra o PR.

---

## Etapa 16 — Oficinas de Banco de Dados (SQL)

O projeto já tem o PGlite (PostgreSQL no navegador) usado no laboratório. A oficina de SQL usa ele.

### 16A — Motor da oficina SQL

1. Adicione `'sql'` em `WorkshopLang` e no `workshopSchema`.
2. Na oficina SQL, o teste **não confere o texto da consulta**, confere o **resultado**: as linhas e colunas que voltam (ou o estado das tabelas, para CREATE/INSERT/UPDATE), igual às missões `select` e `state` do laboratório. Reaproveite o que já existe em `infrastructure/sql` e nos datasets (`loja`, `vazio`).
3. Cada teste roda num banco novo, para um teste não sujar o outro.
4. Os "testes surpresa" usam dados diferentes (outro conjunto de linhas), para pegar quem escreveu a resposta fixa.
5. O PGlite carrega **só quando o jogador abre uma oficina SQL** (sob demanda), para não pesar o resto do app.
6. Modo blocos: peças de SQL (`SELECT`, `FROM`, `WHERE`, `ORDER BY`, `JOIN`...) no mesmo sistema de `palettes`.
7. A Senhorita Sintaxe explica o teste que falhou comparando "o que você trouxe" x "o que era esperado".

### 16B — Primeiras oficinas SQL (6)

Níveis misturados, cada uma com `after` apontando para o módulo certo:

1. **Estoque baixo** — produtos com estoque menor que 5 (Base, depois de `where`)
2. **Top 3 mais caros** — ORDER BY + LIMIT (Base)
3. **Cadastro da turma** — criar a tabela e inserir 3 alunos (Base, depois de `insert`)
4. **Quanto cada cliente gastou** — JOIN + SUM + GROUP BY (Intermediário, depois de `agg`)
5. **Clientes que nunca compraram** — LEFT JOIN ou subconsulta, qualquer um vale (Intermediário, depois de `subconsultas`)
6. **Reajuste seguro** — UPDATE só numa categoria, sem mexer nas outras (Intermediário, depois de `update`)

Todas com soluções de referência rodando no teste `workshops.test.ts` (em mais de um jeito quando der) e escada de 3 dicas.

**Prompt:**

> Leia `CLAUDE.md` e `docs/expansao/PLANO-EXPANSAO.md`. Faça **somente a Etapa 16A**, seguindo as regras. Crie a branch `etapa-16a-oficina-sql`, rode lint, testes e build, e abra o PR.

---

## Etapa 17 — Oficinas de Git

Não existe Git de verdade no navegador do projeto. A oficina usa um **terminal simulado**, leve e gratuito.

### 17A — Terminal Git simulado

1. Um motor puro (em `domain`, sem React) que guarda o estado do repositório: arquivos, o que está no stage, commits, branches, branch atual e um remoto falso (`origin`).
2. Comandos aceitos: `git init`, `git status`, `git add <arquivo>` / `git add .`, `git commit -m "..."`, `git log --oneline`, `git branch`, `git branch <nome>`, `git switch` / `git checkout`, `git merge`, `git push`, `git pull`, `git restore`. Comando desconhecido gera uma mensagem amigável da Sintaxe, sem travar.
3. Mensagens parecidas com as do Git de verdade (em português quando for fala da Sintaxe, em inglês quando for saída do Git).
4. O teste confere o **estado final** do repositório, não a ordem exata dos comandos. Qualquer caminho que chega no estado certo vale.
5. Adicione `'git'` como tipo de oficina (tela de terminal em vez de editor de código), com histórico de comandos e seta para cima para repetir.
6. Testes unitários do motor cobrindo cada comando.

### 17B — Primeiras oficinas de Git (5)

1. **Primeiro commit** — iniciar o repositório e salvar o `README.md` (Base)
2. **Só o que importa** — commitar um arquivo e deixar outro fora (Base)
3. **Nova funcionalidade** — criar uma branch, commitar nela e voltar para a `main` (Intermediário)
4. **Juntando o trabalho** — fazer o merge da branch na `main` (Intermediário)
5. **Mandar para a nuvem** — commit e push para o `origin` (Base)

Cada uma com `after` apontando para o módulo certo da trilha `git-github` e escada de 3 dicas.

**Prompt:**

> Leia `CLAUDE.md` e `docs/expansao/PLANO-EXPANSAO.md`. Faça **somente a Etapa 17A**, seguindo as regras. Crie a branch `etapa-17a-terminal-git`, rode lint, testes e build, e abra o PR.

---

## Ordem sugerida

14A → 14B → 14C → 15A → 15B → 15C → 16A → 16B → 17A → 17B
