/**
 * Catálogo de insígnias compartilhado entre todas as trilhas (ver seção "Stage 2" da tarefa
 * que criou este arquivo): uma insígnia pertence a uma trilha, mas a coleção completa
 * (`content/badges/catalog.ts`) é um dado único, fora de `content/trails/*`, porque a
 * "vitrine" do viajante mostra as insígnias de todas as eras juntas.
 */
export type Badge = {
  id: string;
  /** 'logica' | 'sql' | 'git' | 'outras' — string livre, casa com o campo `trail` do manifesto. */
  trail: string;
  name: string;
  description: string;
  crown: boolean;
  /**
   * Insígnia "rara": concedida ao concluir todos os módulos de uma trilha (o troféu),
   * antes do chefe de fase — o degrau do meio no modelo de 3 níveis (comum → rara →
   * lendária/crown). Opcional para não exigir migrar as insígnias do manifesto original.
   */
  rare?: boolean;
  /** Id do módulo que desbloqueia esta insígnia (mesmo `Module.id` das trilhas), ou null se ainda não estiver ligada a nada. */
  unlockedBy: string | null;
  /** Caminho servido em /public, ex.: "logica/problemas.webp" (relativo a `/badges/`). */
  file: string;
};
