# Eventos Nexus e Cometas: leitura do repositório e plano (Etapa 1)

Resposta à Etapa 1 de `docs/expansao/EXPANSAO_NEXUS_COMETAS.md`. Nenhum código foi alterado nesta etapa.
Referência visual: `docs/expansao/prototipos/prototipo_cometa.html`.

---

## 1. Onde fica cada coisa hoje

| O quê | Onde | Como funciona |
|---|---|---|
| **Ilhas / eras / luas** | `src/content/trails/<id>/trail.ts` + `src/content/registry.ts` | Cada trilha é um objeto `Trail` (`domain/trail/types.ts`). As luas de Python, Java e PHP (satélites da Era da Lógica) e as luas da Modelagem e do Guardião (Era dos Dados) também são `Trail` comuns, cada uma com a sua pasta. |
| **Conteúdo** | `src/content/trails/<id>/modules/*.ts` | Um arquivo por módulo (`Module`): `blocks` (texto, `code`, `table`, `note`...) e `quiz` (múltipla escolha, completar, `order`, `output`, `bug`). O jogo chama os módulos de **faróis**. Tudo é validado com Zod em teste. |
| **Chefes** | `Trail.bossFight` (tipos em `domain/bossFight/types.ts`, motor em `domain/bossFight`, tela em `presentation/features/bossfight/BossFightPage.tsx`) | 3 rodadas, 3 vidas (`lifeLabel`, o **♥** das luas de linguagem), dica com penalidade, rodadas com blocos (`choices`) para jogar só com toque. Abre quando todos os módulos da trilha estão concluídos. |
| **Insígnias** | `src/content/badges/catalog.ts` + imagens em `public/badges/<trilha>/` | Comuns (`unlockedBy` = id do módulo), rara (`completionBadgeId`, ao concluir a trilha) e lendária (`bossFight.badgeId`, ao vencer o chefe). Já existe precedente de imagem SVG (`public/badges/python/rara.svg`). |
| **XP** | `domain/progress/xp.ts` | 100 por pergunta de primeira, 40 depois de errar, +150 por módulo. O total soma trilhas, anomalias, oficinas e XP extra. |
| **Progresso salvo** | `domain/progress/types.ts` (formato v1), `infrastructure/storage`, nuvem pelo Supabase | Por trilha → módulo → pergunta, mais campos opcionais na raiz. Todo campo novo é opcional, entra no `mergeProgress` e tem teste. Tudo passa por `withQuizIdMigration`. |
| **Senhorita Sintaxe** | `presentation/design-system/Sintaxe.tsx`; falas em `Trail.intro`, `bossFight.intro`/`talk` e na caixa `SINTAXE · ...` do mapa | Tom acolhedor e direto, fala com "Viajante". |
| **Mapa** | `presentation/features/archipelago/{mapData.ts,TimeMap.tsx}` | SVG 1000×1300 com câmera (arrastar e pinça). Eras, luas (`satellites`, que abrem quando o chefe da era-mãe é vencido), personagens, o Eco e uma ficha (`sheet`) ao tocar. |
| **Eventos com data** | `src/content/events/calendar.ts` + `domain/events` | Etapa 11: Surto, Eco Solto e Convergência, com datas em dados e teste que recusa data errada. É o modelo que os cometas vão copiar. |

## 2. Como a expansão se encaixa

### 2.1 Nomes (decisão a confirmar)

O documento diz que "as antigas luas passam a se chamar Ramificações". No jogo, as luas (Python, Java, PHP, Modelagem, Guardião) já são trilhas com progresso. Os frameworks são um nível novo: eles saem de uma lua.

**Proposta:**
- As luas continuam se chamando luas.
- **Ramificação** é o nome dos portais de framework que saem de uma lua depois do chefe dela. Assim nada do que existe é renomeado nem apagado.

`TODO(autor)`: se a ideia for mesmo renomear "Lua de Python" para outra coisa na tela, é só um ajuste de texto numa etapa separada.

### 2.2 Ramificações (Etapas 2 a 5)

**Cada framework é uma `Trail` comum**, com id próprio (`ram-django`, `ram-fastapi`, `ram-flask`, `ram-spring-boot`...), em `content/trails/<id>/` e registrada no `registry.ts`. Assim ela herda de graça quiz, XP, progresso, merge, nuvem, chefe, insígnias, "Continuar de onde parou" e Liga.

**Evento Nexus em dados:** um arquivo novo `src/content/nexus.ts` diz qual lua abre quais Ramificações e se cada Evento Nexus já está lançado:

```ts
{ island: 'python', branches: ['ram-django', 'ram-fastapi', 'ram-flask'], launched: true }
```

Com `launched: false`, os portais aparecem com o aviso "Em breve". Python, Java e PHP já existem, então os três ficam `launched` quando o conteúdo chegar.

**Regras puras** (`domain/nexus`, sem React):
- **Quando a Ramificação abre:** quando a lua-mãe foi restaurada (`bossDefeated`). A regra é a mesma de `isEraRestored`.
- **Evento Nexus uma vez só:** a cena completa roda uma vez por lua. Ela fica marcada num campo opcional novo, `nexusSeen?: Record<ilha, data>`, que entra no merge (união, fica a data mais antiga) e ganha teste.

**Tela:**
- Componente `NexusScene` em `presentation/features/nexus/`, a partir do protótipo:
  - portal da lua embaixo e três fios de luz trançados subindo até três portais;
  - cada portal abre quando o fio chega;
  - vórtice girando;
  - animação só com `transform` e `opacity`;
  - com `prefers-reduced-motion`, vai direto ao estado final.
- **Onde aparece:** na tela da lua (`TrailOverview`), depois do chefe. Na primeira vez, toca a animação completa:
  - flash laranja e leve distorção;
  - a Sintaxe diz: "Assim como um branch no Git, a linha do tempo se dividiu, e cada ramo segue o seu caminho."
  - O botão "Voltar" do chefe vencido leva direto para ela.
- **No mapa:** a lua aberta ganha um anel de vórtice girando. A ficha dela lista os três portais. Pôr 9 portais soltos em volta da Era da Lógica deixaria o mapa ilegível no celular. `TODO(autor)`: confirmar.

**Estrutura de cada Ramificação:**
- 5 módulos em sequência, porque o padrão do app já é um liberar o próximo.
- Cada módulo tem:
  - explicação curta e exemplos de código;
  - perguntas;
  - falas da Sintaxe nos `note`;
  - por último, **um desafio**: uma pergunta `order` (montar a linha) ou `bug`/`fill`, com id `desafio`.
- **Por que não um editor que roda o código:** o jogo não roda Python nem Java no navegador. O bloco `try` hoje só tem SQL, PHP e Git. Os desafios usam os formatos de toque que o jogo já tem.
- **Chefe:** `bossFight` `single-shot` com 3 rodadas, `lifeLabel: '♥'`, 3 vidas e blocos com alternativas erradas que parecem certas (nada de alternativa óbvia).
- **Nome e personalidade do chefe:** ligados à tecnologia, ex.: **Monólito** no Django, **Hidra de Endpoints** no FastAPI. Cada Etapa de conteúdo propõe os nomes, e o autor pode trocar.
- **Insígnia:** 1 lendária por Ramificação, em `catalog.ts`. A imagem é SVG original em `public/badges/nexus/`, nunca logotipo oficial. Aparece na coleção junto com as outras.
- **Fonte:** o último bloco de cada módulo é um `note` "Fonte: documentação oficial" com o link da página usada (seção 5 do documento).

**Arquivos novos:** `content/nexus.ts`, `domain/nexus/*`, `presentation/features/nexus/*`, as pastas das trilhas e as insígnias.

**Arquivos existentes que mudam, e por quê:**
- `registry.ts`: registrar as trilhas.
- `catalog.ts`: incluir as insígnias.
- `TrailOverview.tsx`: mostrar a cena.
- `TimeMap.tsx`: anel e ficha da lua.
- `progress/types.ts` e `merge.ts`: o campo `nexusSeen`.

### 2.3 Cometas (Etapas 6 e 7)

**Calendário em dados:** `src/content/comets/calendar.ts`, no mesmo padrão de `events/calendar.ts`, sem Supabase. Assim o autor troca datas editando um arquivo, e fica tudo gratuito.

```ts
{ id: 'cometa-docker', trailId: 'cometa-docker', from: '2026-10-05T00:00:00-03:00', to: '2026-10-19T00:00:00-03:00' }
```

- **Teste do calendário:** recusa `from` depois de `to`, cometas sobrepostos e trilha que não existe.
- **14 dias + 1:** vêm das datas escritas. Um teste confere 14 dias de cometa e 1 de intervalo na ordem inicial Docker → Linux → Git.

**Regras puras** (`domain/comets`): `skyAt(now, calendar)` devolve um destes estados:
- **cometa no céu:**
  - progresso = (agora − início) / (fim − início);
  - tempo que falta;
  - `urgente` nas últimas 24 h;
- **céu limpo:** com a data em que o próximo chega;
- **"Novos cometas em breve":** quando acabou o calendário.

**Tela:**
- **Cometa no mapa:** fica numa camada `<canvas>` por cima do mapa, como no protótipo:
  - curva da direita para a esquerda;
  - cauda que afina e ondula;
  - faíscas;
  - rosa e tremendo nas últimas 24 h.
- **`prefers-reduced-motion`:** o cometa fica parado na posição do dia, sem faíscas nem tremor.
- **Ao tocar no cometa:** a ficha mostra o nome, "5 trilhas", a contagem regressiva, "Entrar no cometa" e "Depois".

**Conteúdo:** cada cometa é uma `Trail` comum (`cometa-docker`, `cometa-linux`, `cometa-git`) com 5 módulos, desafios, chefe e insígnias. Ela entra no `registry.ts` como as outras, mas o mapa só a mostra pelo cometa.

**Arquivo da AVT:**
- Rota nova `/arquivo`, que lista os cometas que já passaram.
- Dá para jogar depois com o mesmo progresso, porque o progresso é da trilha e nunca some.

**Insígnia rara ou comum:**
- Cada cometa tem duas insígnias no catálogo.
- Ao vencer o chefe:
  - se `agora` está dentro da janela do cometa, ganha a **rara**;
  - senão, a **comum**.
- Quem ganhou a rara não perde a rara.
- A regra fica em `domain/comets` e é testada.

**Git:**
- Já existe a Era do Git (`git-github`).
- O cometa Git é outra trilha, mais curta e ligada à trama das Ramificações (branches).
- Os ids dos módulos são novos, então nada colide com a Era do Git.
- Os desafios podem usar o laboratório Git que já existe (`try` com `engine: 'git'`).

### 2.4 Fontes

Todo o conteúdo é escrito do zero, em português, com base só na documentação oficial listada na seção 5 do documento. Toda trilha termina com o link da página usada.

## 3. Riscos e cuidados

1. **Peso do app:**
   - O `index.js` inicial tem ~665 KB, porque o `registry.ts` importa todo o conteúdo de uma vez.
   - 9 Ramificações + 3 cometas somam 60 módulos novos.
   - Em cada PR de conteúdo, meço o tamanho. Na Etapa 8, avalio carregar o texto dos módulos sob demanda, sem mudar o formato do progresso.
2. **Mapa no celular:** os portais e o cometa não podem cobrir as eras nem os botões. Confiro sempre a 390×844, sem rolagem lateral.
3. **Progresso:** os campos novos (`nexusSeen`) são opcionais e entram no merge com teste. Nenhum id publicado muda.
4. **Ordem com o outro plano:**
   - O `PLANO-EXPANSAO.md` ainda tem as Etapas 14C, 15, 16 e 17.
   - Por pedido do autor, esta expansão (8 etapas) vem logo depois da 14B.
   - `TODO(autor)`: confirmar se a 14C (chefes das luas dos Dados) volta depois da Etapa 8 desta expansão.

## 4. Decisões pendentes (`TODO(autor)`)

- Luas continuam "luas" e Ramificações são os frameworks (seção 2.1)?
- No mapa: anel na lua e portais na tela da lua, ou portais soltos no mapa (seção 2.2)?
- Data de início do primeiro cometa. Proposta: segunda-feira seguinte ao merge da Etapa 7.
- Nomes dos 12 chefes: cada Etapa de conteúdo propõe, o autor pode trocar.
