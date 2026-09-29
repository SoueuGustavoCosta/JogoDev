# Arquipélago (JogoDev)

App web gratuito e interativo para aprender tecnologia do zero ao avançado, jogando. Sem login: o progresso fica no navegador do aluno.

- **Stack:** Vite + React + TypeScript (strict), arquitetura em camadas (domain → application → infrastructure/presentation), Vitest, ESLint com `eslint-plugin-boundaries`.
- **Ilha em produção:** Banco de Dados — 10 módulos de PostgreSQL (mais a Lua da Modelagem e a Lua do Guardião, com 5 cada), quiz e um laboratório SQL rodando Postgres de verdade no navegador via [PGlite](https://github.com/electric-sql/pglite).
- **Expansão Nexus e Cometas:** depois do chefe de cada lua de linguagem, um Evento Nexus abre 3 Ramificações de frameworks (Django, FastAPI, Flask; Spring Boot, Javalin, Quarkus; Laravel, Symfony, CodeIgniter), com 5 trilhas, chefe e insígnia cada. Cometas de tecnologia (Docker, Linux, Git) passam pelo céu do mapa por 14 dias e depois ficam no Arquivo da AVT (`/arquivo`). Plano e decisões em `docs/expansao/`.
- **Era da Web:** 10 trilhas de ação (HTML, CSS e JS) com seis motores de missão, o chefe Eco, o portfólio que o viajante constrói, 3 luas que nascem do Eco no mapa e as Ramificações pelo Evento Nexus. Detalhes em `docs/eras/web/README.md`.
- `CLAUDE.md` / `CLAUDE-TEMPO.md` — especificação e arquitetura do projeto (leia antes de mexer no código).
- `legacy/` — protótipo original em HTML único, usado como fonte da migração de conteúdo.
- `prototypes/` — protótipos de telas, 3D e mapa (referência visual para features futuras).

## Rodando localmente

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # Vitest (domínio, aplicação, não regressão de conteúdo)
npm run lint
npm run typecheck
npm run build
```

## Adicionando uma ilha nova

Crie `src/content/trails/<id>/` (metadados + módulos) e registre em `src/content/registry.ts`. Nenhum outro arquivo do projeto deve mudar — veja a seção 3 e 10 do `CLAUDE.md`.

Cada pergunta do quiz tem um `id` (único no módulo, nunca só dígitos, ex.: `q1`): o progresso do aluno é guardado por esse id. Um id publicado nunca muda nem é reaproveitado; a pergunta pode mudar de lugar levando o id junto, e pergunta nova ganha id novo.

Colaboração voluntária via Pix pelo link discreto "Colabore com o projeto" (rodapé e Configurações).
