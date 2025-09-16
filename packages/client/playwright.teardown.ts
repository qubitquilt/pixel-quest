import { execSync } from 'child_process';

export default async () => {
  // Kill server via PID if available, then fallback to port kills
  if (process.env.SERVER_PID) {
    execSync(`kill ${process.env.SERVER_PID} || true`, { stdio: 'inherit' });
    console.log(`Killed server process ${process.env.SERVER_PID}`);
  }
  // Kill client and server via ports as fallback
  execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', { stdio: 'inherit' });
  execSync('lsof -ti:2567 | xargs kill -9 2>/dev/null || true', { stdio: 'inherit' });
  console.log('Teardown completed: client and server processes killed');
};