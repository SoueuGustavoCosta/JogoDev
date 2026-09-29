import type { Trail } from '@/domain/trail/types';
import { bancoDeDadosTrail } from './trails/banco-de-dados/trail';
import { dadosModelagemTrail } from './trails/dados-modelagem/trail';
import { dadosGuardiaoTrail } from './trails/dados-guardiao/trail';
import { gitGithubTrail } from './trails/git-github/trail';
import { logicaTrail } from './trails/logica/trail';
import { javaTrail } from './trails/java/trail';
import { pythonTrail } from './trails/python/trail';
import { phpTrail } from './trails/php/trail';
import { ramDjangoTrail } from './trails/ram-django/trail';
import { ramFastapiTrail } from './trails/ram-fastapi/trail';
import { ramFlaskTrail } from './trails/ram-flask/trail';
import { ramSpringBootTrail } from './trails/ram-spring-boot/trail';
import { ramJavalinTrail } from './trails/ram-javalin/trail';
import { ramQuarkusTrail } from './trails/ram-quarkus/trail';

/**
 * Lista de todas as ilhas do arquipélago. Para adicionar uma ilha nova,
 * crie `content/trails/<id>/` e registre-a aqui — nenhum outro arquivo deve mudar.
 */
export const trailRegistry: Trail[] = [
  bancoDeDadosTrail,
  dadosModelagemTrail,
  dadosGuardiaoTrail,
  logicaTrail,
  gitGithubTrail,
  pythonTrail,
  javaTrail,
  phpTrail,
  // Ramificações (Evento Nexus, ver content/nexus.ts)
  ramDjangoTrail,
  ramFastapiTrail,
  ramFlaskTrail,
  ramSpringBootTrail,
  ramJavalinTrail,
  ramQuarkusTrail,
];

export function getTrailById(id: string): Trail | undefined {
  return trailRegistry.find((trail) => trail.id === id);
}
