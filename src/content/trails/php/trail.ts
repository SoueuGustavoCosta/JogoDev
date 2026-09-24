import type { Trail } from '@/domain/trail/types';
import { phpModules } from './modules';

/**
 * Lua de PHP: terceiro e último satélite da Era da Lógica, liberado junto com as luas
 * de Python e Java (todas exigem `isEraRestored('logica')`). Trama própria: o terceiro
 * e último fragmento do Eco, Malabari, se esconde na história real de PHP e no seu
 * "malabarismo de tipos" (type juggling) — coroado pelo fato real de que o PHP 8 (2020)
 * corrigiu a comparação solta entre número e string, que antes convertia qualquer texto
 * não-numérico para 0. Uma reviravolta particular desta lua: PHP é a própria linguagem
 * usada pelo chefe da Era da Lógica (Loopus Infinitus) e pelo laboratório dela — o
 * viajante já usou PHP sem saber. Os 8 faróis cobrem fatos reais (Rasmus Lerdorf, 1994,
 * "Personal Home Page Tools", Zend Engine) e os tópicos centrais da linguagem; o chefe
 * de fase reaproveita o mesmo motor `single-shot` das outras duas luas.
 */
export const phpTrail: Trail = {
  id: 'php',
  title: 'Lua de PHP',
  tagline: 'O terceiro e último fragmento do Eco se escondeu numa linguagem que você já usou sem saber.',
  symbol: 'php',
  accent: '#6fb8ff',
  eyebrow: 'Satélite da Lógica · Lua de PHP',
  intro: [
    'A última lua, {name}. Onduluk e Nulo caíram, e sobra Malabari — o fragmento que se esconde em comparações que trocam de tipo no ar, sem avisar.',
    'Você já enfrentou PHP antes, sem saber: o Loopus Infinitus, lá na Era da Lógica, foi escrito nesta mesma linguagem. Agora é hora de conhecê-la de verdade, além do que o laboratório mostrou.',
    'Acenda os 8 faróis, e no fim você vai provar a Malabari que até o malabarismo de tipos mais famoso da programação já foi corrigido — e sabe exatamente quando.',
  ],
  modules: phpModules,
  lab: null,
  completionBadgeId: 'php-rara',
  bossFight: {
    bossName: 'Malabari',
    tagline: 'O MESTRE DA COMPARAÇÃO SOLTA',
    intro: [
      'Malabari joga tipos para o alto como bolas de malabarismo — número vira texto, texto vira número, e ninguém sabe onde vai cair.',
      'Ele ataca escondido em comparações soltas, em arrays mal acessados, em variáveis $ mal escritas.',
      'Você tem <b>3 corações</b>. Cada resposta errada custa um. Escreva exatamente o que cada farol te ensinou.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    rounds: [
      {
        title: 'Rodada 1 — A porta de entrada',
        description: 'Qual tag abre um bloco de código PHP dentro de um arquivo? (com o ponto de interrogação)',
        talk: 'Sem essa tag, nem eu existiria!',
        hint: 'Todo bloco de código PHP começa com <?php',
        check: ['^<\\?php$'],
      },
      {
        title: 'Rodada 2 — O símbolo de toda variável',
        description: 'Qual símbolo precede toda variável em PHP, sempre — tanto ao declarar quanto ao usar? (só o símbolo)',
        talk: 'Sem esse símbolo, suas variáveis nem existem!',
        hint: 'Toda variável PHP é escrita com $ na frente.',
        check: ['^\\$$'],
      },
      {
        title: 'Rodada 3 — Sem malabarismo',
        description: 'var_dump(0 == "0")  →  true, mas pode ser enganoso. Qual operador (3 caracteres) compara valor E tipo, sem nenhuma conversão?',
        talk: 'Comigo, ninguém escapa da conversão!',
        hint: '=== nunca converte tipos: compara valor e tipo ao mesmo tempo.',
        check: ['^===$'],
      },
      {
        title: 'Rodada 4 — Argumentos sem limite',
        description: 'function somar(???$numeros) { return array_sum($numeros); }  →  Qual sintaxe (3 caracteres) permite receber uma quantidade variável de argumentos?',
        talk: 'Quantos argumentos você acha que consegue segurar?',
        hint: 'Os três pontos (...) antes do parâmetro recolhem os argumentos extras num array.',
        check: ['^\\.\\.\\.$'],
      },
      {
        title: 'Rodada 5 — Um valor padrão, sem malabarismo',
        description: '$nomeFinal = $nome ??? "Viajante";  →  Qual operador (2 caracteres) devolve o valor padrão só se $nome for null?',
        talk: 'Um valor ausente é uma oportunidade para mim!',
        hint: 'O operador ?? (null coalescing) resolve isso numa linha, sem malabarismo.',
        check: ['^\\?\\?$'],
      },
      {
        title: 'Rodada 6 — Dados de um formulário',
        description: 'Qual superglobal guarda os dados enviados por um formulário HTML com method="post"? (com o $ e o underline)',
        talk: 'De onde vêm os dados, você nem sabe!',
        hint: '$_POST guarda os dados enviados no corpo de uma requisição POST.',
        check: ['^\\$_post$'],
      },
      {
        title: 'Rodada 7 — O próprio objeto',
        description: 'Dentro de um método de uma classe PHP, qual variável especial se refere ao próprio objeto? (com o $)',
        talk: 'Nem você sabe quem é "você" aqui dentro!',
        hint: '$this se refere ao objeto atual, dentro de um método de instância.',
        check: ['^\\$this$'],
      },
      {
        title: 'Rodada 8 — Golpe final: quando o malabarismo foi corrigido',
        description:
          'Malabari se gaba de que "0 == \'abc\' sempre foi e sempre será true". Mentira: em qual versão do PHP essa comparação específica deixou de ser verdadeira? (só o número)',
        talk: 'Eu sou eterno! Nenhuma versão me muda!',
        hint: 'O PHP 8 (2020) corrigiu a comparação solta entre número e string não-numérica, que antes convertia a string para 0.',
        check: ['^8$'],
      },
    ],
    badgeId: 'php-malabari',
    badgeTitle: 'Domador de Malabari',
    badgeDescription: 'Derrotou Malabari provando quando o malabarismo de tipos foi corrigido: a coroa da Lua de PHP.',
  },
};
