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
