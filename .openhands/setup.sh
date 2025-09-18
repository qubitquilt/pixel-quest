#!/bin/bash

# Install Node.js 20 via NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs

# Enable corepack and prepare pnpm 9.1.0
corepack enable
corepack prepare pnpm@9.1.0 --activate

# Install dependencies with frozen lockfile
pnpm install --frozen-lockfile