import { spawn } from 'child_process';
 
export default async () => {
  console.log('Starting Colyseus server...');
  // Start the server in the background with output capture
  const serverProcess = spawn('pnpm', ['exec', 'ts-node', 'index.ts'], {
    cwd: '../server',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PLAYWRIGHT_TEST: 'true' },
    detached: true
  });
  console.log('Server process spawned with PID:', serverProcess.pid);
  
  // Log server output
  serverProcess.stdout?.on('data', (data) => {
    console.log('Server stdout:', data.toString());
  });
  serverProcess.stderr?.on('data', (data) => {
    console.log('Server stderr:', data.toString());
  });

  // Error handling
  serverProcess.on('error', (err) => {
    console.error('Server spawn error:', err);
    throw err;
  });

  serverProcess.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`Server exited unexpectedly with code ${code}`);
      throw new Error(`Server process failed with code ${code}`);
    }
    // Ignore graceful shutdown signals like SIGTERM
  });
  
  console.log('Waiting for server to be ready on port 2567...');

  // Wait for "Listening on ws://localhost:2567" log in stdout
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log('Timeout waiting for server ready log');
      reject(new Error('Timeout waiting for server ready'));
    }, 30000);
    
    const onData = (data: Buffer) => {
      const output = data.toString();
      if (output.includes('Listening on ws://localhost:2567')) {
        clearTimeout(timeout);
        serverProcess.stdout?.off('data', onData);
        console.log('Server is ready based on log');
        resolve();
      }
    };
    
    serverProcess.stdout?.on('data', onData);
  });

  // Wait for health check after WS ready with retry
  console.log('Waiting for /health endpoint...');
  let retryCount = 0;
  const maxRetries = 5;
  const retryDelay = 500; // ms
  while (retryCount < maxRetries) {
    try {
      const res = await fetch('http://localhost:2567/health');
      if (res.ok) {
        console.log('Health check passed');
        break;
      } else {
        throw new Error(`Health check failed: ${res.status}`);
      }
    } catch (err) {
      retryCount++;
      if (retryCount >= maxRetries) {
        throw new Error(`Health check failed after ${maxRetries} retries: ${err}`);
      }
      console.log(`Health check attempt ${retryCount} failed, retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // Store the process for teardown
  if (serverProcess.pid) {
    process.env.SERVER_PID = serverProcess.pid.toString();
  }
  console.log('Server setup completed');
};