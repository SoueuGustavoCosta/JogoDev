import type { CosmeticItem } from '@/domain/cosmetics';

/**
 * Catálogo da Loja do Viajante (Etapa 9). Preços em Fragmentos Temporais (◆): a Anomalia
 * do Dia dá 10 ◆, então um item comum sai em 2 ou 3 dias, um raro em cerca de uma semana
 * e um lendário em umas três. Itens com `price: null` não se compram: saem em eventos.
 * Para acrescentar, é só pôr mais um aqui (id novo, nunca reaproveitado nem trocado:
 * ele fica guardado no progresso de quem comprou). Cores seguem a paleta do projeto.
 */
export const cosmetics: CosmeticItem[] = [
  // Molduras do terminal
  { id: 'moldura-terminal', slot: 'frame', style: 'terminal', color: '#9b4dff', name: 'Terminal clássico', description: 'A moldura da Sintaxe, com as três bolinhas no topo.', rarity: 'comum', price: 20 },
  { id: 'moldura-neon', slot: 'frame', style: 'neon', color: '#5ee7ff', name: 'Neon ciano', description: 'Um anel de luz fria, como a linha do tempo.', rarity: 'comum', price: 25 },
  { id: 'moldura-dupla', slot: 'frame', style: 'dupla', color: '#ffa36b', name: 'Anel duplo', description: 'Dois anéis laranja, um dentro do outro.', rarity: 'comum', price: 30 },
  { id: 'moldura-orbita', slot: 'frame', style: 'orbita', color: '#c9a2ff', name: 'Órbita', description: 'Uma órbita tracejada que gira devagar.', rarity: 'raro', price: 70 },
  { id: 'moldura-pixel', slot: 'frame', style: 'pixel', color: '#3ee0a1', name: 'Tela de 8 bits', description: 'Moldura quadrada, de quando os pixels eram grandes.', rarity: 'raro', price: 80 },
  { id: 'moldura-fenda', slot: 'frame', style: 'fenda', color: '#ff5d7a', name: 'Fenda do Eco', description: 'Uma moldura rachada: você encarou o Eco e voltou.', rarity: 'lendario', price: null, event: 'eco-solto' },

  // Cores de fundo do avatar
  { id: 'cor-ametista', slot: 'color', from: '#9b4dff', to: '#4a2a8a', name: 'Ametista', description: 'O roxo da Praça da Sintaxe.', rarity: 'comum', price: 20 },
  { id: 'cor-brasa', slot: 'color', from: '#ff6b1f', to: '#8a2f0b', name: 'Brasa', description: 'Laranja de quem não perde um dia.', rarity: 'comum', price: 20 },
  { id: 'cor-menta', slot: 'color', from: '#3ee0a1', to: '#12664a', name: 'Menta', description: 'Verde de teste passando.', rarity: 'comum', price: 25 },
  { id: 'cor-aurora', slot: 'color', from: '#5ee7ff', to: '#9b4dff', name: 'Aurora', description: 'Do ciano ao roxo, como o céu do mapa.', rarity: 'raro', price: 60 },
  { id: 'cor-crepusculo', slot: 'color', from: '#ffd479', to: '#ff5d7a', name: 'Crepúsculo', description: 'Dourado que vira rosa no fim da era.', rarity: 'raro', price: 60 },
  { id: 'cor-convergencia', slot: 'color', from: '#ece9f8', to: '#5ee7ff', name: 'Convergência', description: 'Liberada para todos quando a turma bate a meta do mês.', rarity: 'lendario', price: null, event: 'convergencia' },

  // Cabelos
  { id: 'cabelo-espetado', slot: 'hair', style: 'espetado', color: '#ffd479', name: 'Espetado', description: 'Para quem acabou de achar o bug.', rarity: 'comum', price: 25 },
  { id: 'cabelo-franja', slot: 'hair', style: 'franja', color: '#8a5a3c', name: 'Franja reta', description: 'Arrumado como código indentado.', rarity: 'comum', price: 25 },
  { id: 'cabelo-coque', slot: 'hair', style: 'coque', color: '#b0673a', name: 'Coque', description: 'Prático para longas sessões de estudo.', rarity: 'comum', price: 30 },
  { id: 'cabelo-cacheado', slot: 'hair', style: 'cacheado', color: '#6b4226', name: 'Cacheado', description: 'Volume de sobra, como um laço bem feito.', rarity: 'comum', price: 30 },
  { id: 'cabelo-chanel', slot: 'hair', style: 'chanel', color: '#c9a2ff', name: 'Chanel lilás', description: 'Um corte curto em lilás de neon.', rarity: 'raro', price: 75 },
  { id: 'cabelo-moicano', slot: 'hair', style: 'moicano', color: '#ff6b1f', name: 'Moicano de fogo', description: 'Uma crista laranja que não passa despercebida.', rarity: 'lendario', price: 180 },

  // Acessórios
  { id: 'acessorio-oculos', slot: 'accessory', style: 'oculos', color: '#ece9f8', name: 'Óculos de leitura', description: 'Para ler o código com calma.', rarity: 'comum', price: 25 },
  { id: 'acessorio-fone', slot: 'accessory', style: 'fone', color: '#9b4dff', name: 'Fone de foco', description: 'Ninguém atrapalha quem está no laboratório.', rarity: 'comum', price: 30 },
  { id: 'acessorio-antena', slot: 'accessory', style: 'antena', color: '#5ee7ff', name: 'Antena temporal', description: 'Capta anomalias antes de todo mundo.', rarity: 'raro', price: 70 },
  { id: 'acessorio-estrela', slot: 'accessory', style: 'estrela', color: '#ffd479', name: 'Estrela da turma', description: 'Uma estrela no canto do avatar.', rarity: 'raro', price: 65 },
  { id: 'acessorio-ampulheta', slot: 'accessory', style: 'ampulheta', color: '#ffa36b', name: 'Ampulheta', description: 'O tempo está do seu lado.', rarity: 'lendario', price: 200 },
  { id: 'acessorio-selo-liga', slot: 'accessory', style: 'selo', color: '#ffd479', name: 'Selo da semana', description: 'Para quem ficou entre os três primeiros da Liga.', rarity: 'raro', price: null, event: 'liga' },
];
