# Contributing to MentoraPredict

Thank you for your interest in contributing. This guide covers the workflow, conventions, and quality gates you need to follow.

## Getting Started

1. Fork the repository and clone your fork.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the environment template and configure your local environment:
   ```bash
   cp infra/.env.example infra/.env
   bash infra/kong/generate-kong-keys.sh
   ```
4. Start the development stack:
   ```bash
   docker compose --env-file infra/.env -f infra/docker/docker-compose.dev.yml up -d --build
   ```
5. Verify the services are running:
   ```bash
   curl http://localhost:8000/health
   ```

## Branching Strategy

```
main  (production)
  ^
  |
QA    (staging)
  ^
  |
dev   (integration)
  ^
  |
feature/* / fix/* / chore/*
```

- All new work starts from `dev`.
- Promotion happens via pull request: `dev` -> `QA` -> `main`.
- `main` is always deployable. `QA` receives automatic deployments on push.

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/), enforced by `commitlint` on every PR.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependencies |
| `ci` | CI/CD configuration |
| `build` | Build system or dependency changes |
| `hotfix` | Urgent production fix |

### Scopes

Must be one of: `api`, `auth`, `web`, `mobile`, `desktop`, `backend`, `frontend`, `ci`, `cd`, `docker`, `docs`, `deps`, `config`, `infra`, `build`, `lint`, `readme`, `github`.

### Examples

```bash
git commit -m "feat(academic-service): add grade upload endpoint"
git commit -m "fix(auth): resolve JWT refresh token race condition"
git commit -m "docs(deployment): update QA environment variables table"
```

## Development Workflow

1. Create a feature branch from `dev`:
   ```bash
   git checkout -b feature/my-feature dev
   ```
2. Make your changes.
3. Run the quality gates before committing:
   ```bash
   pnpm lint
   pnpm build
   pnpm test
   ```
4. Commit with a conventional commit message.
5. Push and open a pull request into `dev`.

## Pull Request Guidelines

- PRs into `QA` or `main` trigger the full CI pipeline (lint, build, test, gitleaks scan).
- PRs into `dev` only run commitlint -- but you should still run `pnpm lint && pnpm build && pnpm test` locally.
- Keep PRs focused. One feature or fix per PR.
- Write a clear PR description explaining what changed and why.
- Link related issues if applicable.

## Code Standards

- TypeScript strict mode across all packages.
- ESLint + Prettier for formatting. Run `pnpm format` to auto-fix.
- Follow the existing patterns in the file you are editing.
- Do not introduce `any` types without a documented reason.
- Do not commit secrets, API keys, or credentials. The repository uses `gitleaks` to catch accidental leaks.

## Documentation

- Keep [`docs/`](./docs/) updated alongside code changes.
- If you add or change an API endpoint, update [`docs/api/`](./docs/api/).
- If you change architecture or infrastructure, update the relevant doc in [`docs/architecture/`](./docs/architecture/) or [`docs/infrastructure/`](./docs/infrastructure/).
- Architecture decisions should be recorded as an ADR in [`docs/adr/`](./docs/adr/).

## Reporting Issues

Open an issue on GitHub with:

- A clear title and description.
- Steps to reproduce (for bugs).
- Expected vs actual behavior.
- Environment details (OS, Node version, browser if frontend).

## Questions

For questions about the codebase, open a discussion or reach out to the maintainers.
