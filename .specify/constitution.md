# Pixel Quest Constitution

## Project Overview
Pixel Quest is a multiplayer maze race game for 4 players, built as a browser-based MVP using Phaser for rendering, Next.js for the client, Colyseus for the server, and shared TypeScript types. The game features random maze generation, player movement with flashlight visibility, scoring, and power-ups.

## Goals
- Create a fun, solvable 4-player maze racer playable in modern browsers.
- Achieve smooth framerate on consumer hardware.
- Host within free-tier limits (e.g., Google Cloud).

## Non-Goals
- Mobile support.
- Advanced graphics or AI opponents.
- Persistent user accounts.

## Tech Stack
- **Client:** Next.js 15+, React 19+, Phaser (game rendering), TypeScript 5+.
- **Server:** Node.js, Colyseus (multiplayer rooms and sync).
- **Shared:** TypeScript types and utilities.
- **Build/Tools:** pnpm monorepo, Jest (unit tests), Playwright (E2E), ESLint.
- **Deployment:** Free-tier cloud (e.g., Google Cloud Run).

## Development Principles
- Atomic changes: One story per branch/PR.
- Test-driven: 80% coverage, all tests pass before merge.
- Spec-driven: Use .specify/specs/ for user stories as Markdown specs.
- Clean code: Minimal comments, focus on readability.

## Workflow
1. Write/update spec in .specify/specs/.
2. Implement in feature branch.
3. Run tests (unit/E2E/lint/build).
4. PR with review; merge to main.

## Constraints
- No secrets in repo; use env vars.
- Free-tier hosting only.
- Browser-only, no installs.

## Success Metrics
- All epics implemented and tested.
- Playable MVP with 4 players.
- CI passing on PRs.
