import type { Trail } from '@/domain/trail/types';
import { javaModules } from './modules';

/**
 * Lua de Java: segundo satélite da Era da Lógica, liberado junto com a Lua de Python
 * (ambos exigem `isEraRestored('logica')`). Trama própria: o segundo fragmento do Eco,
 * Nulo, se esconde na história real de Java e na sua exceção mais famosa, a
 * NullPointerException — coroada pelo fato real de que a referência nula foi inventada
 * por Tony Hoare em 1965 (ALGOL W), e o próprio autor a chamou publicamente de "o erro
 * de um bilhão de dólares" décadas depois. Os 8 faróis cobrem fatos reais sobre a
 * linguagem (James Gosling, Green Project, Oak → Java, 1991-1995, a JVM) e seus tópicos
 * centrais; o chefe de fase reaproveita o mesmo motor `single-shot` da Era da Lógica e
 * da Lua de Python.
 */
export const javaTrail: Trail = {
  id: 'java',
  title: 'Lua de Java',
  tagline: 'O segundo fragmento do Eco se escondeu dentro do erro mais famoso da programação.',
  symbol: 'java',
  accent: '#d98a4a',
  eyebrow: 'Satélite da Lógica · Lua de Java',
  intro: [
    'Outra lua se abriu, {name}. Onduluk avisou: eram três fragmentos. Este se chama Nulo, e ele se esconde onde a maioria dos programadores Java já caiu: dentro de uma referência que parece existir, mas está vazia.',
    'Java é uma linguagem rígida — chaves, tipos declarados, tudo verificado antes de rodar. Nulo se aproveita exatamente dessa confiança: ele se disfarça de "só mais um erro chato" para você nunca perguntar de onde ele realmente veio.',
    'Acenda os 8 faróis desta lua, e no fim você vai descobrir quem inventou o vazio que ele representa — e por que até o próprio criador se arrependeu.',
  ],
  modules: javaModules,
  lab: null,
  bossFight: {
    bossName: 'Nulo',
    tagline: 'O ERRO DE UM BILHÃO DE DÓLARES',
    intro: [
      'Nulo não tem forma: ele é só um espaço onde deveria haver um objeto.',
      'Ele ataca escondido em tipos de referência, em métodos main mal escritos, em comparações == que deveriam ser .equals(), em arrays acessados um passo além do fim.',
      'Você tem <b>3 corações</b>. Cada resposta errada custa um. Escreva exatamente o que cada farol te ensinou.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    rounds: [
      {
        title: 'Rodada 1 — A assinatura sagrada',
        description:
          'public static void main(String[] ???)  →  Qual é o nome do parâmetro que completa a assinatura correta do método main em Java?',
        talk: 'Nem o ponto de entrada escapa de mim...',
        hint: 'A assinatura fixa do método main usa String[] args.',
        check: ['^args$'],
      },
      {
        title: 'Rodada 2 — A divisão que trunca',
        description: 'int resultado = 5 / 2;  →  Qual é o valor de resultado? (só o número)',
        talk: 'Um resultado a menos, e ninguém percebe...',
        hint: 'Divisão entre dois int trunca: 5 / 2 vale 2, sem casas decimais.',
        check: ['^2$'],
      },
      {
        title: 'Rodada 3 — Comparando de verdade',
        description:
          'String a = new String("java");\nString b = new String("java");  →  Qual método (não operador) compara o conteúdo dos dois textos corretamente?',
        talk: '== é a minha arma favorita contra Strings.',
        hint: 'Para conteúdo, sempre .equals(), nunca ==.',
        check: ['^\\.?equals\\(?\\)?$'],
      },
      {
        title: 'Rodada 4 — Um passo além do fim',
        description: 'int[] numeros = {10, 20, 30};\nSystem.out.println(numeros[3]);  →  Qual exceção esse código lança?',
        talk: 'Um índice a mais, e o programa é meu!',
        hint: 'Acessar uma posição que não existe lança ArrayIndexOutOfBoundsException.',
        check: ['arrayindexoutofbounds'],
      },
      {
        title: 'Rodada 5 — Sem precisar de objeto',
        description: 'Calculadora.dobro(5);  →  Qual palavra-chave permite chamar esse método direto pela classe, sem criar um objeto?',
        talk: 'Um objeto a menos é um erro a mais!',
        hint: 'Métodos static pertencem à classe, não a uma instância.',
        check: ['^static$'],
      },
      {
        title: 'Rodada 6 — A queda sem freio',
        description:
          'switch (dia) { case 1: ... /* sem break */ case 2: ... }  →  Como se chama o comportamento de "cair" para o próximo case sem break?',
        talk: 'Uma queda daquelas, direto pro próximo case...',
        hint: 'Esse comportamento se chama fall-through.',
        check: ['fall.?through'],
      },
      {
        title: 'Rodada 7 — A intenção declarada',
        description:
          'Qual anotação, escrita acima de um método, avisa o compilador que você está sobrescrevendo de propósito um método da classe-mãe?',
        talk: 'Sem essa anotação, o erro passa despercebido...',
        hint: '@Override ajuda o compilador a pegar erros de nome ou parâmetro na sobrescrita.',
        check: ['@?override'],
      },
      {
        title: 'Rodada 8 — Golpe final: quem inventou o vazio',
        description:
          'Nulo se esconde como se fosse "só um erro comum". Mas ele tem um criador, que décadas depois chamou sua própria invenção de "o erro de um bilhão de dólares". Digite o nome completo dessa pessoa.',
        talk: 'Ninguém prova que eu tenho um criador!',
        hint: 'Tony Hoare inventou a referência nula em 1965, na linguagem ALGOL W, e se arrependeu publicamente em 2009.',
        check: ['tony\\s*hoare'],
      },
    ],
    badgeId: 'java-nulo',
    badgeTitle: 'Domador de Nulo',
    badgeDescription: 'Derrotou Nulo provando quem inventou a referência nula, e por quê: a coroa da Lua de Java.',
  },
};
