
# Pixel Quest Repository Guide

## Purpose
Pixel Quest is a multiplayer maze race game built with Next.js (client UI), Colyseus (real-time server), and Phaser (2D game rendering). Players join lobbies, navigate procedurally generated mazes using directional flashlights for limited visibility, and race to the exit while avoiding walls. Key features include real-time movement synchronization, scoring, power-ups, and round-based progression. The project is pivoting to GitHub Spec Kit for spec-driven development, focusing on atomic epics (lobby, maze generation/display, movement/sync, flashlight visibility, scoring, power-ups) with >80% test coverage. Currently emphasizing a single-player Phaser prototype before full multiplayer integration.

## Setup
- **Prerequisites**: Node.js v18+, pnpm (install via `corepack enable`).
- **Clone and Install**:
  ```
  git clone https://github.com/qubitquilt/pixel-quest.git
  cd pixel-quest
  pnpm install
  ```
- **Environment**: Create `.env.local` in `packages/client` and `packages/server`:
  - Client: `NEXT_PUBLIC_SERVER_URL=http://localhost:2567`
  - Server: `PORT=2567`
- **Run Development**:
  - Both: `pnpm run dev` (client on :3000, server on :2567)
  - Client only (prototype): `pnpm --filter client dev`
  - Server: `pnpm --filter server dev`
- **Build and Test**:
  - Build: `pnpm run build`
  - Lint: `pnpm run lint`
  - Unit Tests (Jest): `pnpm run test` (57/57 passing; aim for >80% coverage)
  - E2E Tests (Playwright): `pnpm run test:e2e`
- **Prototype Testing**: Run client dev server to test single-player FlashlightScene (WASD movement, ray-traced flashlight cone).

## Structure
- **Root**:
  - `package.json` / `pnpm-lock.yaml`: pnpm monorepo with workspaces (client, server, shared).
  - `README.md`: Project overview, setup, usage, roadmap.
  - `.specify/`: GitHub Spec Kit (constitution.md, specs/ with 16 story MDs for epics, templates/, prompts/, scripts/).
  - `.openhands/`: Development tools (pre-commit.sh for CI checks, setup.sh for install/test/dev).
- **packages/**:
  - `client/`: Next.js app.
    - `app/components/PhaserGame.tsx`: Core game integration (FlashlightScene prototype: maze generation, physics-based WASD movement, ray-casting flashlight visibility).
    - `lib/`: Phaser declarations (phaser.d.ts), Colyseus client (colyseus.ts), utilities (utils.ts).
    - `tests/`: Jest unit tests; E2E in `e2e/`.
    - Config: `next.config.ts`, `jest.config.js`, `tsconfig.json`.
  - `server/`: Colyseus WebSocket server.
    - `index.ts`: Server bootstrap.
    - `rooms/MazeRaceRoom.ts`: Game room logic (procedural maze generation, movement handling, winner detection, timeouts).
    - `tests/`: Jest unit tests (e.g., winner.test.ts).
    - Config: `jest.config.js`, `tsconfig.json`.
  - `shared/`: Cross-package types and utilities.
    - `types/`: Interfaces (e.g., Player, GameState, RoundState).
    - `index.ts`: Exports.
    - `package.json`: Shared dependencies.
- **docs/**: High-level docs (architecture diagrams, original PRD/stories; migrated to .specify/specs/ for Spec Kit).
- **Other**: Root `tsconfig.json`, `jest.config.js`; no tests or docs at root.

## CI Checks
No `.github/workflows/` directory exists; CI is enforced locally via `.openhands/pre-commit.sh`, which runs:
- `pnpm run lint` (ESLint for TypeScript/JavaScript, with @typescript-eslint plugins).
- `pnpm run test` (Jest unit tests with coverage reporting; thresholds disabled but target >80%).
- `pnpm run build` (Next.js and Colyseus builds).

Recommended GitHub Actions (not implemented):
- PR checks for linting, unit tests (with coverage), E2E tests, and build verification.
- Use Spec Kit CLI (`npx specify check`) for spec compliance in workflows.
