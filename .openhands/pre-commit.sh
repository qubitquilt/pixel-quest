#!/bin/bash
# .openhands/pre-commit.sh
# Lightweight pre-commit checks intended for local developer sandboxes.
# NOTE: Running these in CI is recommended but may require different env/setup.
set -euo pipefail

echo "Pre-commit: running repository checks (lint, test, build)"

# Prefer root-level pnpm scripts defined in package.json
# Use --silent to reduce noise; keep exit-on-failure semantics.
echo "Running lint..."
pnpm run lint --silent
if [ $? -ne 0 ]; then
  echo "Linting failed. Please fix the issues before committing."
  exit 1
fi

echo "Running tests..."
pnpm run test --silent
if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix the issues before committing."
  exit 1
fi

echo "Running build..."
pnpm run build --silent
if [ $? -ne 0 ]; then
  echo "Build failed. Please fix the issues before committing."
  exit 1
fi

echo "All checks passed!"
exit 0