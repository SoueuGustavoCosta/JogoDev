import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Segurança e permissões").
 */
export const modSeguranca: Module = {
  id: "seguranca",
  short: "Segurança e permissões",
  title: "Segurança, permissões (DCL) e backup",
  lead: "Quem pode fazer o quê, como um ataque de SQL Injection funciona e como não perder tudo.",
  level: "Avançado",
  blocks: [
    { t: 'h', x: "Autenticação, autorização, auditoria" },
    { t: 'cards', items: [{"h":"Autenticação","x":"Quem é você? Usuário e senha, certificados."},{"h":"Autorização","x":"O que você pode fazer? Permissões sobre tabelas e comandos."},{"h":"Auditoria","x":"O que você fez? Logs e triggers que registram as mudanças."}] },
    { t: 'h', x: "DCL no PostgreSQL: roles, GRANT e REVOKE" },
    { t: 'p', x: "No PostgreSQL, usuários e grupos são <b>roles</b>. Você cria o role, dá permissões com <code>GRANT</code> e retira com <code>REVOKE</code>. Siga o <b>princípio do menor privilégio</b>: cada um recebe só o necessário para o seu trabalho." },
    { t: 'code', file: "26_permissoes.sql", x: "-- para repetir o exercício: DROP ROLE IF EXISTS analista;\nCREATE ROLE analista LOGIN PASSWORD 'troque_esta_senha';\n\nGRANT SELECT ON produtos, categorias TO analista;\nGRANT INSERT, UPDATE ON pedidos TO analista;\n\nREVOKE UPDATE ON pedidos FROM analista;" },
    { t: 'note', k: "Sobre o DENY", x: "A apostila cita o <code>DENY</code>, que existe no SQL Server. O PostgreSQL não tem: quem não recebeu <code>GRANT</code> não tem acesso, e o <code>REVOKE</code> retira o que foi concedido." },
    { t: 'h', x: "SQL Injection: o ataque mais clássico" },
    { t: 'p', x: "Acontece quando a aplicação monta o SQL <b>juntando texto digitado pelo usuário</b>. Se o usuário digitar <code>' OR '1'='1</code> num campo de nome, a condição vira sempre verdadeira e o banco devolve tudo:" },
    { t: 'code', file: "27_injection.sql", x: "-- código ERRADO da aplicação (concatena o que o usuário digitou):\n--   \"SELECT * FROM clientes WHERE nome = '\" + entrada + \"'\"\n\n-- se entrada = ' OR '1'='1  o SQL enviado ao banco vira:\nSELECT * FROM clientes WHERE nome = '' OR '1'='1';" },
    { t: 'p', x: "A defesa é usar <b>consultas parametrizadas</b> (<code>PreparedStatement</code> em Java, parâmetros no psycopg do Python, ORMs como JPA), que enviam o comando e os valores separados, de modo que o valor nunca vira código." },
    { t: 'h', x: "Outros cuidados essenciais" },
    { t: 'ul', items: ["<b>Senhas</b> de usuários do seu sistema nunca ficam em texto: guarde apenas um hash forte (bcrypt ou Argon2).","<b>Dados pessoais</b> pedem cuidado legal: no Brasil, a LGPD regula coleta e uso. Guarde só o necessário.","<b>Conexão criptografada</b> (SSL/TLS) entre a aplicação e o banco.","<b>Views e roles</b> para expor só as colunas necessárias a cada perfil.","Nunca use o superusuário <code>postgres</code> na aplicação: crie um role com privilégios mínimos."] },
    { t: 'h', x: "Backup: o seguro do seu banco" },
    { t: 'code', file: "terminal", x: "-- gera um arquivo com o banco inteiro\npg_dump -U postgres loja_dev > backup_loja.sql\n\n-- restaura em outro banco\npsql -U postgres -d loja_novo -f backup_loja.sql", nolab: true },
    { t: 'p', x: "Uma regra popular é a <b>3-2-1</b>: três cópias dos dados, em dois tipos de mídia diferentes, com uma cópia fora do local. E o backup só vale se você já testou restaurar." }
  ],
  quiz: [
    {
      id: 'q1',
      q: "Qual comando retira uma permissão que foi concedida?",
      options: ["DROP","DENY","REVOKE","ROLLBACK"],
      answer: 2,
      explain: "REVOKE retira. O DENY existe no SQL Server, mas não no PostgreSQL.",
    },
    {
      id: 'q2',
      q: "Qual é a melhor defesa contra SQL Injection?",
      options: ["Usar aspas duplas","Consultas parametrizadas","Deixar o banco sem senha","Usar só letras minúsculas"],
      answer: 1,
      explain: "Enviar o comando e os valores separados impede que texto do usuário vire código SQL.",
    },
    {
      id: 'q3',
      q: "O princípio do menor privilégio diz que...",
      options: ["Todos devem ser administradores","Cada usuário recebe apenas as permissões de que precisa","Só o DBA acessa o banco","Nenhum usuário tem senha"],
      answer: 1,
      explain: "Permissões mínimas reduzem o estrago de erros e ataques.",
    },
    {
      id: 'q4',
      q: "Na regra 3-2-1 de backup, o \"1\" significa...",
      options: ["Um usuário","Uma cópia fora do local","Um banco","Uma senha"],
      answer: 1,
      explain: "3 cópias, 2 mídias diferentes, 1 cópia em outro local.",
    }
  ],
};
