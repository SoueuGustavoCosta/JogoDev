# Era da Web

HTML, CSS e JavaScript. Protótipo aprovado (fonte da verdade de textos, regras e visual): `Era_da_Web.html`. Pedido original do autor: `PROMPT.md`.

## Fluxo do jogador

1. No mapa principal, o portal da **Era da Web** (`/era-da-web`).
2. Na primeira entrada, a Senhorita Sintaxe apresenta a era (uma vez só). O nome é o do prólogo.
3. **10 trilhas em sequência** + o chefe **Eco**. Cada trilha libera uma peça do **portfólio** do viajante.
4. Vencer o Eco dá a insígnia **rara** (Guardião do Portfólio); sem perder nenhum coração, também a **lendária** (Tecelão da World Wide Web).
5. As **3 luas** (HTML, CSS, JS) nascem do Eco e aparecem no mapa principal, orbitando o portal da era (antes disso, nem aparecem). Cada lua: 5 trilhas + chefe (O Silenciador, Glitch Cromático, Loop Infinito) e 1 insígnia exclusiva (`/era-da-web/lua/:id`).
6. Com as 3 luas vencidas, toca o **mesmo Evento Nexus** das outras eras (`NexusScene`, uma vez só, `progress.nexusSeen.web`): React, Vue e Angular nos portais, Next.js como ramo do React e Node.js bloqueado (porta da futura Era do Back-end). Os portais mostram as 5 trilhas planejadas + chefe e a doc oficial, "em construção".

## Onde mora cada parte

| Parte | Arquivo |
|---|---|
| Conteúdo (trilhas, Eco, luas, ramificações, falas) | `src/content/webEra/` |
| Regras puras (desbloqueio, XP, insígnias, portfólio, merge) | `src/domain/webEra/` |
| Casos de uso (vencer etapa, salvar portfólio, copiar arquivo) | `src/application/usecases/webEra.ts` |
| Telas, palco e os 6 motores | `src/presentation/features/web-era/` |
| Insígnias-gema (`<GemBadge />`, `gemSvg`) | `src/presentation/design-system/` |
| SVG das 15 insígnias no catálogo | `public/badges/web/` (gerados pelo `gemSvg`) |
| Portal e luas no mapa | `presentation/features/archipelago/mapData.ts` |

## Progresso e XP

- Tudo fica em `Progress.webEra` (campo opcional): etapas vencidas (`w1`…`w10`, `eco`, `mh1`…, `mh-chefe`…), o portfólio que o viajante escreveu nas missões e se a intro já tocou. Sobe para o Supabase no backup de sempre (`progresso_completo`): **nenhuma tabela ou coluna nova**. O merge entre aparelhos soma as etapas e fica com o portfólio editado por último.
- XP (sai do conteúdo): +10 por missão, mais +50 por trilha da era, +200 pelo Eco, +40 por trilha de lua e +150 por chefe de lua. Entra no XP total, no nível e na semana da Liga. Vencer de novo não dá XP duas vezes.
- As 15 insígnias entram no catálogo compartilhado (`trail: 'web'`), então aparecem na Carteira de insígnias e no Hall.

## Motores de missão

`order` (peças na ordem), `sort` (baldes), `catch` (chuva de itens, `requestAnimationFrame`), `bug` (linhas com bug), `code` (editor + prévia ao vivo num iframe `srcdoc`, conferência automática com debounce de 450 ms e teclas rápidas) e `tune` (arena com alvo tracejado: box, flex, grid e position). O palco controla missão X/N, tempo, 3 corações, dica da Sintaxe depois de um erro e "A linha do tempo ramificou".

## Como mexer no conteúdo

- Cada missão é um objeto em `src/content/webEra/`. Missão de código precisa de `solution` (uma resposta certa): o teste `src/content/webEra.test.ts` roda a resposta e o código inicial das missões de HTML e JS no jsdom (a resposta passa, o início não).
- As missões de CSS dependem do navegador calcular o estilo (o jsdom não faz cascata, grid nem media query). Todas as 26 missões de código, inclusive as de CSS, foram conferidas no Chromium na criação da era.
- Mudou uma gema (cor, ícone, lados)? Redesenhe os SVGs: `UPDATE_WEB_BADGES=1 npx vitest run src/content/webEra.test.ts`.

## Diferenças em relação ao protótipo

- Nome do viajante: o do prólogo (o jogo já tem), então a era não pede de novo.
- A Sintaxe é o `SintaxeFace` do jogo, não a versão do protótipo.
- XP entra ao vencer a etapa (no protótipo, cada missão somava na hora, e dava para repetir para ganhar mais).
- "Pinte seu nome" e "Tema com variável": no protótipo, o código inicial já passava (o `h1` herda `#111` da prévia, diferente de preto). Agora a conferência compara com a cor do `body`.
- Sem o botão "liberar tudo (teste)": o jogo não tem modo de teste/admin, e o pedido era não criar um.
