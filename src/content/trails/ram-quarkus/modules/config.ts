import type { Module } from '@/domain/trail/types';

/** Trilha 5 da Ramificação Quarkus: configuração e build. */
export const modQuarkusConfig: Module = {
  id: 'quarkus-config',
  short: 'Configuração e build',
  title: 'Configuração e build',
  lead: 'Valores que mudam entre ambientes ficam no application.properties, com um prefixo para cada perfil. E no fim, um comando gera o pacote para produção.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Lendo uma configuração' },
    {
      t: 'code',
      file: 'src/main/resources/application.properties',
      lang: 'properties',
      nolab: true,
      x: 'saudacao.mensagem=Olá\n%dev.saudacao.mensagem=Olá, dev\n%prod.quarkus.http.port=8081',
    },
    {
      t: 'code',
      file: 'SaudacaoResource.java',
      lang: 'java',
      nolab: true,
      x: 'import org.eclipse.microprofile.config.inject.ConfigProperty;\n\n@Path("/saudacao")\npublic class SaudacaoResource {\n\n    @ConfigProperty(name = "saudacao.mensagem")\n    String mensagem;\n\n    @GET\n    @Produces(MediaType.TEXT_PLAIN)\n    public String ola() {\n        return mensagem;\n    }\n}',
    },
    { t: 'h', x: 'Perfis com %' },
    {
      t: 'cards',
      items: [
        { h: '%dev.', x: 'Vale no modo dev.' },
        { h: '%test.', x: 'Vale quando os testes rodam.' },
        { h: '%prod.', x: 'Vale no pacote de produção (o perfil padrão fora do dev e dos testes).' },
      ],
    },
    { t: 'h', x: 'Build' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: './mvnw package\njava -jar target/quarkus-app/quarkus-run.jar' },
    {
      t: 'p',
      x: 'O pacote fica em <code>target/quarkus-app/</code>. E existe mais uma opção: o <b>executável nativo</b> (<code>./mvnw package -Dnative</code>), que sobe em milissegundos e gasta ainda menos memória.',
    },
    { t: 'say', x: 'Última trilha! A Partida a Frio está esperando: ela deixa tudo lento, reinicia o servidor a cada mudança e esquece a configuração. Hora de mostrar a velocidade do Quarkus.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Quarkus: <a href="https://quarkus.io/guides/config" target="_blank" rel="noopener">Configuring Your Application</a> e <a href="https://quarkus.io/guides/getting-started#packaging-and-run-the-application" target="_blank" rel="noopener">Packaging and run the application</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Com %dev.saudacao.mensagem=Olá, dev, quando essa linha vale?',
      options: ['Sempre', 'Só no modo dev', 'Só em produção', 'Nunca, o % desliga'],
      answer: 1,
      explain: 'O prefixo <code>%dev.</code> limita ao perfil dev.',
    },
    {
      id: 'q2',
      q: 'Depois de ./mvnw package, qual comando roda a aplicação?',
      options: ['quarkus dev', 'java -jar target/quarkus-app/quarkus-run.jar', './mvnw run', 'java Main'],
      answer: 1,
      explain: 'O pacote fica em <code>target/quarkus-app/</code>, com o <code>quarkus-run.jar</code>.',
    },
    {
      id: 'q3',
      q: 'Complete para ler a propriedade saudacao.mensagem:',
      fill: true,
      pre: '@',
      post: '(name = "saudacao.mensagem") String mensagem;',
      accept: ['ConfigProperty'],
      wrong: ['Value', 'Inject', 'Property'],
      placeholder: '?',
      explain: '<code>@ConfigProperty</code> vem do MicroProfile Config, usado pelo Quarkus. <code>@Value</code> é do Spring.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o comando que gera o executável nativo.',
      pieces: ['./mvnw', 'package', '-Dnative'],
      distractors: ['quarkus:dev', '--native', 'build'],
      explain: '<code>./mvnw package -Dnative</code> gera o binário nativo.',
    },
  ],
};
