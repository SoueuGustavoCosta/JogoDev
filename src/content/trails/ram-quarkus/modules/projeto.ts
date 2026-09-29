import type { Module } from '@/domain/trail/types';

/** Trilha 1 da Ramificação Quarkus: criar o projeto e o modo dev. */
export const modQuarkusProjeto: Module = {
  id: 'quarkus-projeto',
  short: 'Projeto e modo dev',
  title: 'Criando o projeto e o modo dev',
  lead: 'Quarkus é um framework Java feito para subir rápido e gastar pouca memória, pensado para containers e nuvem. E o modo dev deixa você programar sem reiniciar nada.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, a terceira Ramificação de Java é a mais veloz. Aqui o Java liga em segundos e recarrega o código enquanto você digita.' },
    { t: 'h', x: 'Criando o projeto' },
    { t: 'p', x: 'Com a linha de comando do Quarkus (a <b>Quarkus CLI</b>), um comando cria o projeto já com a extensão de REST:' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'quarkus create app org.acme:primeiro-quarkus --extension=rest\ncd primeiro-quarkus' },
    {
      t: 'p',
      x: 'Também dá para gerar pelo site <b>code.quarkus.io</b>, escolhendo as extensões. No Quarkus, cada recurso (REST, banco, segurança) entra como uma <b>extensão</b>.',
    },
    { t: 'h', x: 'O modo dev' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'quarkus dev' },
    { t: 'p', x: 'Sem a CLI, o mesmo com o Maven Wrapper: <code>./mvnw quarkus:dev</code>. O servidor sobe na porta <b>8080</b>.' },
    {
      t: 'cards',
      items: [
        { h: 'Recarga automática', x: 'Mudou o código e salvou? No próximo pedido o Quarkus já usa a versão nova. Sem reiniciar.' },
        { h: 'Dev UI', x: 'Em <code>http://localhost:8080/q/dev-ui</code>: um painel com as extensões, configurações e ferramentas do projeto.' },
        { h: 'Testes contínuos', x: 'No terminal do modo dev, a tecla <code>r</code> liga os testes, que rodam de novo a cada mudança.' },
      ],
    },
    {
      t: 'note',
      k: 'Só para desenvolver',
      x: 'O modo dev é para o seu computador. Para produção, você gera o pacote (vamos ver na trilha 5).',
      warn: true,
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Quarkus: <a href="https://quarkus.io/guides/getting-started" target="_blank" rel="noopener">Creating Your First Application</a> e <a href="https://quarkus.io/guides/dev-mode-differences" target="_blank" rel="noopener">Dev mode</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual comando liga o modo dev do Quarkus com o Maven Wrapper?',
      options: ['./mvnw spring-boot:run', './mvnw quarkus:dev', './mvnw quarkus:run', 'java -dev'],
      answer: 1,
      explain: '<code>./mvnw quarkus:dev</code> (ou <code>quarkus dev</code>, com a CLI).',
    },
    {
      id: 'q2',
      q: 'No modo dev, o que acontece quando você salva uma mudança no código?',
      options: [
        'Precisa reiniciar o servidor na mão',
        'O próximo pedido já usa o código novo',
        'O projeto é apagado',
        'Só muda depois do build de produção',
      ],
      answer: 1,
      explain: 'A recarga automática recompila na hora do próximo pedido.',
    },
    {
      id: 'q3',
      q: 'No Quarkus, como se acrescenta um recurso como REST ou banco de dados?',
      options: ['Com uma extensão', 'Editando o Java da JVM', 'Com um plugin do navegador', 'Não dá, vem tudo junto'],
      answer: 0,
      explain: 'Cada recurso é uma extensão: <code>rest</code>, <code>hibernate-orm-panache</code> e assim por diante.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o comando que cria o projeto com a extensão de REST.',
      pieces: ['quarkus', 'create app', 'org.acme:primeiro-quarkus', '--extension=rest'],
      distractors: ['spring', 'new project', '--dev'],
      explain: '<code>quarkus create app grupo:artefato --extension=rest</code>.',
    },
  ],
};
