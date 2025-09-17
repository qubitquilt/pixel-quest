import { execSync } from 'child_process';

export default async () => {
  // Force kill server via PID if available
  if (process.env.SERVER_PID) {
    execSync(`kill -9 ${process.env.SERVER_PID} || true`, { stdio: 'inherit' });
    console.log(`Force-killed server process ${process.env.SERVER_PID}`);
  }
  // Kill any lingering ts-node server processes from server dir
  execSync('cd ../server && pkill -f "ts-node index.ts" || true', { stdio: 'inherit', cwd: '../server' });
  console.log('Killed any ts-node server processes');
  // Kill client and server via ports as fallback (force kill)
  execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', { stdio: 'inherit' });
  execSync('lsof -ti:2567 | xargs kill -9 2>/dev/null || true', { stdio: 'inherit' });
  // Additional safety: kill any node processes on port 2567
  execSync('npx kill-port 2567 || true', { stdio: 'inherit' });
  console.log('Teardown completed: all server and client processes killed');
};