import type { Module } from '@/domain/trail/types';

/** Trilha 3 da Ramificação Django: templates. */
export const modDjangoTemplates: Module = {
  id: 'django-templates',
  short: 'Templates',
  title: 'Templates: HTML com espaços para preencher',
  lead: 'Escrever HTML dentro de HttpResponse fica bagunçado rápido. O template separa o visual do código Python.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Onde ficam os templates' },
    {
      t: 'p',
      x: 'Por padrão, o Django procura templates na pasta <code>templates</code> de cada app. A convenção é repetir o nome do app lá dentro, para dois apps não terem arquivos com o mesmo nome:',
    },
    { t: 'code', file: 'estrutura', lang: 'text', nolab: true, x: 'enquetes/\n    templates/\n        enquetes/\n            index.html' },
    { t: 'h', x: 'A linguagem de templates' },
    {
      t: 'cards',
      items: [
        { h: '{{ variavel }}', x: 'Mostra um valor que a view mandou.' },
        { h: '{% for %} ... {% endfor %}', x: 'Repete um trecho para cada item de uma lista.' },
        { h: '{% if %} ... {% endif %}', x: 'Mostra um trecho só quando a condição é verdadeira.' },
      ],
    },
    {
      t: 'code',
      file: 'enquetes/templates/enquetes/index.html',
      lang: 'html',
      nolab: true,
      x: '{% if perguntas %}\n  <ul>\n  {% for pergunta in perguntas %}\n    <li>{{ pergunta }}</li>\n  {% endfor %}\n  </ul>\n{% else %}\n  <p>Nenhuma enquete ainda.</p>\n{% endif %}',
    },
    { t: 'h', x: 'A view manda os dados com render()' },
    {
      t: 'code',
      file: 'enquetes/views.py',
      lang: 'python',
      nolab: true,
      x: 'from django.shortcuts import render\n\n\ndef index(request):\n    contexto = {"perguntas": ["Qual sua linguagem favorita?", "Tabs ou espaços?"]}\n    return render(request, "enquetes/index.html", contexto)',
    },
    {
      t: 'p',
      x: '<code>render()</code> junta o template com o dicionário de contexto e devolve um <code>HttpResponse</code> pronto. Cada chave do dicionário vira uma variável no template.',
    },
    {
      t: 'note',
      k: 'Proteção de graça',
      x: 'O Django escapa o HTML das variáveis automaticamente. Se alguém digitar <code>&lt;script&gt;</code> numa enquete, ele aparece como texto, não roda.',
    },
    { t: 'say', x: 'Viu que o template não tem lógica pesada? Ele só mostra. Quem decide o que mostrar é a view.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Django: <a href="https://docs.djangoproject.com/en/stable/intro/tutorial03/" target="_blank" rel="noopener">Tutorial, parte 3</a> e <a href="https://docs.djangoproject.com/en/stable/topics/templates/" target="_blank" rel="noopener">Templates</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'No template, como se mostra o valor da variável nome?',
      options: ['{% nome %}', '{{ nome }}', '${nome}', '<?= nome ?>'],
      answer: 1,
      explain: 'Chaves duplas mostram valores. <code>{% %}</code> é para tags, como <code>for</code> e <code>if</code>.',
    },
    {
      id: 'q2',
      q: 'Por que o template fica em enquetes/templates/enquetes/, repetindo o nome do app?',
      options: [
        'É obrigatório, senão o Django não inicia',
        'Para dois apps não terem templates com o mesmo nome se confundindo',
        'Para o template rodar mais rápido',
        'Porque o Django só aceita pastas com nome repetido',
      ],
      answer: 1,
      explain: 'O Django junta as pastas de templates de todos os apps. A subpasta com o nome do app evita que dois <code>index.html</code> se misturem.',
    },
    {
      id: 'q3',
      q: 'Complete a view para devolver o template com o contexto:',
      fill: true,
      pre: 'return',
      post: '(request, "enquetes/index.html", contexto)',
      accept: ['render'],
      wrong: ['HttpResponse', 'redirect', 'include'],
      placeholder: '?',
      explain: '<code>render()</code> carrega o template, preenche com o contexto e devolve a resposta.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha do template que repete cada pergunta.',
      pieces: ['{%', 'for', 'pergunta', 'in', 'perguntas', '%}'],
      distractors: ['{{', 'of', 'each'],
      explain: '<code>{% for pergunta in perguntas %}</code> abre o laço. Ele fecha com <code>{% endfor %}</code>.',
    },
  ],
};
