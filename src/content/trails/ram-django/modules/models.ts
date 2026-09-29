import type { Module } from '@/domain/trail/types';

/** Trilha 4 da Ramificação Django: models e o admin. */
export const modDjangoModels: Module = {
  id: 'django-models',
  short: 'Models e admin',
  title: 'Models e o admin: o banco de dados em Python',
  lead: 'Um model é uma classe Python que vira tabela no banco. E o Django ainda te dá um painel pronto para cuidar dos dados.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Uma classe, uma tabela' },
    {
      t: 'code',
      file: 'enquetes/models.py',
      lang: 'python',
      nolab: true,
      x: 'from django.db import models\n\n\nclass Pergunta(models.Model):\n    texto = models.CharField(max_length=200)\n    publicada_em = models.DateTimeField("data de publicação")\n\n\nclass Opcao(models.Model):\n    pergunta = models.ForeignKey(Pergunta, on_delete=models.CASCADE)\n    texto = models.CharField(max_length=200)\n    votos = models.IntegerField(default=0)',
    },
    {
      t: 'cards',
      items: [
        { h: 'CharField', x: 'Texto curto. <code>max_length</code> é obrigatório.' },
        { h: 'IntegerField', x: 'Número inteiro. <code>default=0</code> começa com zero.' },
        { h: 'ForeignKey', x: 'Liga uma opção a uma pergunta. <code>CASCADE</code>: apagou a pergunta, apaga as opções.' },
      ],
    },
    { t: 'h', x: 'Registrar o app e criar as tabelas' },
    { t: 'p', x: 'Primeiro, o app entra em <code>INSTALLED_APPS</code> no <code>settings.py</code>. Depois, duas etapas:' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'python manage.py makemigrations enquetes\npython manage.py migrate' },
    {
      t: 'cards',
      items: [
        { h: 'makemigrations', x: 'Compara os models com o que já existe e escreve um arquivo de migração: o plano da mudança.' },
        { h: 'migrate', x: 'Executa as migrações pendentes no banco: cria e altera as tabelas de verdade.' },
      ],
    },
    { t: 'h', x: 'O painel de administração' },
    { t: 'p', x: 'Crie um usuário administrador e registre o model no <code>admin.py</code> do app:' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'python manage.py createsuperuser' },
    {
      t: 'code',
      file: 'enquetes/admin.py',
      lang: 'python',
      nolab: true,
      x: 'from django.contrib import admin\n\nfrom .models import Pergunta\n\nadmin.site.register(Pergunta)',
    },
    { t: 'p', x: 'Agora, em <code>/admin/</code>, dá para criar, editar e apagar perguntas sem escrever nenhuma tela.' },
    { t: 'say', x: 'Se você passou pela Era dos Dados, reconheceu tudo: o model é o CREATE TABLE, e o ForeignKey é a chave estrangeira. O Django só escreve o SQL por você.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Django: <a href="https://docs.djangoproject.com/en/stable/intro/tutorial02/" target="_blank" rel="noopener">Tutorial, parte 2</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual comando aplica no banco as mudanças que estão nos arquivos de migração?',
      options: ['python manage.py makemigrations', 'python manage.py migrate', 'python manage.py runserver', 'python manage.py createsuperuser'],
      answer: 1,
      explain: '<code>makemigrations</code> escreve o plano. <code>migrate</code> executa o plano no banco.',
    },
    {
      id: 'q2',
      q: 'Complete o campo de texto curto do model:',
      fill: true,
      pre: 'texto = models.CharField(',
      post: '=200)',
      accept: ['max_length'],
      wrong: ['size', 'length', 'limit'],
      placeholder: '?',
      explain: 'Todo <code>CharField</code> precisa de <code>max_length</code>.',
    },
    {
      id: 'q3',
      q: 'O que faz <code>on_delete=models.CASCADE</code> na <code>ForeignKey</code> de <code>Opcao</code>?',
      options: [
        'Impede que a pergunta seja apagada',
        'Apaga as opções junto quando a pergunta é apagada',
        'Copia a pergunta para cada opção',
        'Deixa a opção sem pergunta',
      ],
      answer: 1,
      explain: 'Com <code>CASCADE</code>, apagar a pergunta leva junto as opções ligadas a ela.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que coloca o model <code>Pergunta</code> no admin.',
      pieces: ['admin.site.register(', 'Pergunta', ')'],
      distractors: ['admin.register(', 'Pergunta()', 'models.'],
      explain: '<code>admin.site.register(Pergunta)</code> faz o model aparecer no painel <code>/admin/</code>.',
    },
  ],
};
