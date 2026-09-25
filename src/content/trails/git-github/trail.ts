import type { Trail } from '@/domain/trail/types';
import { gitGithubModules } from './modules';

export const gitGithubTrail: Trail = {
  id: 'git-github',
  title: 'Git e GitHub',
  tagline: 'Do primeiro commit ao primeiro push: controle de versão de verdade, no seu navegador.',
  symbol: 'git',
  accent: '#ffa36b',
  eyebrow: 'Era 4 · Era do Git',
  intro: [
    'Viajante, chegamos à <b>Era da Bifurcação</b>. Aqui o tempo não anda em linha reta: ele se ramifica.',
    'Cada ideia nova pode virar uma linha do tempo paralela — um <b>branch</b> — que depois volta a se juntar à principal. ' +
      'Mas o Eco esteve por aqui: espalhou cópias divergentes do mesmo projeto e sobrescreveu pedaços do histórico sem avisar ninguém.',
    'Vamos reconstruir essa linha do tempo, <b>commit por commit</b> — do jeito que Linus Torvalds fez em 2005, ' +
      'quando escreveu o Git em poucos dias por pura necessidade. Bora depurar isso juntos?',
  ],
  modules: gitGithubModules,
  lab: 'git',
  bossFight: {
    bossName: 'O Bifurcador',
    tagline: 'LINHAS DO TEMPO SE SOBREPONDO',
    intro: [
      'Toda vez que você abre um novo ramo no tempo, uma versão da história continua existindo em paralelo.',
      'Na Era do Git isso virou problema: ramos demais, nunca reunidos, começaram a se sobrepor — o <b>Bifurcador</b> é essa confusão temporal ganhando forma.',
      'Se a gente não mesclar essas linhas do tempo logo, nenhuma das duas vai ser a versão real. Só comandos de verdade, na ordem certa, fecham essa fenda.',
    ],
    lifeLabel: '💾',
    mode: 'sequence',
    rounds: [
      {
        title: 'Rodada 1 — Comece do zero',
        description: 'Inicialize o repositório, adicione os arquivos e faça o primeiro commit.',
        talk: 'Todo repositório começa assim: vazio, esperando um histórico.',
        hint: 'git init  →  git add .  →  git commit -m "primeiro commit"',
        steps: ['git\\s+init', 'git\\s+add', 'git\\s+commit\\s+-m'],
        stepChoices: [
          { correct: 'git init', wrong: ['git start', 'git new'] },
          { correct: 'git add .', wrong: ['git save .', 'git commit .'] },
          { correct: 'git commit -m "primeiro commit"', wrong: ['git push -m "primeiro commit"', 'git commit "primeiro commit"'] },
        ],
      },
      {
        title: 'Rodada 2 — Ramifique sem medo',
        description: 'Crie uma branch nova, mude pra ela e depois mescle de volta na principal.',
        talk: 'Ramos que nunca se encontram não servem de nada. Mescle.',
        hint: 'git branch nova-feature  →  git checkout nova-feature  →  git checkout main  →  git merge nova-feature',
        steps: ['git\\s+(branch|checkout\\s+-b|switch\\s+-c)', 'git\\s+(checkout|switch)', 'git\\s+merge'],
        stepChoices: [
          { correct: 'git branch nova-feature', wrong: ['git merge nova-feature', 'git push nova-feature'] },
          { correct: 'git checkout nova-feature', wrong: ['git branch -d nova-feature', 'git init'] },
          { correct: 'git merge nova-feature', wrong: ['git branch nova-feature', 'git push origin'] },
        ],
      },
      {
        title: 'Rodada 3 — Resolva o conflito',
        description:
          'Depois de editar o arquivo conflitante, marque como resolvido e finalize o merge com um commit.',
        talk: 'Duas versões, um só arquivo. Escolha o que sobrevive.',
        hint: 'git add arquivo-conflitante  →  git commit -m "resolve conflito de merge"',
        steps: ['git\\s+add', 'git\\s+commit'],
        stepChoices: [
          { correct: 'git add arquivo.txt', wrong: ['git merge --abort', 'git status'] },
          { correct: 'git commit -m "resolve conflito"', wrong: ['git add .', 'git push'] },
        ],
      },
      {
        title: 'Rodada 4 — Suba pro mundo',
        description: 'Conecte o repositório local a um remoto e envie o histórico atualizado.',
        talk: 'De nada adianta se ficar só na sua máquina.',
        hint: 'git remote add origin <url>  →  git push -u origin main',
        steps: ['git\\s+remote\\s+add', 'git\\s+push'],
        stepChoices: [
          { correct: 'git remote add origin https://github.com/voce/repo.git', wrong: ['git clone https://github.com/voce/repo.git', 'git remote -v'] },
          { correct: 'git push -u origin main', wrong: ['git pull origin main', 'git fetch origin'] },
        ],
      },
    ],
    badgeId: 'git-mestre',
    badgeTitle: 'Guardião do Versionamento',
    badgeDescription:
      'Concedida a quem sabe começar, ramificar, resolver conflitos e publicar um repositório sem perder histórico pelo caminho.',
  },
};
