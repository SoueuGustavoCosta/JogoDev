export function PrivacyPage() {
  return (
    <article>
      <h1>Privacidade</h1>
      <p>
        Esta página explica, sem letra miúda, o que o app guarda sobre você, onde guarda e quem pode ver. Ela segue a
        LGPD (Lei nº 13.709/2018).
      </p>

      <h2>No seu aparelho</h2>
      <p>
        Seu progresso (módulos, XP, insígnias, sequência de dias) fica salvo no navegador (localStorage). O app não
        usa cookies. Algumas preferências, como o som ligado ou desligado, também ficam só aqui.
      </p>

      <h2>No servidor</h2>
      <p>
        Depois que você passa pelo prólogo, o app cria uma conta anônima no Supabase (servidor em São Paulo) para o
        Hall dos Viajantes e para o seu progresso não se perder se você trocar de aparelho. Lá ficam:
      </p>
      <ul>
        <li>o nome que você escolheu, e a foto e o resumo &quot;Sobre você&quot;, se você adicionar;</li>
        <li>os módulos concluídos, as insígnias e a sequência de dias;</li>
        <li>
          os dias em que você consertou a Anomalia do Dia (a turma vê só quantas pessoas consertaram, nunca
          quem);
        </li>
        <li>os itens da Loja do Viajante que você equipou no avatar (moldura, cor, cabelo, acessório);</li>
        <li>o XP que você ganhou em cada semana, para o ranking da Liga dos Viajantes;</li>
        <li>o horário da última atividade, para mostrar quem está online agora;</li>
        <li>uma cópia de segurança do seu progresso completo.</li>
      </ul>
      <p>
        Se você usar &quot;Criar conta&quot;, o telefone (e o e-mail, se você informar um para recuperar a senha)
        vira o acesso da sua conta. A senha é guardada protegida pelo Supabase, e o código de recuperação só é
        guardado embaralhado (em hash), nunca em texto.
      </p>

      <h2>Quem vê o quê</h2>
      <p>
        No Hall dos Viajantes, qualquer pessoa vê seu nome, foto, os itens do avatar, resumo, eras concluídas,
        insígnias e se você está online. Na Liga, vê também seu XP da semana e seus dias de linha. Telefone, e-mail, senha e a cópia do progresso não aparecem para ninguém. Use um apelido se preferir
        não mostrar seu nome real.
      </p>

      <h2>O que é medido</h2>
      <p>
        Só contagens anônimas, sem cookies e sem identificar você. Nenhuma das duas ferramentas abaixo recebe seu
        nome, telefone, e-mail, foto ou o seu progresso.
      </p>
      <ul>
        <li>
          <b>Vercel Web Analytics:</b> quantas visitas e quais páginas são abertas.
        </li>
        <li>
          <b>PostHog:</b> como o app é usado, por exemplo quantas pessoas abrem uma era, em que altura de um módulo
          mais gente para, quantas perguntas são acertadas e se o laboratório foi usado. Cada visita recebe um código
          aleatório que só existe enquanto a aba está aberta: não dá para saber quem é você nem juntar visitas
          diferentes. O endereço IP não é guardado.
        </li>
      </ul>

      <h2>Seus direitos</h2>
      <p>
        &quot;Sair desta conta&quot;, na tela do Viajante, apaga o progresso deste aparelho, mas não apaga o que está
        no servidor. Para ver, corrigir ou apagar seus dados de lá, fale com o autor do projeto, Gustavo Costa Gomes,
        pelo e-mail <a href="mailto:costagustavogt@gmail.com">costagustavogt@gmail.com</a> ou pelo Instagram{' '}
        <a href="https://www.instagram.com/soueugustavocosta/" target="_blank" rel="noopener noreferrer">
          @Soueugustavocosta
        </a>
        .
      </p>

      <h2>Contribuição por Pix</h2>
      <p>É voluntária. O app não sabe se um Pix foi feito e não mede valores nem apoiadores.</p>
    </article>
  );
}
