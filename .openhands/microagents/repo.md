
# General Microagents

> General guidelines for OpenHands to work more effectively with the repository.

## Usage

These microagents are always loaded as part of the context.

## Frontmatter Syntax

The frontmatter for this type of microagent is optional.

Frontmatter should be enclosed in triple dashes (---) and may include the following fields:

| Field   | Description                          | Required | Default        |
| ------- | ------------------------------------ | -------- | -------------- |
| `agent` | The agent this microagent applies to | No       | 'CodeActAgent' |

## Creating a Comprehensive Repository Agent

To create an effective repository agent, you can ask OpenHands to analyze your repository with a prompt like:

```
Please browse the repository, look at the documentation and relevant code, and understand the purpose of this repository.

Specifically, I want you to create a `.openhands/microagents/repo.md` file. This file should contain succinct information that summarizes:
1. The purpose of this repository
2. The general setup of this repo
3. A brief description of the structure of this repo

Read all the GitHub workflows under .github/ of the repository (if this folder exists) to understand the CI checks (e.g., linter, pre-commit), and include those in the repo.md file.
```

This approach helps OpenHands capture repository context efficiently, reducing the need for repeated searches during conversations and ensuring more accurate solutions.

## Example Content

A comprehensive repository agent file (`.openhands/microagents/repo.md`) should include:

```
# Repository Purpose
This project is a TODO application that allows users to track TODO items.

# Setup Instructions
To set it up, you can run `npm run build`.

# Repository Structure
- `/src`: Core application code
- `/tests`: Test suite
- `/docs`: Documentation
- `/.github`: CI/CD workflows

# CI/CD Workflows
- `lint.yml`: Runs ESLint on all JavaScript files
- `test.yml`: Runs the test suite on pull requests

# Development Guidelines
Always make sure the tests are passing before committing changes. You can run the tests by running `npm run test`.
```

[See more examples of general microagents here.](https://github.com/All-Hands-AI/OpenHands/tree/main/.openhands/microagents)

# Repository Purpose
Pixel Quest is a multiplayer maze race game where players navigate a maze using flashlights to reveal paths, avoid walls, and race to the exit. Built with Next.js (client-side UI), Colyseus (real-time multiplayer server), and Phaser (game rendering). Pivoting to GitHub Spec Kit for spec-driven development with atomic stories, >80% test coverage, and phased epics (lobby, maze gen/display, movement/sync, flashlight, scoring, power-ups).

# Setup Instructions
Clone the repo: `git clone https://github.com/qubitquilt/pixel-quest.git`  
cd pixel-quest  
pnpm install  
Run dev: `pnpm run dev` (starts client on :3000, server on :2567)  
Or separately: `pnpm --filter client dev` and `pnpm --filter server dev`  
Test: `pnpm run test` (Jest units), `pnpm run test:e2e` (Playwright)  
Build: `pnpm run build`  
Lint: `pnpm run lint`  
Pre-commit: Run `.openhands/pre-commit.sh` for lint/test/build checks.

# Repository Structure
- `/packages/client`: Next.js app (UI, Phaser integration in app/components/PhaserGame.tsx)  
- `/packages/server`: Colyseus server (rooms in rooms/, index.ts entry)  
- `/packages/shared`: Shared types/utils (types/, index.ts)  
- `/docs`: Architecture/PRD/stories (migrated to .specify/specs/ for Spec Kit)  
- `/.specify`: GitHub Spec Kit (constitution.md, specs/16 MD stories, templates/prompts/scripts)  
- `/.openhands`: OpenHands integration (pre-commit.sh, setup.sh, microagents/)  
- `/test`: Client tests (e2e/, test/)  
- Root: package.json (pnpm workspaces), README.md, pnpm-lock.yaml  

# CI/CD Workflows
No .github/workflows/ by default. Recommended:  
- Lint: ESLint on TS/JS via `pnpm run lint`  
- Test: Jest units (`pnpm run test --coverage >80%`)  
- E2E: Playwright (`pnpm run test:e2e`)  
- Build: Next.js/Colyseus (`pnpm run build`)  
Pre-commit hook in .openhands/pre-commit.sh enforces lint/test/build. Use Spec Kit CLI (`specify check/analyze`) for spec validation.

# Development Guidelines
- Atomic changes: One story per branch/PR (e.g., feat/story-1.1), >80% coverage, all tests pass.  
- Testing: Unit (Jest) for functions/scenes; E2E (Playwright) for flows (lobby join, movement, visibility). Mock Colyseus for client tests.  
- Spec Kit: Align changes to .specify/specs/ (e.g., /plan for tasks, /check for compliance).  
- Multiplayer: Defer Colyseus sync to later stories; prototype single-player first.  
- Commits: Conventional (feat/fix), Co-authored-by: openhands. No secrets in code/env.  
- Pivot: Simpler Phaser prototype (ray-traced flashlight, basic maze/movement) before full multiplayer.
