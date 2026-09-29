import type { Module } from '@/domain/trail/types';

/** Trilha 2 da Ramificação Spring Boot: o primeiro controller REST. */
export const modSpringController: Module = {
  id: 'spring-controller',
  short: 'Controller REST',
  title: 'O primeiro controller REST',
  lead: 'Um controller é a classe que atende os pedidos. Cada método ligado a uma URL devolve dados, e o Spring transforma em JSON.',
  level: 'Base',
  blocks: [
    { t: 'h', x: '@RestController e @GetMapping' },
    {
      t: 'code',
      file: 'SaudacaoController.java',
      lang: 'java',
      nolab: true,
      x: 'import org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RequestParam;\nimport org.springframework.web.bind.annotation.RestController;\n\n@RestController\npublic class SaudacaoController {\n\n    @GetMapping("/saudacao")\n    public Saudacao saudacao(@RequestParam(defaultValue = "Viajante") String nome) {\n        return new Saudacao("Olá, " + nome + "!");\n    }\n}\n\nrecord Saudacao(String mensagem) {}',
    },
    {
      t: 'cards',
      items: [
        { h: '@RestController', x: 'A classe responde pedidos, e o que os métodos devolvem vai direto no corpo da resposta.' },
        { h: '@GetMapping', x: 'Liga pedidos GET em <code>/saudacao</code> a este método. Também existem <code>@PostMapping</code>, <code>@PutMapping</code> e <code>@DeleteMapping</code>.' },
        { h: '@RequestParam', x: 'Lê <code>?nome=Ana</code> da URL. Sem ele, vale o <code>defaultValue</code>.' },
      ],
    },
    { t: 'p', x: 'Abrindo <code>/saudacao?nome=Ana</code>, o record vira JSON automaticamente:' },
    { t: 'out', file: 'resposta', x: '{"mensagem":"Olá, Ana!"}' },
    { t: 'h', x: 'Pedaço do caminho: @PathVariable' },
    {
      t: 'code',
      file: 'ItemController.java',
      lang: 'java',
      nolab: true,
      x: '@GetMapping("/itens/{id}")\npublic String item(@PathVariable Long id) {\n    return "Item " + id;\n}',
    },
    { t: 'say', x: 'Repare: nada de configurar servidor nem converter JSON na mão. O Spring Boot já fez isso quando você escolheu o Spring Web.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Spring: <a href="https://spring.io/guides/gs/rest-service" target="_blank" rel="noopener">Building a RESTful Web Service</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual anotação faz um método atender pedidos GET em <code>/saudacao</code>?',
      options: ['@RequestMapping("GET")', '@GetMapping("/saudacao")', '@Get("/saudacao")', '@RestController("/saudacao")'],
      answer: 1,
      explain: '<code>@GetMapping("/saudacao")</code> liga o método ao caminho e ao método HTTP.',
    },
    {
      id: 'q2',
      q: 'Na URL <code>/itens/42</code>, como o controller recebe o 42?',
      options: ['@RequestParam Long id', '@PathVariable Long id', '@RequestBody Long id', 'String id = "42"'],
      answer: 1,
      explain: 'Pedaço do caminho entre chaves (<code>{id}</code>) chega com <code>@PathVariable</code>.',
    },
    {
      id: 'q3',
      q: 'O que acontece com o <code>record Saudacao</code> que o método devolve?',
      options: ['Vira texto com toString()', 'É convertido em JSON na resposta', 'É salvo no banco', 'Dá erro, só pode devolver String'],
      answer: 1,
      explain: 'O Spring Boot usa uma biblioteca de JSON (Jackson) para converter objetos na resposta.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a assinatura que lê <code>?nome=</code> com padrão "Viajante".',
      pieces: ['@RequestParam(', 'defaultValue = "Viajante"', ')', 'String nome'],
      distractors: ['@PathVariable', 'default = "Viajante"', 'int nome'],
      explain: '<code>@RequestParam(defaultValue = "Viajante") String nome</code>.',
    },
  ],
};
