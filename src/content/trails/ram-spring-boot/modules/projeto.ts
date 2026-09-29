import type { Module } from '@/domain/trail/types';

/** Trilha 1 da Ramificação Spring Boot: criar o projeto com o Spring Initializr. */
export const modSpringProjeto: Module = {
  id: 'spring-projeto',
  short: 'Spring Initializr',
  title: 'Criando o projeto com o Spring Initializr',
  lead: 'O Spring Boot monta uma aplicação Java pronta para rodar, com servidor embutido e configuração automática. O primeiro passo é gerar o projeto.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, esta é a primeira Ramificação da Lua de Java. Aqui o Java vira um servidor web completo, e o Spring faz o trabalho pesado por você.' },
    { t: 'h', x: 'Spring Initializr: o projeto pronto em um clique' },
    {
      t: 'p',
      x: 'No site <b>start.spring.io</b> você escolhe a ferramenta de build (Maven ou Gradle), a linguagem (Java), a versão e as <b>dependências</b>. Para uma API, a dependência principal é o <b>Spring Web</b>. O site gera um .zip com tudo pronto.',
    },
    {
      t: 'cards',
      items: [
        { h: 'Build', x: 'Maven ou Gradle: baixam as bibliotecas e compilam o projeto.' },
        { h: 'Dependências', x: 'Blocos prontos: Spring Web (API), Spring Data JPA (banco), e outros.' },
        { h: 'Starters', x: 'Cada dependência é um "starter", que já traz tudo o que aquele bloco precisa.' },
      ],
    },
    { t: 'h', x: 'A classe principal' },
    {
      t: 'code',
      file: 'src/main/java/com/exemplo/demo/DemoApplication.java',
      lang: 'java',
      nolab: true,
      x: 'package com.exemplo.demo;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class DemoApplication {\n\n    public static void main(String[] args) {\n        SpringApplication.run(DemoApplication.class, args);\n    }\n}',
    },
    {
      t: 'p',
      x: 'A anotação <code>@SpringBootApplication</code> liga a configuração automática e manda o Spring procurar os seus componentes nos pacotes abaixo deste. O <code>SpringApplication.run</code> sobe tudo, inclusive o servidor web embutido.',
    },
    { t: 'h', x: 'Rodando' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: './mvnw spring-boot:run' },
    { t: 'p', x: 'Com Gradle, o comando é <code>./gradlew bootRun</code>. O servidor sobe na porta <b>8080</b> por padrão.' },
    {
      t: 'note',
      k: 'mvnw?',
      x: 'O <code>mvnw</code> é o "Maven Wrapper": ele baixa a versão certa do Maven para o projeto, mesmo que você não tenha o Maven instalado.',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Spring: <a href="https://spring.io/guides/gs/spring-boot" target="_blank" rel="noopener">Building an Application with Spring Boot</a> e <a href="https://docs.spring.io/spring-boot/" target="_blank" rel="noopener">Spring Boot Reference</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Para criar uma API web, qual dependência você escolhe no Spring Initializr?',
      options: ['Spring Data JPA', 'Spring Web', 'Lombok', 'H2 Database'],
      answer: 1,
      explain: 'O Spring Web traz o servidor embutido e tudo para receber pedidos HTTP.',
    },
    {
      id: 'q2',
      q: 'O que a anotação @SpringBootApplication faz na classe principal?',
      options: [
        'Cria o banco de dados',
        'Liga a configuração automática e a busca de componentes',
        'Gera o .zip do projeto',
        'Define a porta 8080',
      ],
      answer: 1,
      explain: 'Ela junta a configuração automática com a busca dos seus componentes nos pacotes abaixo da classe.',
    },
    {
      id: 'q3',
      q: 'Complete a linha que sobe a aplicação dentro do main:',
      fill: true,
      pre: 'SpringApplication.',
      post: '(DemoApplication.class, args);',
      accept: ['run'],
      wrong: ['start', 'main', 'launch'],
      placeholder: '?',
      explain: '<code>SpringApplication.run(...)</code> inicia o contexto do Spring e o servidor.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o comando que roda o projeto com o Maven Wrapper.',
      pieces: ['./mvnw', 'spring-boot:run'],
      distractors: ['bootRun', 'java -run', 'mvn start'],
      explain: '<code>./mvnw spring-boot:run</code> compila e sobe a aplicação.',
    },
  ],
};
