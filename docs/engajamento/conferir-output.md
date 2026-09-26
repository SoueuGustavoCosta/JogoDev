# Perguntas "o que aparece na tela?" para conferir à mão

As perguntas `kind: 'output'` de **PHP** são conferidas automaticamente pelo teste
`src/content/outputQuestions.test.ts`, que roda o código no mesmo PHP (WebAssembly) do
laboratório. **Python e Java** não rodam no navegador, então ficam listadas aqui para o autor
conferir à mão (rode o código e veja se a saída é exatamente a resposta marcada).

Antes de entrar nesta lista, cada código também foi rodado pelo Claude Code com `python3` /
`java` locais, e a saída bateu com a resposta.

O código de cada pergunta está no campo `code` dela, em `src/content/trails/<ilha>/modules/`.

| Ilha | Módulo | Id | Resposta esperada | Conferido pelo autor |
|---|---|---|---|---|
| Lua de Python | Sintaxe limpa: indentação, variáveis e tipos | `q3` | `<class 'int'>` | [ ] |
| Lua de Python | Operadores e condições | `q1` | `3.5` | [ ] |
| Lua de Python | Laços: for, while e range() | `q1` | `[0, 1, 2]` | [ ] |
| Lua de Python | Coleções: listas, tuplas, dicionários e conjuntos | `q1` | `40` | [ ] |
| Lua de Python | Coleções: listas, tuplas, dicionários e conjuntos | `q4` | `None` | [ ] |
| Lua de Python | Funções: def, argumentos e a armadilha da lista mutável | `q1` | `None` | [ ] |
| Lua de Python | Funções: def, argumentos e a armadilha da lista mutável | `q3` | `['pão', 'leite']` | [ ] |
| Lua de Python | Orientação a objetos: classes, self e herança | `q4` | `Olá` | [ ] |
