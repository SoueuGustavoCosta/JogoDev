# Jogo Do Desenvolvedor — Conceito Central

> Documento de referência para anexar no Claude Code. Explica a ideia, a história e o padrão visual/funcional que todas as ilhas do jogo devem seguir.

---

## 1. A ideia em uma frase

Um jogo educativo de programação onde o jogador viaja pelo tempo, pulando de era em era da tecnologia — do papel ao banco de dados — guiado pela **Senhorita Sintaxe**, enquanto aprende de verdade escrevendo código real em cada parada.

## 2. Inspiração

A estrutura narrativa é inspirada na série **Loki**: viagem no tempo entre eras, um "TVA" que organiza as linhas do tempo da tecnologia, e um mistério que só se revela aos poucos. Assim como Loki descobre que está perseguindo uma variante dele mesmo, o jogador vai descobrindo, aos poucos, que o "bug" que está causando a bagunça nas eras é ele mesmo — uma versão anterior do próprio jogador, menos experiente com código.

Cada era representa uma tecnologia (banco de dados, lógica de programação, linguagens, Git/GitHub, Docker...). O jogador não está "estudando matérias" — está consertando o tempo, era por era, aprendendo o que for necessário para reparar cada uma.

## 3. A guia: Senhorita Sintaxe

- Personagem central que acompanha o jogador em toda a jornada.
- Aparece sempre que o jogador entra em uma nova ilha/era: puxa conversa, dá contexto da época, explica o que aconteceu ali e só depois libera a entrada no jogo daquela fase.
- Função narrativa: é ela quem vai, aos poucos, revelando a verdade sobre o "bug" (o próprio jogador do passado) — a revelação deve ser gradual, plantada em falas ao longo de várias ilhas, nunca entregue de uma vez.
- Tom de voz: parceira, bem-humorada, nunca professoral. Fala como alguém debugando o código junto com o jogador, não como quem está dando aula.

## 4. Fluxo de cada ilha (padrão obrigatório)

Toda ilha nova segue sempre a mesma sequência:

1. **Chegada** — tela de abertura da era/ilha.
2. **Conversa com a Senhorita Sintaxe** — ela contextualiza a época, solta uma pista da história maior, e apresenta o desafio daquela ilha em linguagem simples.
3. **Abertura do jogo** — só depois da conversa o jogador entra na parte jogável.
4. **Trilha de fases** — dentro da ilha, progressão visual em fases/etapas (igual ao padrão já usado nas ilhas existentes).
5. **Pequeno leitor/terminal de código** — uma caixa de código real (estilo do que já existe no SQL Rescue): o jogador digita o comando/código pedido, recebe feedback imediato (acerto/erro), com pistas quando erra.
6. **Missões** — desafios curtos e nomeados dentro da fase (ex.: "Missão 1 — Construa sem demolir"), cada uma focada em um conceito por vez.
7. **Fechamento da ilha** — recompensa/feedback final e gancho para a próxima era.

## 5. Estilo visual

- **Tema padrão: escuro**, com acentos neon/coloridos variando conforme o tema de cada ilha (ex.: neon verde/roxo para Git-GitHub, azul para banco de dados).
- **Tema claro como alternativa** — deve poder ser ativado quando fizer sentido (opção do jogador ou contexto da ilha), sem quebrar a identidade visual.
- Visual "bem bacana e diferente": cartões arredondados, gradientes, emojis como parte da identidade, nada de cara de curso corporativo.

## 6. Linguagem

- Simples, jovem, direta — como se estivesse conversando com um amigo.
- Zero jargão técnico desnecessário: quando um termo técnico é essencial, ele é explicado na hora, dentro da própria fala da Senhorita Sintaxe.
- Nada de tom formal ou de "aula". A sensação é de jogo, não de curso.

## 7. Como isso se encaixa no que já existe

- O jogo já tem ilhas construídas (era do banco de dados) e está sendo expandido (próxima: Git/GitHub, tema escuro + neon).
- Esse documento não substitui o conteúdo técnico de cada ilha — ele é a camada de história, personagem e padrão de experiência que **toda** ilha nova deve respeitar daqui para frente.
- Repositório: https://github.com/SoueuGustavoCosta/JogoDev — deploy via Vercel.
