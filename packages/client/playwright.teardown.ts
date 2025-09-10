import { test as setup } from '@playwright/test';
import { execSync } from 'child_process';

setup('teardown server', async () => {
  // Kill the server and client processes
  execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', { stdio: 'inherit' });
  execSync('lsof -ti:2567 | xargs kill -9 2>/dev/null || true', { stdio: 'inherit' });
});