import type { Trail } from '@/domain/trail/types';
import { bancoDeDadosTrail } from './trails/banco-de-dados/trail';

/**
 * Lista de todas as ilhas do arquipélago. Para adicionar uma ilha nova,
 * crie `content/trails/<id>/` e registre-a aqui — nenhum outro arquivo deve mudar.
 */
export const trailRegistry: Trail[] = [bancoDeDadosTrail];

export function getTrailById(id: string): Trail | undefined {
  return trailRegistry.find((trail) => trail.id === id);
}
