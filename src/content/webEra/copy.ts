/**
 * Falas da Senhorita Sintaxe e textos da Era da Web (protótipo). Regra da era: mais ação,
 * menos leitura: no máximo 2 falas de até 12 palavras por fase.
 */
export const webEraCopy = {
  /** Intro da era (toca uma vez; um balão por toque). */
  intro: ['Oi! Sou a Senhorita Sintaxe. O Eco está apagando a Web!', 'Bora salvar a história e criar o SEU portfólio.'],
  /** Balão do topo da era, conforme o avanço. */
  story(p: { name: string; nextTitle?: string; nextYear?: string; done: number; ecoDefeated: boolean; moonsDone: boolean }): string {
    if (p.nextTitle) return `${p.name}, próximo portal: ${p.nextTitle}. Portfólio ${p.done * 10}%!`;
    if (!p.ecoDefeated) return 'Tudo pronto. O Eco te espera. Sem perder vida = lendária!';
    if (!p.moonsDone) return 'Eco vencido! Três luas nasceram e orbitam o portal no mapa.';
    return 'As três luas brilham. O Evento Nexus abriu as Ramificações!';
  },
  ecoDefeated: 'O Eco caiu! Os fragmentos da Web viraram três luas: HTML, CSS e JS.',
  nexus: 'As três luas se alinharam. EVENTO NEXUS: as Ramificações abriram!',
  gameOver: 'A linha do tempo ramificou!',
  retryHint: 'Respira. Você tem mais uma chance!',
  closedPortal: 'Portal fechado. Termine o anterior!',
  moonsLocked: 'As luas nascem quando o Eco cair.',
  branchOpen: (name: string) => `Evento Nexus! O portal do ${name} está se formando.`,
  branchLocked: 'Esse portal abre quando as três luas caírem.',
  branchFuture: 'Node.js leva o JS ao servidor. Próxima era: Back-end!',
  portfolioTip: 'Cada trilha adiciona uma peça. No fim, publique grátis no GitHub Pages ou na Vercel.',
  cheers: ['Boa!', 'Mandou bem!', 'Isso aí!', 'Perfeito!'],
};
