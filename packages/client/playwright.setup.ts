import { test as setup } from '@playwright/test';
import { spawn } from 'child_process';
import { promisify } from 'util';

setup('setup server', async () => {
  console.log('Starting Colyseus server...');
  // Start the server in the background with output capture
  const serverProcess = spawn('npm', ['run', 'dev', '--workspace=server'], {
    stdio: ['ignore', 'pipe', 'pipe'],
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

  // Store the process for teardown
  if (serverProcess.pid) {
    process.env.SERVER_PID = serverProcess.pid.toString();
  }
  console.log('Server setup completed');
});