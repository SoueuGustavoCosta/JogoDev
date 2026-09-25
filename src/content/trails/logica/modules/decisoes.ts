import type { Module } from '@/domain/trail/types';

/**
 * Migrado de Ilha_da_Logica_PHP_1.html (módulo "decisoes" — "Decisões: if, else, switch").
 * O widget "Qual caminho o PHP escolhe?" virou o jogo `qual-caminho` (DecisionPathWidget).
 */
export const modDecisoes: Module = {
  id: 'decisoes',
  short: 'Decisões: if, else, switch',
  title: 'Decisões: if, else e switch',
  lead: 'Fazer o programa escolher um caminho. É assim que ele deixa de ser uma lista de ordens e passa a "pensar".',
  level: 'Intermediário',
  blocks: [
    {
      t: 'say',
      x: 'Farol 5. Até aqui o programa faz tudo em linha reta. A partir de agora ele vai chegar em bifurcações e escolher o caminho. A pergunta é sempre uma condição: verdadeiro ou falso?',
    },
    { t: 'h', x: 'A estrutura condicional' },
    {
      t: 'p',
      x: 'Na apostila: <code>Se (condição) então ... Senão ...</code>. Em PHP: <code>if</code>, <code>elseif</code> e <code>else</code>. A condição devolve <b>verdadeiro</b> ou <b>falso</b>; se for verdadeira, o bloco <code>if</code> executa; se não, o PHP tenta o próximo <code>elseif</code> e, no fim, o <code>else</code>.',
    },
    {
      t: 'code',
      file: 'media.php',
      lang: 'php',
      nolab: true,
      x: '<?php\n$media = 7.5;\n\nif ($media >= 7) {\n    echo "Aprovado!";\n} elseif ($media >= 5) {\n    echo "Recuperação.";\n} else {\n    echo "Reprovado.";\n}\n?>',
    },
    { t: 'p', x: 'Mexa no controle e veja qual caminho o PHP escolhe. As linhas acesas são as que realmente executam.' },
    { t: 'gui', widget: 'qual-caminho' },
    {
      t: 'note',
      k: 'Fique atento',
      x: 'As chaves <code>{ }</code> são o "início" e "fim" do Portugol. Sem elas, o <code>if</code> executa <b>apenas a próxima linha</b>. Com mais de uma linha, use sempre as chaves.',
    },
    { t: 'h', x: 'Combinando condições' },
    {
      t: 'p',
      x: 'Exemplo da apostila: candidatos precisam ter entre 30 e 40 anos. Juntamos duas comparações com o operador lógico E:',
    },
    {
      t: 'code',
      file: 'concurso.php',
      lang: 'php',
      nolab: true,
      x: '<?php\n$idade = 35;\nif ($idade >= 30 && $idade <= 40) {\n    echo "Candidato passou para a próxima etapa";\n} else {\n    echo "Candidato NÃO passou para a próxima etapa";\n}\n?>',
    },
    { t: 'h', x: 'Vários caminhos: switch' },
    {
      t: 'p',
      x: 'Quando você compara a <b>mesma variável</b> com vários valores, o <code>switch</code> fica mais limpo que uma escada de <code>if</code>. É o exemplo das cidades da apostila (1 Caratinga, 2 Ipatinga, 3 Cel. Fabriciano, qualquer outro Belo Horizonte):',
    },
    {
      t: 'code',
      file: 'cidades.php',
      lang: 'php',
      nolab: true,
      x: '<?php\n$num = 2;\nswitch ($num) {\n    case 1:\n        echo "Caratinga";\n        break;\n    case 2:\n        echo "Ipatinga";\n        break;\n    case 3:\n        echo "Cel. Fabriciano";\n        break;\n    default:\n        echo "Belo Horizonte";\n}\n?>',
    },
    {
      t: 'note',
      k: 'Sem break, cai no próximo',
      warn: true,
      x: 'O <code>break</code> encerra o <code>switch</code>. Se você esquecer, o PHP continua executando os casos seguintes, mesmo que não combinem.',
    },
    { t: 'h', x: 'Operador ternário: if em uma linha' },
    {
      t: 'code',
      file: 'ternario.php',
      lang: 'php',
      nolab: true,
      x: '<?php\n$media = 8;\n$status = ($media >= 7) ? "Aprovado" : "Reprovado";\necho $status;   // Aprovado\n?>',
    },
    { t: 'h', x: 'Decisões dentro do Jogo da Velha' },
    { t: 'p', x: 'Estas linhas fazem parte do arquivo do Estudo Dirigido. Leia como se fosse português:' },
    {
      t: 'code',
      file: 'jogadorJoga (trecho)',
      lang: 'php',
      nolab: true,
      x: "if ($_SESSION['vitoria'] != 0) return;   // jogo acabou? então não faz nada\n\nif (posicao($l, $col) == 0) {            // a casa está livre?\n    $_SESSION['jv'][$l][$col] = JOGADOR; // marca a casa\n    if (velha(JOGADOR)) {                // o jogador completou uma linha?\n        $_SESSION['vitoria'] = 1;        // sim: jogador venceu\n    } else {\n        maquinaJoga();                   // não: agora é a vez da máquina\n    }\n}",
    },
  ],
  quiz: [
    {
      q: 'Com $media = 6, qual mensagem aparece no exemplo do if/elseif/else (7 aprova, 5 recupera)?',
      options: ['Aprovado!', 'Recuperação.', 'Reprovado.', 'Nenhuma'],
      answer: 1,
      explain: '6 não é >= 7, mas é >= 5: cai no <code>elseif</code>.',
    },
    {
      q: 'Quando o bloco do else executa?',
      options: ['Sempre', 'Quando a condição do if é falsa (e nenhum elseif casou)', 'Nunca', 'Só se houver um switch'],
      answer: 1,
      explain: '<code>else</code> é o "senão": tudo que as condições anteriores deixaram passar.',
    },
    {
      q: 'Complete a segunda condição da escada:',
      fill: true,
      pre: '',
      post: ' ($media >= 5) {',
      accept: ['elseif', '}elseif', 'else if'],
      wrong: ['else', 'if', 'switch'],
      placeholder: '?',
      explain: '<code>elseif</code> testa outra condição quando a anterior foi falsa.',
    },
    {
      q: 'Qual comando impede o switch de "cair" no case seguinte?',
      fill: true,
      pre: '',
      post: ';',
      accept: ['break'],
      wrong: ['continue', 'next', 'stop'],
      placeholder: '?',
      explain: '<code>break</code> sai do <code>switch</code>.',
    },
    {
      q: 'Quanto vale $x em  $x = (5 > 3) ? "A" : "B"; ?',
      options: ['A', 'B', 'true', 'erro'],
      answer: 0,
      explain: '5 > 3 é verdadeiro, então o ternário devolve o valor depois do <code>?</code>: "A".',
    },
  ],
};
