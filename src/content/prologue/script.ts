import type { PrologueScript } from '@/domain/prologue';

/** Diálogo do prólogo (CLAUDE-TEMPO.md, seção 2). Tom acolhedor, sem sarcasmo com quem erra. */
export const prologueScript: PrologueScript = {
  start: 'nome',
  steps: {
    nome: {
      id: 'nome',
      say: ['Compilando... pronto! Olá, viajante do tempo.', 'Qual é o seu nome?'],
      askName: { placeholder: 'Digite seu nome', button: 'Enviar', next: 'historia' },
    },
    historia: {
      id: 'historia',
      say: [
        'Prazer, {name}. Eu sou a Sintaxe, a guia da Linha do Tempo.',
        'Ela rachou: as eras ficaram embaralhadas e ninguém mais lembra por que as tecnologias foram inventadas.',
      ],
      choices: [
        { label: 'Isso é sério?', next: 'serio' },
        { label: 'O que eu preciso fazer?', next: 'missao' },
      ],
    },
    serio: {
      id: 'serio',
      say: [
        'Sério, mas sem drama. Alguém deixou um Eco pelo caminho: uma cópia com defeito de você, fazendo gambiarras em cada era.',
        'Errar faz parte. O Eco só ganha uma rodada, e eu te mostro o caminho certo.',
      ],
      choices: [{ label: 'E o que eu faço?', next: 'missao' }],
    },
    missao: {
      id: 'missao',
      say: [
        'Você viaja até cada era, entende o problema que as pessoas tinham e conserta o rastro do Eco. Cada acerto acende um cristal.',
        'No mapa do tempo, você escolhe por onde começar. Minha dica é a Era dos Dados, em 1963: um foguete, uma lista de peças e a primeira dor de cabeça dos dados.',
      ],
      warp: { label: 'Abrir o mapa do tempo' },
    },
  },
};
