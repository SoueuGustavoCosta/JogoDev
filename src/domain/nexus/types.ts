/**
 * Evento Nexus (expansão Nexus e Cometas): quando o viajante vence o chefe de uma lua de
 * linguagem, a linha do tempo se ramifica em três portais de frameworks, as Ramificações.
 * Cada Ramificação é uma trilha comum (`content/trails/<id>`); aqui só fica a ligação.
 */
export type NexusBranch = {
  /** Trilha da Ramificação (precisa existir no registry quando o evento está lançado). */
  trailId: string;
  /** Nome curto do framework, mostrado no portal. */
  name: string;
  /** Cor do portal e do fio de luz. */
  color: string;
};

export type NexusEvent = {
  /** Trilha da lua de onde saem os portais (ex.: `python`). */
  island: string;
  /** Sempre três, da esquerda para a direita. */
  branches: [NexusBranch, NexusBranch, NexusBranch];
  /** Falso enquanto as trilhas das Ramificações não existem: os portais aparecem "Em breve". */
  launched: boolean;
};

/** `soon`: ainda sem conteúdo. `locked`: falta vencer o chefe da lua. `open`: portais abertos. */
export type NexusState = 'soon' | 'locked' | 'open';
