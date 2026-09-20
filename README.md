# Arquipélago (JogoDev)

App web gratuito e interativo para aprender tecnologia do zero ao avançado, jogando. Sem login: o progresso fica no navegador do aluno.

- **Stack:** Vite + React + TypeScript (strict), arquitetura em camadas (domain → application → infrastructure/presentation), Vitest, ESLint com `eslint-plugin-boundaries`.
- **Ilha em produção:** Banco de Dados — 22 módulos de PostgreSQL, quiz e um laboratório SQL rodando Postgres de verdade no navegador via [PGlite](https://github.com/electric-sql/pglite).
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

Colaboração voluntária via Pix pelo link discreto "Colabore com o projeto" (rodapé e Configurações).
