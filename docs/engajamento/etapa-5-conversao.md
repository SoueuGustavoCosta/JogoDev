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
