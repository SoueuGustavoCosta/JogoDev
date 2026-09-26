import type { BossRound } from '@/domain/bossFight';

/**
 * Rodadas do Eco Solto (Etapa 11): a cada sexta, 3 delas são sorteadas (iguais para toda a
 * turma). Todas de tocar no bloco certo, rápidas, de eras diferentes. O teste
 * `src/content/events.test.ts` confere que o bloco certo passa e os errados não.
 * Para acrescentar, é só pôr mais uma aqui.
 */
export const ecoSoltoRounds: BossRound[] = [
  {
    title: 'O laço sem fim',
    description: 'while (____) { i = i + 1 } — o laço precisa parar quando i chegar a 5.',
    talk: 'Troquei a condição do seu laço. Agora ele gira para sempre!',
    hint: 'O laço repete enquanto a condição for verdadeira: continue enquanto i for menor que 5.',
    check: ['^i\\s*<\\s*5$'],
    choices: { correct: 'i < 5', wrong: ['i > 5', 'i = 5', 'i <= i'] },
  },
  {
    title: 'Maioridade confusa',
    description: 'if (____) libera a entrada de quem tem 18 anos ou mais.',
    talk: 'Com o meu sinal, quem faz 18 hoje fica de fora.',
    hint: '18 também conta: use "maior ou igual".',
    check: ['^idade\\s*>=\\s*18$'],
    choices: { correct: 'idade >= 18', wrong: ['idade > 18', 'idade => 18', 'idade = 18'] },
  },
  {
    title: 'Estoque fantasma',
    description: 'SELECT nome FROM produtos ____ — traga só produtos que ainda têm estoque.',
    talk: 'A vitrine mostra produtos que acabaram. Obra minha.',
    hint: 'Filtro de linhas vem no WHERE, e "tem estoque" é maior que zero.',
    check: ['^where estoque\\s*>\\s*0$'],
    choices: { correct: 'WHERE estoque > 0', wrong: ['HAVING estoque > 0', 'WHERE estoque = 0', 'ORDER BY estoque'] },
  },
  {
    title: 'Contagem sumida',
    description: 'Quantos clientes a loja tem? Uma linha, um número.',
    talk: 'Apaguei o contador da loja. Ninguém sabe quantos clientes existem.',
    hint: 'COUNT(*) conta as linhas; ele vem logo depois do SELECT.',
    check: ['^select count\\(\\*\\) from clientes;?$'],
    choices: {
      correct: 'SELECT COUNT(*) FROM clientes;',
      wrong: ['SELECT SUM(*) FROM clientes;', 'SELECT * FROM clientes;', 'COUNT(*) FROM clientes;'],
    },
  },
  {
    title: 'Mudança perdida',
    description: 'Os arquivos já estão preparados (git add). Guarde a mudança no histórico.',
    talk: 'Se você não salvar agora, eu levo essa mudança para outra linha do tempo.',
    hint: 'O comando que cria um ponto no histórico, com uma mensagem depois de -m.',
    check: ['^git commit -m ["\'].+["\']$'],
    choices: {
      correct: 'git commit -m "conserta o eco"',
      wrong: ['git push -m "conserta o eco"', 'git commit "conserta o eco"', 'git save -m "conserta o eco"'],
    },
  },
  {
    title: 'Olhar antes de salvar',
    description: 'Antes de preparar os arquivos, veja o que mudou no projeto.',
    talk: 'Mexi em arquivos que você nem viu. Descubra quais.',
    hint: 'É o comando que mostra o estado da pasta de trabalho.',
    check: ['^git status$'],
    choices: { correct: 'git status', wrong: ['git state', 'git log -m', 'status git'] },
  },
  {
    title: 'Nome calado',
    description: 'nome = "Ada" — faça o Python mostrar o nome na tela.',
    talk: 'Silenciei o seu programa. Ele sabe o nome, mas não fala.',
    hint: 'Em Python, a função de mostrar leva parênteses.',
    check: ['^print\\(nome\\)$'],
    choices: { correct: 'print(nome)', wrong: ['print nome', 'echo nome', 'console.log(nome)'] },
  },
  {
    title: 'Variável sem cifrão',
    description: 'Em PHP, guarde 10 numa variável chamada total.',
    talk: 'Roubei os cifrões das suas variáveis PHP.',
    hint: 'Toda variável em PHP começa com $ e a linha termina com ;',
    check: ['^\\$total\\s*=\\s*10;$'],
    choices: { correct: '$total = 10;', wrong: ['total = 10;', '$total == 10;', 'var $total = 10'] },
  },
  {
    title: 'Java mudo',
    description: 'Faça o Java escrever oi e pular a linha.',
    talk: 'Seu programa Java ficou mudo. Eu gosto do silêncio.',
    hint: 'System.out.println, com o texto entre aspas e ; no fim.',
    check: ['^system\\.out\\.println\\("oi"\\);$'],
    choices: {
      correct: 'System.out.println("oi");',
      wrong: ['System.out.println("oi")', 'System.println("oi");', 'console.log("oi");'],
    },
  },
];
