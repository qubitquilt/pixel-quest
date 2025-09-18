---
name: repo
type: repo
agent: CodeActAgent
---

# Pixel Quest — OpenHands microagents repository guide

A concise, machine-readable summary of this repository to help OpenHands microagents (BMAD personas) navigate, reason, and act inside the repo.

## Project (canonical)

- Name: pixel-quest
- Description: Multiplayer maze race game built with Next.js (client), Colyseus (server) and Phaser (game rendering).
- Canonical README: [`README.md`](README.md:1)
- Repository root packages:
  - [`package.json`](package.json:1) (workspace root)
  - [`packages/client/package.json`](packages/client/package.json:1)
  - [`packages/server/package.json`](packages/server/package.json:1)
  - [`packages/shared/package.json`](packages/shared/package.json:1)

## Goals for microagents
- Enable safe, repository-specific suggestions and automated edits limited to the scope described below.
- Guide contributors through setup, testing, and PR checks.
- Provide actionable steps for story implementation, testing, and QA gate automation.

## Microagents scope & expectations
- Read-only analysis: scanning docs/, package manifests, and source files to produce plans.
- Patch generation: propose diffs and PR branches for implementation tasks when approved.
- CI-aware actions: run repository commands only when the environment supports them (e.g., local dev container or approved sandbox).
- Do not escalate or publish secrets; require human confirmation for changes that touch credentials, deploy infra, or release processes.

## Intended audience
- BMAD microagents (bmad-dev-implement, bmad-qa-review, bmad-architect, etc.)
- Human maintainers and contributors reviewing or approving agent actions.

## Primary maintainers / contact
- Maintainer: (not specified in repo) — README lists placeholder contact: `Your Name - email@example.com` [`README.md`](README.md:141)
- Required: Please provide an email and GitHub handle for the primary maintainer and a security contact. If not provided, microagents should open an issue instead of making changes that require maintainer consent.

## Supported versions and compatibility
- Node.js: recommended v18 or higher (see README).
- pnpm: this repo uses pnpm (Corepack recommended).
- TypeScript: project uses TypeScript 5.x (see root pnpm overrides).
- Next.js: configured in `packages/client` (see `packages/client/package.json`).

## Setup & common commands (minimal working examples)
Clone and install:
```bash
git clone https://github.com/yourusername/pixel-quest.git
cd pixel-quest
pnpm install
```
Run services for development:
```bash
# Run server
pnpm --filter server dev
# Run client
pnpm --filter client dev
# Run both from root (concurrently)
pnpm run dev
```
Build and test:
```bash
pnpm run build
pnpm run test
pnpm run test:e2e
pnpm run lint
```
Environment files:
- Create `.env.local` in `packages/client` and `packages/server` as needed.
- Common env vars referenced in `README.md`:
  - `PORT` (server)
  - `NEXT_PUBLIC_SERVER_URL` (client)

## Repository layout (relevant to agents)
- `packages/client/` — Next.js app (UI).
- `packages/server/` — Colyseus server (rooms under `packages/server/rooms`).
- `packages/shared/` — shared types and utilities.
- `docs/` — architecture, PRD, stories and QA guidance.
- `.openhands/microagents/` — repo-level microagents and BMAD persona helpers.

## CI, testing, and automation expectations
- This repo does not include `.github/workflows/` by default. Recommended CI checks:
  - lint (pnpm run lint)
  - test (pnpm run test)
  - build (pnpm run build)
- Pre-commit checks: repo includes `.openhands/pre-commit.sh`; it should run `pnpm run lint`, `pnpm run test`, `pnpm run build` (see `.openhands/pre-commit.sh`).

## Security considerations
- Secrets must live in environment variables and not be committed.
- Microagents must avoid committing files containing secrets; flag and open an issue when secret-like content is detected.
- Any action involving deployment keys, infra, or release automation requires human approval and a maintainer contact.

## Testing and quality policy
- Unit tests: `pnpm run test` (Jest).
- E2E: `pnpm run test:e2e` (Playwright).
- Linting: `pnpm run lint`.
- Agents may run tests in approved sandboxes; failing tests must stop automated PRs.

## Versioning and release policy
- No repository release policy found. Recommendation: adopt semantic versioning (semver) for packages and maintain a `CHANGELOG.md` using conventional commits.
- For the monorepo, recommend tagging releases at root and publishing selected packages if needed.

## Links (canonical)
- README: [`README.md`](README.md:1)
- PRD and stories: [`docs/prd/`](docs/prd/:1)
- Architecture docs: [`docs/architecture/`](docs/architecture/:1)
- Microagents: [`.openhands/microagents/repo.md`](.openhands/microagents/repo.md:1)

## Minimal agent-safe configuration example
Example: run tests and open an issue if they fail (requires gh CLI with auth):
```bash
pnpm install --frozen-lockfile
pnpm run test || gh issue create --title "Automated test failure" --body "Automated test run failed. Please investigate."
```

## Notes and missing information for maintainers
Please add or confirm:
- Maintainer GitHub handle and contact email
- Official repository URL (if different from README placeholder)
- Release policy or desired semantic versioning rules

## How microagents should use this file
Use this file as first-pass context. When proposing changes:
1. Create a draft plan (describe files and diffs).
2. Request approval from a human maintainer (or open an issue).
3. Apply changes in a feature branch and include tests.

End of file.
