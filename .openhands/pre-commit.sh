
#!/bin/bash
set -e

echo "Running pre-commit checks..."

# Lint
pnpm run lint

# Test
pnpm run test

# Build
pnpm run build

echo "Pre-commit checks passed!"
