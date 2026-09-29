# Prompt para o Claude Code: adicionar a Era da Web ao Jogo do Desenvolvedor

> Cole a parte "Contexto" junto com UMA etapa por vez. Só passe para a próxima depois de revisar e fazer o merge do PR.

---

## Contexto (colar sempre)

Você é um engenheiro de software especialista em games trabalhando no repositório **JogoDev** (React + Supabase Free + Vercel Hobby, tudo gratuito).
Vamos adicionar uma nova era: **Era da Web** (HTML, CSS e JavaScript / front-end).

Regras obrigatórias:
- **Não apague, não recrie e não reescreva** nada que já existe (hub/Praça da Sintaxe, ilhas, eras, avatar, ofensiva, anomalias, Evento Nexus, ranking). Só adicione e integre.
- Antes de codar, **leia a estrutura do repo** e siga os padrões existentes: pastas, nomes, componentes da Senhorita Sintaxe, sistema de XP, corações, insígnias e progresso no Supabase.
- O protótipo aprovado está em `docs/eras/web/Era_da_Web.html` (copie o arquivo que vou anexar para esse caminho se ele ainda não estiver lá). **Ele é a fonte da verdade** de conteúdo, textos, regras e visual. Porte para React; **não** coloque o HTML num iframe.
- Visual: mesmo DNA do jogo (fundo escuro, neon, portais animados, nada de formas estáticas com cara de antigo). Cores da era: HTML `#ff7a3d`, CSS `#3db8ff`, JS `#ffe14d`.
- Mobile-first: tudo funciona em 400px de largura, sem rolagem horizontal.
- Nessa era a regra é **mais ação, menos leitura**: falas da Sintaxe com no máximo 2 frases curtas por tela.
- Conteúdo sempre baseado na documentação oficial (MDN, W3C, react.dev etc.). Os links já estão no protótipo.
- Cada etapa termina num PR pequeno, com um resumo do que mudou. **Pare e espere** a próxima etapa.

### Trama (manter igual)
- Guia: **Senhorita Sintaxe**.
- Vilão: **Eco**, uma variante do próprio jogador (estilo Loki). Ele volta a 1989–1997 e espalha erro 404 para apagar a Web: HTML, CSS e JS.
- Datas usadas no jogo: Web proposta no CERN em 1989 (Tim Berners-Lee); “HTML Tags” com 18 tags em 1991; CSS proposto por Håkon Wium Lie em 10/10/1994; CSS1 recomendado pelo W3C em 12/1996; JavaScript criado por Brendan Eich na Netscape em maio de 1995 (Mocha → LiveScript → JavaScript); padronizado como ECMAScript em 1997.
- Ao longo das 10 trilhas o jogador **constrói o próprio portfólio**. Cada trilha libera uma peça.

### Fluxo que o jogador precisa viver
1. No mapa principal aparece o portal da **Era da Web** (o mapa só mostra o que já existe).
2. Ao entrar, ele vê **só a trilha da era**: 10 trilhas em sequência + o chefe **Eco**.
3. Ao vencer o Eco: animação “as luas nasceram”. As **3 luas (HTML, CSS, JS) aparecem do lado de fora da era**, orbitando o portal da Era da Web no mapa principal.
4. O jogador entra em cada lua: 5 trilhas + chefe, e ganha **1 insígnia exclusiva** por lua.
5. Com as 3 luas vencidas, dispara o **mesmo Evento Nexus que já existe no jogo** e aparecem as **Ramificações**: React, Next.js (ramo do React), Vue e Angular. Node.js aparece bloqueado, como porta para uma futura Era do Back-end.

---

## Etapa 0: reconhecimento (sem mudar código)
- Mapeie o repo: onde ficam eras/ilhas, mapa, Sintaxe, insígnias, progresso no Supabase, Evento Nexus e as luas/ramificações já existentes.
- Me entregue um plano curto: onde cada parte da Era da Web vai morar, quais componentes serão reaproveitados e se precisa de alguma tabela/coluna nova no Supabase (prefira reaproveitar as que existem).
- Não crie PR nesta etapa. Só o plano.

## Etapa 1: dados da era + insígnias
- Extraia do protótipo para arquivos de dados (ex.: `src/eras/web/data/`): `ERA` (10 trilhas), `ERA_BOSS` (Eco), `SPECIAL` (rara e lendária), `MOONS` (3 luas), `BRANCHES` (ramificações).
- Cada missão fica como dado (`type`, `title`, `sub`, `time`, tokens/itens/linhas, `check`, `capture`). Nada de texto fixo dentro de componente.
- Porte o gerador de insígnias (`badgeSVG` + `ICON`) para um componente `<GemBadge />`: gema lapidada com ícone, variações **rara** (estrela roxa), **lendária** (raios dourados girando + brilho) e **lua** (moldura crescente).
- Registre as 15 insígnias no sistema de insígnias existente: 10 da era, rara “Guardião do Portfólio”, lendária “Tecelão da World Wide Web” e 3 exclusivas das luas (Coroa da Marcação, Prisma Cascata, Motor de Eventos).

## Etapa 2: motores de missão (componentes reutilizáveis)
Crie os 6 motores como componentes genéricos, que recebem a missão por props e chamam `onWin()` / `onFail(msg)`:
- **OrderMission**: toca as peças na ordem. Acerto encaixa, erro treme. 3 erros = falha. Prévia opcional.
- **SortMission**: uma carta por vez, toque no balde certo.
- **CatchMission**: itens caindo (requestAnimationFrame). Toque só nos certos até atingir `need`.
- **BugMission**: toque nas linhas com bug. Mostra o `why` ao acertar.
- **CodeMission**: editor + prévia ao vivo num iframe `srcdoc`. Verifica sozinho enquanto a pessoa digita (debounce ~450ms), com teclas rápidas para celular (`< > / { } ; ( )`) e botão de dica. O código roda só no iframe da prévia e o `check` lê o `contentDocument`/`contentWindow` dele.
- **TuneMission**: arena com alvo tracejado. A pessoa ajusta as propriedades CSS (modos box, flex, grid e pos) até encaixar.
- Um **runner** comum controla missão X/N, barra de tempo, 3 corações, XP (+10 por missão), dica da Sintaxe após erro e a tela “A linha do tempo ramificou” quando os corações acabam.

## Etapa 3: tela da Era da Web + portfólio
- Portal da Era da Web no mapa principal, seguindo o padrão dos outros portais.
- Tela da era: intro curta da Sintaxe (pede o nome só se o jogo ainda não tiver o nickname), trilha em zigue-zague com portais animados e linha curva ligando os portais (a parte concluída fica animada).
- Trilhas destravam em sequência. Ao concluir: +50 XP, animação da insígnia caindo e “peça do portfólio liberada”.
- **Portfólio do jogador**: gerado a partir do que ele escreveu nas missões (nome, bio, links, cor) + peças liberadas (título, seções semânticas, cores, cards, flex, saudação por horário, modo escuro). Salvar no progresso do Supabase junto com o nickname. Gaveta com prévia num “navegador” e botões **Copiar index.html / style.css / script.js**, com a dica de publicar grátis no GitHub Pages ou na Vercel.

## Etapa 4: chefe Eco
- Batalha com barra de vida (1 golpe por missão certa), rosto glitch “E C O” e as 6 missões do protótipo com tempo.
- Vitória = insígnia **rara**. Vitória **sem perder nenhum coração** = insígnia **lendária** também.
- Tela final com a frase: “Com o Eco derrotado, os fragmentos da Web viraram três luas…”.

## Etapa 5: luas fora da era
- Depois do Eco, as 3 luas aparecem **no mapa principal**, orbitando o portal da Era da Web (antes disso não aparecem).
- Cada lua abre sua própria tela: 5 trilhas em sequência + chefe (O Silenciador, Glitch Cromático, Loop Infinito) com as missões do protótipo.
- Trilha de lua: +40 XP. Chefe de lua: +150 XP e a insígnia exclusiva daquela lua.
- Se já existir um componente de luas no jogo, **reaproveite** em vez de criar outro.

## Etapa 6: Evento Nexus → Ramificações
- Quando as 3 luas estiverem vencidas, dispare o **Evento Nexus existente** (mesma animação e lógica usadas nas outras eras).
- Abrem os portais React, Next.js (mostrar como ramo do React), Vue e Angular. Ao tocar, aparece a Sintaxe com as 5 trilhas planejadas + chefe e o link da doc oficial, marcado como “em construção”, até criarmos o conteúdo.
- Node.js aparece bloqueado com a fala: “Node.js leva o JavaScript para o servidor. Ele abre a próxima era: a do Back-end.”

## Etapa 7: acabamento e teste
- Teste o fluxo completo em 400px e no desktop: era → Eco → luas → Nexus → ramificações.
- `prefers-reduced-motion` desliga as animações pesadas.
- Nenhum erro no console. Build da Vercel passando.
- Se o jogo tiver um modo de teste/admin, adicione “liberar Era da Web” lá. Se não tiver, não crie.
- Atualize o README/docs da pasta da era com o que foi feito.
