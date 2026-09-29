import type { Trail } from '@/domain/trail/types';
import { ramLaravelModules } from './modules';

/**
 * Ramificação Laravel (Evento Nexus da Lua de PHP). Conteúdo original, com base só na
 * documentação oficial do Laravel (links no fim de cada trilha).
 */
export const ramLaravelTrail: Trail = {
  id: 'ram-laravel',
  title: 'Ramificação Laravel',
  tagline: 'PHP completo e organizado: rotas, Blade, Eloquent, validação e o Artisan.',
  symbol: 'ram-laravel',
  accent: '#3df5ff',
  eyebrow: 'Ramificação de PHP · Laravel',
  intro: [
    'Viajante, a primeira Ramificação da Lua de PHP é o Laravel. Aqui o PHP ganhou uma linha de comando que gera código, um banco que vira classe e páginas que se protegem sozinhas.',
    'Mas o <b>Artesão das Sombras</b> usa o Artisan para o mal: cria rotas soltas, salva qualquer coisa no banco e esquece a proteção dos formulários.',
    'Em 5 trilhas você vai aprender o jeito Laravel de fazer tudo. Depois, a oficina dele fecha. Bora?',
  ],
  modules: ramLaravelModules,
  lab: null,
  bossFight: {
    bossName: 'O Artesão das Sombras',
    tagline: 'O ARTISAN QUE ESQUECEU AS REGRAS',
    intro: [
      'O Artesão das Sombras trabalha numa oficina escura, gerando código com o Artisan sem olhar o que sai.',
      'Cada rodada é uma parte do Laravel que ele entortou.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'artesao.php',
    rounds: [
      {
        title: 'Rodada 1 — A oficina apagada',
        description: 'Qual comando sobe o servidor de desenvolvimento?',
        talk: 'Servidor? Eu trabalho no escuro.',
        hint: 'O Artisan sobe o servidor com serve.',
        check: ['^php\\s+artisan\\s+serve$'],
        choices: { correct: 'php artisan serve', wrong: ['php artisan start', 'composer serve', 'php -S artisan'] },
      },
      {
        title: 'Rodada 2 — A rota sem dono',
        description: 'A rota /usuario/{id} precisa chamar o método mostrar do UsuarioController. Qual linha?',
        talk: 'Cada rota com uma função gigante dentro. É mais artesanal.',
        hint: "Rota para controller: o array com a classe e o nome do método em texto.",
        check: ["^route::get\\(\\s*'/usuario/\\{id\\}'\\s*,\\s*\\[\\s*usuariocontroller::class\\s*,\\s*'mostrar'\\s*\\]\\s*\\);?$"],
        choices: {
          correct: "Route::get('/usuario/{id}', [UsuarioController::class, 'mostrar']);",
          wrong: [
            "Route::get('/usuario/{id}', 'mostrar');",
            "Route::get('/usuario/{id}', [UsuarioController::class, mostrar()]);",
            "Route::post('/usuario/{id}', [UsuarioController::class, 'mostrar']);",
          ],
        },
      },
      {
        title: 'Rodada 3 — O texto perigoso',
        description: 'No Blade, qual jeito mostra o nome digitado pelo usuário com o HTML escapado?',
        talk: 'Mostre cru. Se tiver script, melhor ainda.',
        hint: 'As chaves duplas escapam o HTML.',
        check: ['^\\{\\{\\s*\\$nome\\s*\\}\\}$'],
        choices: { correct: '{{ $nome }}', wrong: ['{!! $nome !!}', '<?php echo $_GET["nome"]; ?>', '@nome'] },
      },
      {
        title: 'Rodada 4 — O banco sem porteiro',
        description: 'O model Tarefa precisa aceitar só titulo e feita no create(). Qual linha?',
        talk: 'Deixe entrar tudo. Até is_admin.',
        hint: '$fillable lista os campos que podem ser preenchidos em massa.',
        check: ["^protected\\s+\\$fillable\\s*=\\s*\\[\\s*'titulo'\\s*,\\s*'feita'\\s*\\]\\s*;?$"],
        choices: {
          correct: "protected $fillable = ['titulo', 'feita'];",
          wrong: ["protected $guarded = [];", "public $fields = ['titulo', 'feita'];", "protected $fillable = '*';"],
        },
      },
      {
        title: 'Rodada 5 — Golpe final: validar antes de salvar',
        description: 'Antes de criar a tarefa, qual linha valida o título?',
        talk: 'Validar? Salve direto do $_POST!',
        hint: '$request->validate recebe as regras e devolve os dados validados.',
        check: ["^\\$dados\\s*=\\s*\\$request->validate\\(\\s*\\[\\s*'titulo'\\s*=>\\s*'required\\|max:255'\\s*\\]\\s*\\);?$"],
        choices: {
          correct: "$dados = $request->validate(['titulo' => 'required|max:255']);",
          wrong: ["$dados = $_POST;", "$dados = $request->all();", "$dados = $request->validate(['titulo']);"],
        },
      },
    ],
    badgeId: 'ram-laravel-artesao',
    badgeTitle: 'Mestre da Oficina',
    badgeDescription: 'Iluminou a oficina do Artesão das Sombras com rotas, Blade, Eloquent e validação: a coroa da Ramificação Laravel.',
  },
};
