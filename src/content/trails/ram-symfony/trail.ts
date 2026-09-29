import type { Trail } from '@/domain/trail/types';
import { ramSymfonyModules } from './modules';

/**
 * Ramificação Symfony (Evento Nexus da Lua de PHP). Conteúdo original, com base só na
 * documentação oficial do Symfony (links no fim de cada trilha).
 */
export const ramSymfonyTrail: Trail = {
  id: 'ram-symfony',
  title: 'Ramificação Symfony',
  tagline: 'Componentes PHP que se encaixam: rotas em atributos, Twig, Doctrine e formulários.',
  symbol: 'ram-symfony',
  accent: '#b6ff3d',
  eyebrow: 'Ramificação de PHP · Symfony',
  intro: [
    'Viajante, a segunda Ramificação da Lua de PHP é o Symfony. Aqui cada parte do sistema é um componente, e tudo toca junto como uma orquestra.',
    'Só que a <b>Sinfonia Desafinada</b> bagunçou a partitura: rotas no lugar errado, dados que nunca chegam ao banco, formulários sem validação.',
    'Em 5 trilhas você vai aprender a reger essa orquestra. Depois, a gente afina a Sinfonia. Bora?',
  ],
  modules: ramSymfonyModules,
  lab: null,
  bossFight: {
    bossName: 'A Sinfonia Desafinada',
    tagline: 'CADA COMPONENTE TOCANDO FORA DO TOM',
    intro: [
      'A Sinfonia Desafinada é uma orquestra fantasma: cada instrumento é um componente do Symfony, e todos tocam na hora errada.',
      'Cada rodada é uma parte da partitura que ela embaralhou.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'sinfonia.php',
    rounds: [
      {
        title: 'Rodada 1 — A partitura perdida',
        description: 'O método precisa responder em /blog/{slug}, com o nome blog_mostrar. Qual atributo?',
        talk: 'Rotas? Eu toco de ouvido.',
        hint: 'Atributo #[Route] com o caminho e o name.',
        check: ["^#\\[route\\(\\s*'/blog/\\{slug\\}'\\s*,\\s*name:\\s*'blog_mostrar'\\s*\\)\\]$"],
        choices: {
          correct: "#[Route('/blog/{slug}', name: 'blog_mostrar')]",
          wrong: ["@Route('/blog/{slug}')", "Route::get('/blog/{slug}')", "#[Route(name: '/blog/{slug}')]"],
        },
      },
      {
        title: 'Rodada 2 — O instrumento mudo',
        description: 'O controller precisa devolver JSON com o slug. Qual linha?',
        talk: 'JSON? Eu devolvo um array e pronto.',
        hint: 'O AbstractController tem um atalho para JSON.',
        check: ["^return\\s+\\$this->json\\(\\s*\\[\\s*'post'\\s*=>\\s*\\$slug\\s*\\]\\s*\\);?$"],
        choices: {
          correct: "return $this->json(['post' => $slug]);",
          wrong: ["return ['post' => $slug];", "echo json_encode($slug);", "return $this->render(['post' => $slug]);"],
        },
      },
      {
        title: 'Rodada 3 — O compasso errado',
        description: 'O template precisa usar o layout base. Qual é a primeira linha?',
        talk: 'Cada página com o seu HTML inteiro. Mais notas!',
        hint: 'No Twig, a herança começa com extends.',
        check: ["^\\{%\\s*extends\\s+'base\\.html\\.twig'\\s*%\\}$"],
        choices: {
          correct: "{% extends 'base.html.twig' %}",
          wrong: ["{{ extends 'base.html.twig' }}", "{% include 'base.html.twig' %}", "@extends('base.html.twig')"],
        },
      },
      {
        title: 'Rodada 4 — A nota que nunca soa',
        description: 'O produto passou pelo persist(), mas não chegou ao banco. O que falta?',
        talk: 'Persist já basta. Confie na partitura.',
        hint: 'O Doctrine só executa no banco quando você chama flush.',
        check: ['^\\$entitymanager->flush\\(\\);?$'],
        choices: {
          correct: '$entityManager->flush();',
          wrong: ['$entityManager->persist($produto);', '$produto->save();', '$entityManager->commit();'],
        },
      },
      {
        title: 'Rodada 5 — Golpe final: afinar o formulário',
        description: 'Qual condição processa só formulários enviados e válidos?',
        talk: 'Qualquer envio é música para os meus ouvidos.',
        hint: 'Enviado E válido.',
        check: ['^if\\s*\\(\\s*\\$form->issubmitted\\(\\)\\s*&&\\s*\\$form->isvalid\\(\\)\\s*\\)$'],
        choices: {
          correct: 'if ($form->isSubmitted() && $form->isValid())',
          wrong: ['if ($form->isSubmitted() || $form->isValid())', 'if ($form->isValid())', 'if ($request->isPost())'],
        },
      },
    ],
    badgeId: 'ram-symfony-sinfonia',
    badgeTitle: 'Regente da Sinfonia',
    badgeDescription: 'Afinou a Sinfonia Desafinada com rotas, Twig, Doctrine e formulários: a coroa da Ramificação Symfony.',
  },
};
