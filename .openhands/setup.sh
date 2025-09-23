
#!/bin/bash
set -e

echo "Setting up Pixel Quest multiplayer maze game..."

# Install dependencies
pnpm install

# Optional: Run tests to verify setup
echo "Running tests to verify setup..."
pnpm run test

echo "Setup complete!"
echo "To run development servers:"
echo "  pnpm --filter server dev  # Server"
echo "  pnpm --filter client dev  # Client"
echo "Or run both: pnpm run dev"
