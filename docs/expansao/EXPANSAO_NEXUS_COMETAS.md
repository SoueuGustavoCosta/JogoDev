# Expansão: Eventos Nexus e Cometas de Tecnologia

Documento de trabalho para o Claude Code. Salvar em `docs/expansao/` no repositório.

Stack: React, Git/GitHub, Vercel (Hobby), Supabase (Free). Tudo precisa continuar no plano gratuito.

---

## 0. Regras antes de começar

1. **Leia o repositório primeiro.** Entenda como ilhas, fases, chefes, insígnias, XP, corações, progresso salvo e a guia Senhorita Sintaxe já funcionam. Use o nome e a personalidade da guia exatamente como já estão no código.
2. **Não apague nem reescreva o que já existe.** Esta expansão só adiciona. Se algo precisar mudar em código existente, explique no PR o motivo.
3. **Trabalhe em etapas** (seção 6). Uma etapa por PR. Só avance quando o Gustavo fizer o merge.
4. **Siga os padrões do projeto**: mesma estrutura de pastas, mesmo formato de conteúdo, mesmos componentes de fase/desafio/chefe/insígnia. Conteúdo fica separado do motor, como já é feito hoje.
5. **Mantenha a essência do jogo**: viagem no tempo, tema Loki/AVT, visual escuro com neon, linguagem simples para jovens iniciantes, a guia comentando cada passo, vitórias pequenas e frequentes, insígnias colecionáveis.
6. **Fonte de conteúdo: somente a documentação oficial** de cada tecnologia (links na seção 5). Toda trilha termina com o link da página da documentação usada.

---

## 1. Ramificações e Evento Nexus

As antigas "luas" passam a se chamar **Ramificações**.

- Quando o jogador conclui uma ilha (derrota o chefe final), dispara um **Evento Nexus**: flash laranja, leve distorção na tela e a guia anunciando que a linha do tempo se ramificou.
- Do portal da ilha saem **três fios de luz trançados** que sobem até **três portais de frameworks**. Cada portal abre quando o fio chega.
- A guia pode fazer a ligação com o Git: "assim como um branch, a linha do tempo se divide e cada ramo segue seu próprio caminho".
- Os portais continuam visíveis no mapa depois de abertos, com o vórtice girando.

### Os três Eventos Nexus

| Ilha | Ramificação 1 | Ramificação 2 | Ramificação 3 |
|---|---|---|---|
| Python | Django | FastAPI | Flask |
| Java | Spring Boot | Javalin | Quarkus |
| PHP | Laravel | Symfony | CodeIgniter |

Se alguma dessas ilhas ainda não existir no jogo, crie as ramificações dela como dados, mas deixe o Evento Nexus bloqueado com o aviso "Em breve" até a ilha ser lançada.

---

## 2. Estrutura de cada ramificação e cometa

Vale para os 9 frameworks e os 3 cometas:

- **5 trilhas**, em ordem, uma liberando a próxima.
- Cada trilha: explicação curta, exemplos de código coloridos, perguntas, falas da guia e **1 desafio** no final (montar ou digitar código, no estilo que o jogo já usa).
- **1 chefe final** depois da trilha 5, no mesmo formato dos chefes das ilhas (corações, sem alternativas fáceis). Cada chefe tem nome e personalidade de vilão ligado à tecnologia, como o Loopus Infinitus.
- **1 insígnia** ao vencer o chefe, entrando na coleção existente.
- Nível **iniciante**: frases curtas, um conceito por vez, sem jargão sem explicação.

---

## 3. Conteúdo das ramificações (5 trilhas cada)

Sugestão de trilhas. Ajuste só se a documentação oficial organizar de outro jeito.

**Django**: 1) o que é e como criar um projeto; 2) apps, URLs e views; 3) templates; 4) models e o admin; 5) formulários.
**FastAPI**: 1) primeira API e o `uvicorn`; 2) parâmetros de rota e de consulta; 3) corpo da requisição com Pydantic; 4) respostas e códigos de status; 5) documentação automática e testes.
**Flask**: 1) primeiro app; 2) rotas e métodos HTTP; 3) templates com Jinja; 4) formulários e requisições; 5) organizando o projeto com Blueprints.

**Spring Boot**: 1) criar o projeto com Spring Initializr; 2) primeiro controller REST; 3) injeção de dependência e beans; 4) acesso a dados com Spring Data JPA; 5) configuração e perfis.
**Javalin**: 1) primeiro servidor; 2) rotas e handlers; 3) parâmetros e JSON; 4) tratamento de erros; 5) uma API pequena completa.
**Quarkus**: 1) criar o projeto e o modo dev; 2) primeiro endpoint REST; 3) injeção de dependência; 4) banco de dados com Panache; 5) configuração e build.

**Laravel**: 1) instalação e estrutura; 2) rotas; 3) controllers e views com Blade; 4) banco com migrations e Eloquent; 5) validação de formulários.
**Symfony**: 1) criar o projeto; 2) rotas e controllers; 3) templates com Twig; 4) banco com Doctrine; 5) formulários.
**CodeIgniter**: 1) instalação e estrutura MVC; 2) rotas e controllers; 3) views; 4) models e banco de dados; 5) formulários e validação.

---

## 4. Cometas de tecnologia

Eventos temporários que mantêm o jogo atualizado enquanto novas ilhas não saem.

### Calendário

- Cada cometa fica **14 dias** no céu.
- Depois que um some, o céu fica limpo por **1 dia** e entra o próximo.
- Ordem inicial: **Docker → Linux → Git**.
- Datas de início e fim ficam em **dados** (tabela no Supabase ou no arquivo de conteúdo, seguindo o padrão do projeto), para trocar o calendário sem mexer em código.
- Depois do terceiro cometa, o céu mostra "Novos cometas em breve" até novos dados serem cadastrados.

### Comportamento na tela

- O cometa entra pela **direita** no primeiro dia e anda devagar até a **esquerda**. A posição é calculada pelo tempo: `progresso = (agora - inicio) / (fim - inicio)`.
- Faz uma curva suave pelo céu, com cauda que afina, ondula de leve e solta faíscas. A cauda fica sempre atrás do movimento (lado direito).
- Tocar no cometa abre um card com nome, número de trilhas e contagem regressiva.
- Nas **últimas 24 horas** o cometa e o card ficam rosa e o cometa treme um pouco.
- Ao chegar no fim, o cometa some. Durante o intervalo, mostrar quando o próximo chega.

### Depois que o cometa passa

- O progresso do jogador fica salvo.
- O cometa vai para o **Arquivo da AVT**, onde quem perdeu pode jogar depois.
- Quem concluiu durante o evento ganha a **insígnia rara**; quem joga pelo Arquivo ganha a versão comum.

### Conteúdo dos cometas (5 trilhas cada)

**Docker**: 1) o que é um container e por que existe; 2) imagens e o primeiro `docker run`; 3) escrevendo um Dockerfile; 4) volumes e portas; 5) Docker Compose.
**Linux**: 1) o terminal e navegação (`pwd`, `ls`, `cd`); 2) arquivos e pastas; 3) permissões; 4) processos e pacotes; 5) primeiro script em shell.
**Git**: 1) o que é controle de versão e `git init`; 2) `add`, `commit` e histórico; 3) **branches** (liga direto com as Ramificações e a trama do jogo); 4) `merge` e conflitos; 5) GitHub, `push` e pull request.

---

## 5. Fontes oficiais

| Tecnologia | Documentação |
|---|---|
| Django | https://docs.djangoproject.com/ |
| FastAPI | https://fastapi.tiangolo.com/ |
| Flask | https://flask.palletsprojects.com/ |
| Spring Boot | https://docs.spring.io/spring-boot/ e https://spring.io/guides |
| Javalin | https://javalin.io/documentation |
| Quarkus | https://quarkus.io/guides/ |
| Laravel | https://laravel.com/docs |
| Symfony | https://symfony.com/doc/current/index.html |
| CodeIgniter | https://codeigniter.com/user_guide/ |
| Docker | https://docs.docker.com/ |
| Linux | https://man7.org/linux/man-pages/ e https://www.gnu.org/software/coreutils/manual/ |
| Git | https://git-scm.com/doc |

Não usar blogs, vídeos ou sites de terceiros como fonte.

---

## 6. Etapas (um PR por etapa)

1. **Leitura e plano**: estudar o repositório e responder, sem alterar código, onde ficam ilhas, conteúdo, chefes, insígnias, progresso e o mapa, e como a expansão vai se encaixar.
2. **Motor das Ramificações**: modelo de dados de ramificação, Evento Nexus (animação, portais, fios trançados), bloqueio até concluir a ilha. Testar com dados de exemplo.
3. **Ramificações de Python**: Django, FastAPI e Flask completos (trilhas, desafios, chefes, insígnias).
4. **Ramificações de Java**: Spring Boot, Javalin e Quarkus.
5. **Ramificações de PHP**: Laravel, Symfony e CodeIgniter.
6. **Motor dos Cometas**: calendário em dados, cometa animado pelo tempo, card com contagem, estado de urgência, intervalo de 1 dia, Arquivo da AVT e insígnia rara/comum.
7. **Cometas**: conteúdo de Docker, Linux e Git.
8. **Revisão final**: celular (animar só `transform` e `opacity`), `prefers-reduced-motion`, textos, links das fontes e nada quebrado no que já existia.

Em cada PR: resumo do que mudou, o que foi testado e o que ficou para a próxima etapa.
