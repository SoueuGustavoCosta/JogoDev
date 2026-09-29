import type { Trail } from '@/domain/trail/types';
import { ramCodeigniterModules } from './modules';

/**
 * Ramificação CodeIgniter (Evento Nexus da Lua de PHP). Conteúdo original, com base só no
 * guia oficial do CodeIgniter 4 (links no fim de cada trilha).
 */
export const ramCodeigniterTrail: Trail = {
  id: 'ram-codeigniter',
  title: 'Ramificação CodeIgniter',
  tagline: 'PHP leve e rápido, em MVC: rotas num arquivo só, views em PHP puro e models prontos.',
  symbol: 'ram-codeigniter',
  accent: '#ff3db8',
  eyebrow: 'Ramificação de PHP · CodeIgniter',
  intro: [
    'Viajante, a terceira Ramificação da Lua de PHP é o CodeIgniter: leve, rápido e com pouca configuração.',
    'Mas a <b>Faísca Apagada</b> deixou este lugar no escuro: formulários sem proteção, views mostrando texto cru e dados gravados sem conferir.',
    'Em 5 trilhas você vai aprender o MVC do CodeIgniter. Depois, a gente reacende essa faísca. Bora?',
  ],
  modules: ramCodeigniterModules,
  lab: null,
  bossFight: {
    bossName: 'A Faísca Apagada',
    tagline: 'A CHAMA QUE DESLIGOU A SEGURANÇA',
    intro: [
      'A Faísca Apagada era a ignição do CodeIgniter. Agora ela só solta fumaça: tira o esc() das views, some com o token dos formulários e grava o $_POST inteiro.',
      'Cada rodada é uma parte do CodeIgniter que ela apagou.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'faisca.php',
    rounds: [
      {
        title: 'Rodada 1 — Ligar a ignição',
        description: 'Qual comando sobe o servidor de desenvolvimento?',
        talk: 'Sem faísca, sem servidor.',
        hint: 'A linha de comando do CodeIgniter é o spark.',
        check: ['^php\\s+spark\\s+serve$'],
        choices: { correct: 'php spark serve', wrong: ['php artisan serve', 'php bin/console serve', 'php spark start'] },
      },
      {
        title: 'Rodada 2 — A rota apagada',
        description: "A URL noticias/algum-slug precisa chamar Noticias::mostrar com o slug. Qual linha?",
        talk: 'Rotas no escuro. Boa sorte.',
        hint: "(:segment) casa com o slug, e $1 passa para o método.",
        check: ["^\\$routes->get\\(\\s*'noticias/\\(:segment\\)'\\s*,\\s*'noticias::mostrar/\\$1'\\s*\\);?$"],
        choices: {
          correct: "$routes->get('noticias/(:segment)', 'Noticias::mostrar/$1');",
          wrong: [
            "$routes->get('noticias/{slug}', 'Noticias::mostrar');",
            "Route::get('noticias/(:segment)', 'Noticias@mostrar');",
            "$routes->get('noticias/(:segment)', 'Noticias::mostrar');",
          ],
        },
      },
      {
        title: 'Rodada 3 — Texto cru na tela',
        description: 'Na view, qual linha mostra o título com segurança?',
        talk: 'Mostre cru. Se tiver <script>, melhor.',
        hint: 'Tudo que vai para a tela passa pelo esc().',
        check: ['^<\\?=\\s*esc\\(\\s*\\$titulo\\s*\\)\\s*\\?>$'],
        choices: { correct: '<?= esc($titulo) ?>', wrong: ['<?= $titulo ?>', '<?php echo $_GET["titulo"] ?>', '{{ $titulo }}'] },
      },
      {
        title: 'Rodada 4 — O formulário sem tranca',
        description: 'O que falta dentro do <form method="post"> para o CodeIgniter aceitar o envio com a proteção CSRF?',
        talk: 'Tranca? Porta aberta é mais convidativa.',
        hint: 'Um helper cria o campo escondido com o token.',
        check: ['^<\\?=\\s*csrf_field\\(\\)\\s*\\?>$'],
        choices: { correct: '<?= csrf_field() ?>', wrong: ['<?= csrf_token() ?>', '@csrf', '<?= form_close() ?>'] },
      },
      {
        title: 'Rodada 5 — Golpe final: gravar só o validado',
        description: 'A validação passou. De onde vêm os dados que vão para o banco?',
        talk: 'Grave o $_POST inteiro. Rápido!',
        hint: 'O validador devolve só o que passou nas regras.',
        check: ['^\\$post\\s*=\\s*\\$this->validator->getvalidated\\(\\);?$'],
        choices: {
          correct: '$post = $this->validator->getValidated();',
          wrong: ['$post = $_POST;', '$post = $this->request->getGet();', '$post = $this->validator->getErrors();'],
        },
      },
    ],
    badgeId: 'ram-codeigniter-faisca',
    badgeTitle: 'Guardião da Ignição',
    badgeDescription: 'Reacendeu a Faísca Apagada com rotas, esc(), CSRF e validação: a coroa da Ramificação CodeIgniter.',
  },
};
