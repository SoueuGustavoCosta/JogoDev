import type { Trail } from '@/domain/trail/types';
import { logicaModules } from './modules';

/**
 * Migrado de Ilha_da_Logica_PHP_1.html: 10 faróis de lógica de programação (a "ilha que
 * nasce primeiro", ensinada em PHP) e o chefe de fase Loopus Infinitus, adaptado do
 * array `BOSS` do protótipo (10 rodadas — 8 de resposta digitada, 2 de "monte o
 * código" — para o motor `single-shot` já existente em domain/bossFight: cada rodada
 * é "um bloco só" onde os padrões de `check` precisam bater no texto digitado, o mesmo
 * modelo que a Era dos Dados já usa).
 */
export const logicaTrail: Trail = {
  id: 'logica',
  title: 'Era da Lógica',
  tagline: 'A era que nasce primeiro: antes de qualquer linguagem, existe a lógica.',
  symbol: 'logic-diamond',
  accent: '#2dff8a',
  eyebrow: 'Era 2 · Era da Lógica',
  intro: [
    'Viajante, esta é a <b>Era da Lógica</b> — a que nasce antes de todas as outras. Aqui não tem linguagem nenhuma ainda: só a ideia de resolver um problema em passos, na ordem certa.',
    'O Eco esteve aqui primeiro. Ele apagou pedaços da história — al-Khwarizmi, Ada Lovelace, o primeiro "hello, world" — achando que ia mais rápido pulando direto para o código. Só que sem entender o "porquê", ele deixou rastros: laços que nunca terminam, condições que confundem atribuição com comparação.',
    'Vamos reacender os dez faróis desta era, um por um, até você estar pronto para enfrentar o próprio bug que o Eco deixou pra trás: o <b>Loopus Infinitus</b>. Bora?',
  ],
  modules: logicaModules,
  lab: 'php',
  bossFight: {
    bossName: 'Loopus Infinitus',
    tagline: 'UM WHILE(TRUE) QUE NUNCA TERMINOU',
    intro: [
      'Ele se escondeu no único lugar onde ninguém procura: dentro de um laço que não termina.',
      'Loopus Infinitus não é um vilão de fora — é um bug que nasceu de um <code>while(true)</code> esquecido, um <code>=</code> no lugar de um <code>==</code>, um contador que nunca foi incrementado. Cada farol que você acendeu ensinou exatamente o que ele explora.',
      'Você tem <b>3 corações</b>. Respostas erradas custam um coração. Aqui não há alternativas de múltipla escolha: você digita ou monta o código, do jeito que o Estudo Dirigido pede de verdade.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    rounds: [
      {
        title: 'Rodada 1 — Contagem simples',
        description: 'for ($i = 1; $i <= 3; $i++) { echo $i; }  →  O que este código imprime? (só os dígitos, sem espaços)',
        talk: 'Haha! Mais uma volta!',
        hint: 'O laço roda com $i = 1, 2 e 3, e imprime cada valor: a resposta é 123.',
        check: ['^123$'],
      },
      {
        title: 'Rodada 2 — A linha que falta',
        description:
          '$n = 0; while ($n < 5) { echo $n; ??? }  →  Escreva a linha que falta no lugar de ??? para o laço terminar.',
        talk: 'while (true)... ninguém sai daqui.',
        hint: 'Sem modificar a variável de controle, o teste nunca fica falso: use $n++;',
        check: ['^(\\$n\\+\\+|\\+\\+\\$n|\\$n\\+=1|\\$n=\\$n\\+1);?$'],
      },
      {
        title: 'Rodada 3 — Monte o laço da máquina',
        description:
          'Monte o laço da máquina: sorteia linha e coluna e repete enquanto a casa estiver ocupada (do...while, com posicao($l, $c) == 1).',
        talk: 'Argh! Uma condição de parada!',
        hint: 'do { $l = rand(0, 2); $c = rand(0, 2); } while (posicao($l, $c) == 1);',
        check: ['do\\s*\\{', 'rand\\(0,\\s*2\\)', 'while\\s*\\(posicao\\(\\$l,\\s*\\$c\\)\\s*==\\s*1\\)'],
      },
      {
        title: 'Rodada 4 — O bug clássico',
        description:
          'if ($x = 5) { echo "cinco"; }  →  Esse if tem o bug clássico. Digite o operador que deveria estar no lugar do =.',
        talk: 'Erro de sintaxe do seu lado!',
        hint: '= atribui; == compara. O operador certo é ==.',
        check: ['^===?$'],
      },
      {
        title: 'Rodada 5 — Endereço da matriz',
        description: '$m = [[1, 2], [3, 4]]; echo $m[1][0];  →  Qual valor é impresso?',
        talk: 'Você leu o código melhor do que eu.',
        hint: 'Linha 1 (a segunda), coluna 0 (a primeira): $m[1][0] vale 3.',
        check: ['^3$'],
      },
      {
        title: 'Rodada 6 — Laço dentro de laço',
        description:
          'for ($i = 0; $i < 3; $i++) { for ($j = 0; $j < 4; $j++) { echo "*"; } }  →  Quantos asteriscos são impressos?',
        talk: 'Impossível... o contador estava certo!',
        hint: '3 voltas de fora x 4 voltas de dentro = 12.',
        check: ['^12$'],
      },
      {
        title: 'Rodada 7 — Por referência',
        description: 'function dobrar(?$n) { $n = $n * 2; }  →  Qual símbolo no lugar de ? faz a função alterar a variável original?',
        talk: 'Meu laço está encolhendo...',
        hint: 'Com &$n, a função recebe a variável de fora, não uma cópia.',
        check: ['^&$'],
      },
      {
        title: 'Rodada 8 — A memória do servidor',
        description: 'Qual variável superglobal do PHP guarda o tabuleiro de uma requisição para outra? (com o $)',
        talk: 'Você leu o código melhor do que eu.',
        hint: 'O HTTP não tem memória; quem lembra por você é o $_SESSION.',
        check: ['^\\$_session$'],
      },
      {
        title: 'Rodada 9 — Percorrendo o tabuleiro',
        description: 'Monte os dois laços que percorrem as 9 casas do tabuleiro (linhas e colunas, de 0 até LIM).',
        talk: 'Haha! Mais uma volta!',
        hint: 'for ($i = 0; $i < LIM; $i++) { for ($j = 0; $j < LIM; $j++) { echo $t[$i][$j]; } }',
        check: ['for\\s*\\(\\$i\\s*=\\s*0;\\s*\\$i\\s*<\\s*lim', 'for\\s*\\(\\$j\\s*=\\s*0;\\s*\\$j\\s*<\\s*lim', '\\$t\\[\\$i\\]\\[\\$j\\]'],
      },
      {
        title: 'Rodada 10 — Golpe final',
        description:
          'function maquinaJoga() { if ( ??? ) { $_SESSION[\'empate\'] = 1; return; } }  →  Escreva a condição no lugar de ??? usando livres().',
        talk: 'Volte ao farol e estude, viajante.',
        hint: 'Sem casas livres, a máquina para em vez de rodar para sempre: livres() == 0',
        check: ['^(livres\\(\\)==0|0==livres\\(\\)|!livres\\(\\))$'],
      },
    ],
    badgeId: 'problemas',
    badgeTitle: 'Resolução de Problemas',
    badgeDescription: 'Derrotou o Loopus Infinitus. Esta insígnia reúne todas as outras — a coroa da Era da Lógica.',
  },
};
