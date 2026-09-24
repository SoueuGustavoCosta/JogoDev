import type { Trail } from '@/domain/trail/types';
import { pythonModules } from './modules';

/**
 * Lua de Python: primeiro satélite da Era da Lógica, só visível no mapa depois que o
 * viajante derrota o Loopus Infinitus (ver `isEraRestored` em domain/progress e a
 * gate em `presentation/features/archipelago/TimeMap.tsx`). Trama própria: o Eco que
 * habitava a Era da Lógica se dividiu em três fragmentos ao ser derrotado, e o primeiro,
 * Onduluk, se escondeu na história real de Python — distorcendo fatos (o mais notório:
 * fingir que a linguagem foi batizada por causa da cobra, quando na verdade veio do
 * grupo de comédia Monty Python's Flying Circus). Os 8 faróis são baseados em fatos
 * reais sobre a linguagem (Guido van Rossum, CWI, 1989-1991, Zen de Python) e nos
 * tópicos centrais da linguagem; o chefe de fase reaproveita o motor `single-shot` já
 * usado pela Era da Lógica.
 */
export const pythonTrail: Trail = {
  id: 'python',
  title: 'Lua de Python',
  tagline: 'O primeiro fragmento do Eco se escondeu na história real de uma linguagem inteira.',
  symbol: 'python',
  accent: '#8a7fff',
  eyebrow: 'Satélite da Lógica · Lua de Python',
  intro: [
    'Viajante, esta lua só apareceu porque você derrotou o Loopus Infinitus. Quando eu disse que a Era da Lógica estava restaurada, eu estava errada: o bug não morreu, <b>se dividiu em três fragmentos</b>.',
    'O primeiro se escondeu aqui, disfarçado na própria história de Python. Ele se chama <b>Onduluk</b>, e adora se gabar de ser "a cobra que deu nome à linguagem" — o que nem é verdade.',
    'Cada farol que você acender nesta lua vai tirar um pedaço da farsa dele. No fim, você vai provar que ele mentiu sobre a própria origem — e isso é o que vai derrotá-lo.',
  ],
  modules: pythonModules,
  lab: null,
  completionBadgeId: 'py-rara',
  bossFight: {
    bossName: 'Onduluk',
    tagline: 'A SERPENTE QUE MENTIU SOBRE O PRÓPRIO NOME',
    intro: [
      'Onduluk se enrola em torno da lua inteira, brilhando como se fosse dono da verdade.',
      'Ele não ataca com força — ataca com confusão: indentação embaralhada, um / trocado por //, um range() contado errado, uma lista padrão compartilhada entre chamadas que nunca deveriam se falar.',
      'Você tem <b>3 corações</b>. Cada resposta errada custa um. Sem múltipla escolha aqui: escreva exatamente o que o farol te ensinou.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    rounds: [
      {
        title: 'Rodada 1 — A gramática dos espaços',
        description:
          'if idade >= 18:\nprint("Pode dirigir")  →  A segunda linha não está recuada. Qual erro Python acusa? (nome exato do erro)',
        talk: 'Espaço é só estética, não é?',
        hint: 'Sem indentação, o bloco não existe para o Python: o erro se chama IndentationError.',
        check: ['indentation\\s*error'],
      },
      {
        title: 'Rodada 2 — A divisão que engana',
        description: 'print(7 // 2)  →  O que este código imprime? (só o número)',
        talk: 'Um símbolo a mais, um resultado a menos...',
        hint: '// é a divisão inteira: 7 // 2 descarta as casas decimais e vale 3.',
        check: ['^3$'],
      },
      {
        title: 'Rodada 3 — Um a menos, ou um a mais?',
        description: 'for i in range(1, 5): print(i)  →  Quantos números esse laço imprime, ao todo?',
        talk: 'Ninguém nunca sabe onde o range() para...',
        hint: 'range(1, 5) gera 1, 2, 3, 4 — quatro números, parando antes do 5.',
        check: ['^4$'],
      },
      {
        title: 'Rodada 4 — A lista que não deveria lembrar',
        description:
          'def adicionar(item, carrinho=[]): ...  →  Para consertar essa função, qual valor deve substituir [] como padrão de carrinho?',
        talk: 'Uma lista, um segredo, compartilhado para sempre...',
        hint: 'O valor padrão mutável é criado uma única vez; o conserto é usar None e criar a lista de verdade dentro da função.',
        check: ['^none$'],
      },
      {
        title: 'Rodada 5 — Vazio não é mentira, mas também não é verdade',
        description: 'carrinho = []\nif carrinho:\n    print("cheio")\nelse:\n    print("vazio")  →  O que é impresso?',
        talk: 'Vazio... quase como verdadeiro, não?',
        hint: 'Uma lista vazia é "falsa" dentro de um if: o else roda, e o programa imprime vazio.',
        check: ['^vazio$'],
      },
      {
        title: 'Rodada 6 — Fatiando com precisão',
        description: 'numeros = [10, 20, 30, 40, 50]\nprint(numeros[1:3])  →  O que é impresso? (com colchetes)',
        talk: 'Escolha o pedaço errado, e eu escolho por você...',
        hint: 'O slicing pega do índice 1 até antes do índice 3: [20, 30].',
        check: ['\\[\\s*20\\s*,\\s*30\\s*\\]'],
      },
      {
        title: 'Rodada 7 — Perguntar sem quebrar',
        description:
          'viajante = {"nome": "Ana"}\nprint(viajante.???("cidade"))  →  Qual método no lugar de ??? devolve None em vez de dar erro, se a chave não existir?',
        talk: 'KeyError é a minha arma favorita!',
        hint: 'dicionario.get("chave") devolve None com segurança, sem lançar KeyError.',
        check: ['^\\.?get\\(?\\)?$'],
      },
      {
        title: 'Rodada 8 — Golpe final: o nome de verdade',
        description:
          'Onduluk se gaba de ser "a cobra que deu nome a Python". Digite o verdadeiro motivo do nome: o grupo de comédia britânico do qual Guido van Rossum era fã.',
        talk: 'Eu SOU a origem do nome! Ninguém prova o contrário!',
        hint: 'Guido era fã do grupo de comédia Monty Python\'s Flying Circus — a cobra veio muito depois, por trocadilho da comunidade.',
        check: ['monty\\s*python'],
      },
    ],
    badgeId: 'py-onduluk',
    badgeTitle: 'Domador de Onduluk',
    badgeDescription: 'Derrotou Onduluk provando a verdadeira origem do nome Python: a coroa da Lua de Python.',
  },
};
