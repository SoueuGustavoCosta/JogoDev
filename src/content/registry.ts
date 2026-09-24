import type { Trail } from '@/domain/trail/types';
import { bancoDeDadosTrail } from './trails/banco-de-dados/trail';
import { gitGithubTrail } from './trails/git-github/trail';
import { logicaTrail } from './trails/logica/trail';
import { javaTrail } from './trails/java/trail';
import { pythonTrail } from './trails/python/trail';

/**
 * Lista de todas as ilhas do arquipélago. Para adicionar uma ilha nova,
 * crie `content/trails/<id>/` e registre-a aqui — nenhum outro arquivo deve mudar.
 */
export const trailRegistry: Trail[] = [bancoDeDadosTrail, logicaTrail, gitGithubTrail, pythonTrail, javaTrail];

export function getTrailById(id: string): Trail | undefined {
  return trailRegistry.find((trail) => trail.id === id);
}
