import type { NexusEvent } from '@/domain/nexus';

/**
 * Eventos Nexus: de cada lua de linguagem saem três Ramificações (frameworks) depois do
 * chefe dela. `launched: false` = as trilhas das Ramificações ainda não existem, e os
 * portais aparecem "Em breve". Cada etapa de conteúdo cria as trilhas e liga `launched`.
 * Cores: esquerda ciano, centro verde-limão, direita rosa (protótipo do Nexus).
 */
export const nexusEvents: readonly NexusEvent[] = [
  {
    island: 'python',
    branches: [
      { trailId: 'ram-django', name: 'Django', color: '#3df5ff' },
      { trailId: 'ram-fastapi', name: 'FastAPI', color: '#b6ff3d' },
      { trailId: 'ram-flask', name: 'Flask', color: '#ff3db8' },
    ],
    launched: true,
  },
  {
    island: 'java',
    branches: [
      { trailId: 'ram-spring-boot', name: 'Spring Boot', color: '#3df5ff' },
      { trailId: 'ram-javalin', name: 'Javalin', color: '#b6ff3d' },
      { trailId: 'ram-quarkus', name: 'Quarkus', color: '#ff3db8' },
    ],
    launched: false,
  },
  {
    island: 'php',
    branches: [
      { trailId: 'ram-laravel', name: 'Laravel', color: '#3df5ff' },
      { trailId: 'ram-symfony', name: 'Symfony', color: '#b6ff3d' },
      { trailId: 'ram-codeigniter', name: 'CodeIgniter', color: '#ff3db8' },
    ],
    launched: false,
  },
];
