# Etapa 5: conversão do conteúdo, ilha por ilha

Metas (conferidas pelo teste `src/content/conversionGoals.test.ts` em cada ilha convertida):
no máximo 40% de alternativas de teoria, pelo menos um desafio de código por módulo, nenhum
parágrafo com mais de 60 palavras. Perguntas convertidas mantêm o id (o progresso segue a
pergunta) e cobrem o mesmo conceito. Toda pergunta `output` de PHP roda no PHP do laboratório
(`src/content/outputQuestions.test.ts`); Python e Java vão para `conferir-output.md`.

Colunas de formatos: completar / montar a linha / o que aparece / encontre o bug.

## Lógica (branch `etapa-5-conteudo-logica`)

| Módulo | Palavras (antes → depois) | Alternativas | Outros formatos (completar / montar / saída / bug) |
|---|---|---|---|
| origem | 620 → 620 | 4 → 4 | 1 / 0 / 0 / 0 → 1 / 0 / 0 / 0 |
| ola | 314 → 314 | 3 → 3 | 2 / 0 / 0 / 0 → 2 / 0 / 0 / 0 |
| variaveis | 389 → 389 | 4 → 0 | 2 / 0 / 0 / 0 → 2 / 0 / 3 / 1 |
| operadores | 170 → 171 | 3 → 1 | 3 / 0 / 0 / 0 → 3 / 0 / 2 / 0 |
| decisoes | 244 → 244 | 3 → 2 | 2 / 1 / 1 / 1 → 2 / 1 / 2 / 1 |
| loops | 341 → 341 | 3 → 1 | 3 / 0 / 0 / 0 → 3 / 0 / 1 / 1 |
| arrays | 275 → 275 | 2 → 1 | 4 / 0 / 0 / 0 → 4 / 0 / 1 / 0 |
| funcoes | 245 → 245 | 3 → 2 | 3 / 0 / 0 / 0 → 3 / 0 / 1 / 0 |
| web | 293 → 293 | 3 → 2 | 2 / 0 / 0 / 0 → 2 / 0 / 1 / 0 |
| velha | 597 → 597 | 3 → 3 | 1 / 0 / 0 / 0 → 1 / 0 / 0 / 0 |
| **Total** | 3488 → 3489 | 31/57 (54%) → 19/57 (33%) | |

- As alternativas que ficaram são de fatos históricos (al-Khwarizmi, Ada Lovelace, Kernighan),
  de conceito (o que é algoritmo, entrada/processamento/saída, HTTP) e do Jogo da Velha.
- Parágrafo longo: 1 (precedência, em Operadores); a observação sobre a apostila virou nota
  "Curiosidade".
- `afterBlock` em 9 perguntas que apareciam antes da explicação (Variáveis q1–q4, Funções q2,
  Web q1–q3 e q5, Jogo da Velha q1).

## Banco de Dados (branch `etapa-5-conteudo-banco-de-dados`)

| Módulo | Palavras (antes → depois) | Alternativas | Outros formatos (completar / montar / saída / bug) |
|---|---|---|---|
| porque | 525 → 563 | 4 → 4 | 0 / 0 / 0 / 0 → 1 / 0 / 0 / 0 |
| tipos | 269 → 295 | 4 → 4 | 0 / 0 / 0 / 0 → 0 / 1 / 0 / 0 |
| arquitetura | 330 → 330 | 4 → 3 | 0 / 0 / 0 / 0 → 0 / 0 / 1 / 0 |
| interface | 228 → 228 | 2 → 2 | 1 / 0 / 0 / 0 → 1 / 0 / 0 / 0 |
| sintaxe | 256 → 256 | 3 → 1 | 1 / 0 / 0 / 0 → 1 / 0 / 1 / 1 |
| tiposdados | 114 → 114 | 3 → 0 | 0 / 0 / 0 / 0 → 2 / 0 / 1 / 0 |
| relacional | 263 → 263 | 4 → 2 | 0 / 0 / 0 / 0 → 0 / 1 / 0 / 1 |
| create | 370 → 370 | 4 → 0 | 1 / 0 / 0 / 0 → 3 / 1 / 1 / 0 |
| insert | 75 → 75 | 3 → 0 | 0 / 0 / 0 / 0 → 1 / 1 / 1 / 0 |
| where | 80 → 80 | 4 → 0 | 0 / 0 / 0 / 0 → 0 / 0 / 3 / 1 |
| update | 87 → 87 | 3 → 0 | 0 / 0 / 0 / 0 → 1 / 1 / 1 / 0 |
| mer | 403 → 403 | 4 → 2 | 0 / 0 / 0 / 0 → 1 / 0 / 1 / 0 |
| join | 220 → 220 | 4 → 2 | 0 / 0 / 0 / 0 → 2 / 0 / 0 / 0 |
| algebra | 227 → 227 | 4 → 1 | 0 / 0 / 0 / 0 → 2 / 0 / 1 / 0 |
| agg | 116 → 116 | 4 → 0 | 0 / 0 / 0 / 0 → 2 / 1 / 1 / 0 |
| subconsultas | 119 → 119 | 3 → 0 | 0 / 0 / 0 / 0 → 1 / 0 / 2 / 0 |
| norm | 436 → 436 | 5 → 4 | 0 / 0 / 0 / 0 → 0 / 0 / 0 / 1 |
| indices | 231 → 231 | 4 → 2 | 0 / 0 / 0 / 0 → 2 / 0 / 0 / 0 |
| transacoes | 350 → 350 | 4 → 2 | 0 / 0 / 0 / 0 → 0 / 0 / 2 / 0 |
| views | 183 → 183 | 3 → 1 | 0 / 0 / 0 / 0 → 1 / 0 / 1 / 0 |
| seguranca | 297 → 297 | 4 → 2 | 0 / 0 / 0 / 0 → 1 / 1 / 0 / 0 |
| projeto | 147 → 147 | 4 → 2 | 0 / 0 / 0 / 0 → 0 / 1 / 0 / 1 |
| **Total** | 5326 → 5390 | 81/84 (96%) → 34/86 (40%) | |

- 47 conversões: o que aparece (17, conferidas no PGlite com a Loja de exemplo), completar com
  blocos (18), montar a linha (7) e encontre o bug (5). As alternativas que ficaram são de
  conceito (SGBD, dado × informação, camadas), história (Codd, modelos), modelagem (MER,
  formas normais) e boas práticas (backup, SQL Injection).
- Conteúdo novo (nada foi apagado): "Por que banco de dados" e "Tipos" eram só teoria e
  ganharam um primeiro contato com SQL (parágrafo curto + bloco que roda no laboratório) e
  uma pergunta de código cada (`q5`).
- Parágrafo longo: 1 (B-tree, em Índices), dividido em dois.
- `afterBlock` em 12 perguntas (Update q1, MER q1–q2, Join q1, Álgebra q1–q2, Agregação q2,
  Subconsultas q1–q2, Transações q2–q3, Views q2).
- Fora da pasta da ilha (infraestrutura da etapa): o teste de `output` passou a rodar SQL no
  PGlite, e o código dos desafios quebra linha no celular em vez de esconder o fim.

## Python (branch `etapa-5-conteudo-python`)

| Módulo | Palavras (antes → depois) | Alternativas | Outros formatos (completar / montar / saída / bug) |
|---|---|---|---|
| nascimento-python | 635 → 635 | 4 → 4 | 1 / 0 / 0 / 0 → 1 / 1 / 0 / 0 |
| sintaxe-e-tipos | 250 → 250 | 4 → 2 | 1 / 0 / 0 / 0 → 1 / 0 / 1 / 1 |
| operadores-condicoes | 239 → 239 | 4 → 1 | 1 / 0 / 0 / 0 → 2 / 1 / 1 / 0 |
| loops-python | 216 → 216 | 4 → 2 | 1 / 0 / 0 / 0 → 1 / 1 / 1 / 0 |
| colecoes | 213 → 213 | 4 → 1 | 1 / 0 / 0 / 0 → 1 / 0 / 2 / 1 |
| funcoes-python | 166 → 166 | 4 → 2 | 1 / 0 / 0 / 0 → 1 / 0 / 2 / 0 |
| modulos-e-arquivos | 202 → 202 | 4 → 2 | 1 / 0 / 0 / 0 → 2 / 1 / 0 / 0 |
| poo-python | 162 → 162 | 4 → 2 | 1 / 0 / 0 / 0 → 2 / 0 / 1 / 0 |
| **Total** | 2083 → 2083 | 32/40 (80%) → 16/41 (39%) | |

- 16 conversões (2 por módulo técnico, 3 em Operadores e Coleções): o que aparece (8,
  rodadas no `python3` e listadas em `conferir-output.md` para o autor conferir), completar
  (3), montar a linha (3) e encontre o bug (2). O módulo de história (nascimento) mantém as 4
  alternativas e ganha uma pergunta nova de código (`q6`, montar `import this`).
- Parágrafo longo: 1 (a origem do nome, no nascimento), dividido em dois.
- `afterBlock` em 2 perguntas (Laços q1, Funções q1).

## Java (branch `etapa-5-conteudo-java`)

| Módulo | Palavras (antes → depois) | Alternativas | Outros formatos (completar / montar / saída / bug) |
|---|---|---|---|
| nascimento-java | 439 → 439 | 4 → 4 | 1 / 0 / 0 / 0 → 2 / 0 / 0 / 0 |
| sintaxe-tipos-java | 242 → 242 | 4 → 2 | 1 / 0 / 0 / 0 → 1 / 1 / 0 / 1 |
| operadores-condicoes-java | 157 → 157 | 4 → 1 | 1 / 0 / 0 / 0 → 2 / 0 / 2 / 0 |
| loops-java | 83 → 83 | 4 → 1 | 1 / 0 / 0 / 0 → 1 / 1 / 2 / 0 |
| arrays-colecoes-java | 148 → 148 | 4 → 2 | 1 / 0 / 0 / 0 → 2 / 0 / 0 / 1 |
| metodos-java | 185 → 185 | 4 → 2 | 1 / 0 / 0 / 0 → 2 / 0 / 1 / 0 |
| classes-objetos-java | 168 → 168 | 4 → 2 | 1 / 0 / 0 / 0 → 1 / 1 / 1 / 0 |
| heranca-interfaces-java | 205 → 205 | 4 → 2 | 1 / 0 / 0 / 0 → 1 / 0 / 1 / 1 |
| **Total** | 1627 → 1627 | 32/40 (80%) → 16/41 (39%) | |

- 16 conversões: o que aparece (7, rodadas no `java` local e listadas em `conferir-output.md`),
  completar (3), montar a linha (3) e encontre o bug (3). (A mensagem do commit de conteúdo diz
  "completar (4)" por engano: são 3.) Nas perguntas "o que aparece" de Java,
  o código mostrado é o corpo do `main` (e as classes auxiliares, quando há), para caber no
  celular; a pergunta avisa "código dentro do main".
- O módulo de história mantém as 4 alternativas e ganha uma pergunta nova de código (`q6`,
  completar `javac Main.java`).
- A sequência de formatos de cada módulo é diferente da de Python.
- `afterBlock` em 1 pergunta (Laços q1, do-while).

## PHP (branch `etapa-5-conteudo-php`)

| Módulo | Palavras (antes → depois) | Alternativas | Outros formatos (completar / montar / saída / bug) |
|---|---|---|---|
| nascimento-php | 406 → 406 | 4 → 4 | 1 / 0 / 0 / 0 → 1 / 0 / 1 / 0 |
| sintaxe-tipos-php | 172 → 172 | 4 → 2 | 1 / 0 / 0 / 0 → 2 / 0 / 1 / 0 |
| operadores-condicoes-php | 159 → 159 | 4 → 2 | 1 / 0 / 0 / 0 → 1 / 0 / 2 / 0 |
| loops-php | 39 → 39 | 4 → 2 | 1 / 0 / 0 / 0 → 1 / 1 / 1 / 0 |
| arrays-php | 146 → 146 | 4 → 1 | 1 / 0 / 0 / 0 → 2 / 0 / 1 / 1 |
| funcoes-php | 149 → 149 | 4 → 1 | 1 / 0 / 0 / 0 → 2 / 0 / 2 / 0 |
| poo-php | 130 → 130 | 4 → 1 | 1 / 0 / 0 / 0 → 2 / 1 / 0 / 1 |
| superglobais-web-php | 179 → 179 | 4 → 2 | 1 / 0 / 0 / 0 → 2 / 0 / 0 / 1 |
| **Total** | 1380 → 1380 | 32/40 (80%) → 15/41 (37%) | |

- 17 conversões: o que aparece (7, conferidas automaticamente no PHP do laboratório),
  completar (5), montar a linha (2) e encontre o bug (3). O módulo de história mantém as 4
  alternativas e ganha uma pergunta nova de código (`q6`, o contador de visitas de Rasmus).
- A sequência de formatos de cada módulo é diferente da de Python e da de Java (teste
  "Python, Java e PHP não repetem a sequência de formatos" em `conversionGoals.test.ts`).
- `afterBlock` em 3 perguntas (Laços q1, Funções q1, Superglobais q1).

## Git e GitHub (branch `etapa-5-conteudo-git-github`)

| Módulo | Palavras (antes → depois) | Alternativas | Outros formatos (completar / montar / saída / bug) |
|---|---|---|---|
| origem | 224 → 245 | 3 → 2 | 0 / 0 / 0 / 0 → 1 / 0 / 0 / 0 |
| conceitos | 150 → 150 | 3 → 1 | 0 / 0 / 0 / 0 → 1 / 1 / 0 / 0 |
| ciclo | 52 → 52 | 2 → 1 | 1 / 0 / 0 / 0 → 1 / 1 / 0 / 0 |
| branches | 84 → 84 | 3 → 1 | 0 / 0 / 0 / 0 → 1 / 1 / 0 / 0 |
| desfazer | 105 → 105 | 2 → 0 | 1 / 0 / 0 / 0 → 2 / 1 / 0 / 0 |
| github | 134 → 134 | 3 → 2 | 0 / 0 / 0 / 0 → 1 / 0 / 0 / 0 |
| boaspraticas | 150 → 150 | 2 → 1 | 1 / 0 / 0 / 0 → 1 / 0 / 0 / 1 |
| **Total** | 899 → 920 | 18/21 (86%) → 8/21 (38%) | |

- 10 conversões: completar (5), montar a linha (4) e encontre o bug (1). Não há "o que
  aparece" em Git: comandos de terminal não rodam no navegador e a saída depende do
  repositório de cada um.
- "Origem" não tinha nenhum comando e ganhou um parágrafo curto com um bloco `git clone` (o
  "distribuído" na prática), usado pela pergunta convertida `q3`.
- `afterBlock` em 2 perguntas (Origem q3, Conceitos q1).
