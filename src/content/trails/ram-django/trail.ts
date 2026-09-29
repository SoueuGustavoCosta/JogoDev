import type { Trail } from '@/domain/trail/types';
import { ramDjangoModules } from './modules';

/**
 * Ramificação Django (Evento Nexus da Lua de Python). Conteúdo original, com base só na
 * documentação oficial do Django (links no fim de cada trilha).
 */
export const ramDjangoTrail: Trail = {
  id: 'ram-django',
  title: 'Ramificação Django',
  tagline: 'O framework que já vem com baterias: rotas, templates, banco e admin.',
  symbol: 'ram-django',
  accent: '#3df5ff',
  eyebrow: 'Ramificação de Python · Django',
  intro: [
    'Viajante, esta é a primeira Ramificação que saiu da Lua de Python. Aqui a linha do tempo virou um site inteiro, com páginas, banco de dados e painel de administração.',
    'Mas um fragmento do Eco chegou antes: o <b>Monólito</b>. Ele quer tudo num arquivo só, sem apps, sem templates, sem ordem.',
    'Em 5 trilhas você vai aprender onde cada peça do Django mora. Depois, é você contra o Monólito. Bora?',
  ],
  modules: ramDjangoModules,
  lab: null,
  bossFight: {
    bossName: 'o Monólito',
    tagline: 'O BLOCO QUE QUERIA SER O SITE INTEIRO',
    intro: [
      'O Monólito é um bloco de pedra do tamanho de um prédio, com código escrito em todas as faces. Views, HTML, SQL, tudo misturado.',
      'Ele acha que separar as coisas é perda de tempo. Cada rodada é uma parte do Django que ele bagunçou.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'monolito.py',
    rounds: [
      {
        title: 'Rodada 1 — A pedra fundamental',
        description: 'Você precisa ligar o servidor de desenvolvimento do projeto. Qual comando?',
        talk: 'Servidor? Eu sou o servidor!',
        hint: 'É pelo manage.py que se liga o servidor de desenvolvimento.',
        check: ['manage\\.py\\s+runserver'],
        choices: {
          correct: 'python manage.py runserver',
          wrong: ['django-admin runserver meusite', 'python manage.py startproject', 'python settings.py runserver'],
        },
      },
      {
        title: 'Rodada 2 — O mapa rasgado',
        description: 'No urls.py do projeto, as URLs do app "enquetes" sumiram. Qual linha devolve o caminho?',
        talk: 'Um arquivo de URLs só. Para que mais?',
        hint: 'As URLs de um app entram no projeto com include().',
        check: ['path\\(\\s*"enquetes/"\\s*,\\s*include\\(\\s*"enquetes\\.urls"\\s*\\)\\s*\\)'],
        choices: {
          correct: 'path("enquetes/", include("enquetes.urls"))',
          wrong: ['path("enquetes/", "enquetes.urls")', 'include("enquetes/", path("enquetes.urls"))', 'path("enquetes/", views.urls)'],
        },
      },
      {
        title: 'Rodada 3 — HTML dentro do Python',
        description: 'O Monólito colou HTML inteiro num HttpResponse. Qual linha usa um template com contexto?',
        talk: 'Template? Eu escrevo o HTML na mão, oras.',
        hint: 'render(request, "caminho/do/template.html", contexto) junta template e dados.',
        check: ['render\\(\\s*request\\s*,\\s*"enquetes/index\\.html"\\s*,\\s*contexto\\s*\\)'],
        choices: {
          correct: 'return render(request, "enquetes/index.html", contexto)',
          wrong: [
            'return HttpResponse("enquetes/index.html", contexto)',
            'return render("enquetes/index.html", contexto)',
            'return render(request, contexto, "enquetes/index.html")',
          ],
        },
      },
      {
        title: 'Rodada 4 — A tabela que não existe',
        description: 'Você criou o model Pergunta e já rodou makemigrations. O que falta para a tabela existir no banco?',
        talk: 'O plano está escrito. Isso não basta?',
        hint: 'makemigrations escreve o plano; migrate executa.',
        check: ['manage\\.py\\s+migrate$'],
        choices: {
          correct: 'python manage.py migrate',
          wrong: ['python manage.py makemigrations', 'python manage.py createsuperuser', 'python manage.py runserver'],
        },
      },
      {
        title: 'Rodada 5 — Golpe final: dados limpos',
        description: 'Depois de form.is_valid(), de onde você lê o e-mail já validado?',
        talk: 'Leia direto do request.POST. Confie em mim.',
        hint: 'Depois de validar, os dados convertidos ficam em cleaned_data.',
        check: ['form\\.cleaned_data\\[\\s*"email"\\s*\\]'],
        choices: {
          correct: 'form.cleaned_data["email"]',
          wrong: ['request.POST["email"]', 'form.data["email"]', 'form.email.value'],
        },
      },
    ],
    badgeId: 'ram-django-monolito',
    badgeTitle: 'Quebrador do Monólito',
    badgeDescription: 'Separou o Monólito em projeto, apps, URLs, templates, models e formulários: a coroa da Ramificação Django.',
  },
};
