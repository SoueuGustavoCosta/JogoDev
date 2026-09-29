import type { WebBranch } from '@/domain/webEra';

/**
 * Ramificações da Era da Web (Evento Nexus depois das 3 luas). Os portais abrem com a
 * Sintaxe, as 5 trilhas planejadas + chefe e o link da documentação oficial, marcados como
 * "em construção" até o conteúdo existir. Node.js é a porta da futura Era do Back-end.
 */
export const webBranches: WebBranch[] = [
  {
    id: 'react',
    name: 'React',
    color: '#61dafb',
    since: '2013 · Meta',
    doc: 'https://react.dev/learn',
    trails: ['Componentes e JSX', 'Props', 'Estado com useState', 'Eventos', 'Listas e keys'],
  },
  {
    id: 'next',
    name: 'Next.js',
    color: '#e5e7eb',
    since: '2016 · Vercel',
    parent: 'react',
    doc: 'https://nextjs.org/docs',
    trails: ['Páginas e rotas (App Router)', 'Layouts', 'Links e navegação', 'Imagens otimizadas', 'Deploy na Vercel'],
  },
  {
    id: 'vue',
    name: 'Vue',
    color: '#42d392',
    since: '2014 · Evan You',
    doc: 'https://vuejs.org/guide/introduction.html',
    trails: ['Instância e template', 'Reatividade (ref)', 'Diretivas v-if / v-for', 'Eventos v-on', 'Componentes'],
  },
  {
    id: 'angular',
    name: 'Angular',
    color: '#ff3d71',
    since: '2016 · Google',
    doc: 'https://angular.dev/overview',
    trails: ['Componentes', 'Templates e binding', 'Signals', 'Serviços e injeção', 'Rotas'],
  },
  {
    id: 'node',
    name: 'Node.js',
    color: '#6cc24a',
    since: '2009 · Ryan Dahl',
    doc: 'https://nodejs.org/en/learn',
    future: true,
    trails: ['JS fora do navegador', 'Módulos e npm', 'Arquivos (fs)', 'Servidor HTTP', 'APIs com Express'],
  },
];
