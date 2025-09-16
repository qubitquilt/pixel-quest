import { test, expect } from '@playwright/test';

test('displays shareable URL and copy functionality', async ({ page }) => {
  // First, create a room by hosting as host
  await page.goto('/');
  await page.getByRole('button', { name: 'Host Game' }).click();
  await page.waitForTimeout(2000); // Wait for async room creation and navigation
  await page.waitForURL(/\/lobby\/.*/);

  // Verify shareable URL is displayed correctly
  const urlParts = page.url().split('/lobby/')[1];
  const roomId = urlParts.split('?')[0];
  const expectedUrl = `http://localhost:3000/lobby/${roomId}`;
  await expect(page.getByTestId('shareable-url')).toHaveValue(expectedUrl);

  // Test copy functionality
  const copyButton = page.getByTestId('copy-button');
  await copyButton.click();

  // Verify button text changes to "Copied!"
  await expect(copyButton).toHaveText('Copied!');
  
  // Wait for it to revert
  await page.waitForTimeout(2100);
  await expect(copyButton).toHaveText('Copy Link');

  // Verify clipboard contains the URL (mock clipboard in test environment)
  const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardContent).toBe(expectedUrl);
});

test('joins lobby with custom name and displays in player list', async ({ browser, page }) => {
  // Host creates room first to get roomId
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  await hostPage.goto('/');
  await hostPage.getByRole('button', { name: 'Host Game' }).click();
  await hostPage.waitForTimeout(2000); // Wait for async room creation and navigation
  await hostPage.waitForURL(/\/lobby\/.*/);
  const roomId = hostPage.url().split('/').pop();

  // Host auto-joins and should appear in list
  await expect(hostPage.locator('h2')).toHaveText('Players:');
  await expect(hostPage.locator('ul li')).toHaveText('Player'); // Default host name

  // Guest joins with custom name
  await page.goto(`/lobby/${roomId}`);
  await page.getByTestId('player-name-input').fill('Alice');
  await page.getByTestId('join-button').click();

  // Verify guest joined and name appears in both host and guest views
  await expect(page.locator('ul li')).toHaveCount(2);
  await expect(hostPage.locator('ul li')).toHaveCount(2);
  await expect(page.locator('ul li:nth-child(2)')).toHaveText('Alice');
  await expect(hostPage.locator('ul li:nth-child(2)')).toHaveText('Alice');

  // Verify player list shows both
  await expect(hostPage.locator('ul')).toContainText('PlayerAlice');
  await expect(page.locator('ul')).toContainText('PlayerAlice');

  await hostContext.close();
});

test('player name is removed from list on leave', async ({ browser, page }) => {
  // Setup: Host creates room
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  await hostPage.goto('/');
  await hostPage.getByRole('button', { name: 'Host Game' }).click();
  await hostPage.waitForTimeout(2000); // Wait for async room creation and navigation
  await hostPage.waitForURL(/\/lobby\/.*/);
  const roomId = hostPage.url().split('/').pop();
  await expect(hostPage.locator('ul li')).toHaveText('Player'); // Host joined

  // Guest1 joins
  const guest1Context = await browser.newContext();
  const guest1Page = await guest1Context.newPage();
  await guest1Page.goto(`/lobby/${roomId}`);
  await guest1Page.getByTestId('player-name-input').fill('Alice');
  await guest1Page.getByTestId('join-button').click();
  await expect(guest1Page.locator('ul li')).toHaveCount(2);
  await expect(hostPage.locator('ul li')).toHaveCount(2);
  await expect(guest1Page.locator('ul li:nth-child(2)')).toHaveText('Alice');
  await expect(hostPage.locator('ul')).toContainText('PlayerAlice');

  // Guest2 joins
  const guest2Context = await browser.newContext();
  const guest2Page = await guest2Context.newPage();
  await guest2Page.goto(`/lobby/${roomId}`);
  await guest2Page.getByTestId('player-name-input').fill('Bob');
  await guest2Page.getByTestId('join-button').click();
  await expect(guest2Page.locator('ul li')).toHaveCount(3);
  await expect(hostPage.locator('ul li')).toHaveCount(3);
  await expect(guest2Page.locator('ul li:nth-child(3)')).toHaveText('Bob');
  await expect(hostPage.locator('ul')).toContainText('PlayerAliceBob');

  // Guest1 leaves (close page)
  await guest1Context.close();
  await expect(hostPage.locator('ul li')).toHaveCount(2);
  await expect(guest2Page.locator('ul li')).toHaveCount(2);

  // Verify Alice removed from lists
  await expect(hostPage.locator('ul')).not.toContainText('Alice');
  await expect(guest2Page.locator('ul')).not.toContainText('Alice');
  await expect(hostPage.locator('ul')).toContainText('PlayerBob');
  await expect(guest2Page.locator('ul')).toContainText('PlayerBob');

  await hostContext.close();
  await guest2Context.close();
});

 // Test for Story 1.4: Start button is disabled with only host
 test('start button is disabled when only host is present', async ({ page }) => {
   test.setTimeout(5000);
   await page.goto('/');
   await page.getByRole('button', { name: 'Host Game' }).click();
   await page.waitForTimeout(2000);
   await page.waitForURL(/\/lobby\/.*/);

   // Verify start button exists but is disabled (only 1 player)
   await expect(page.getByTestId('start-game-button')).toBeDisabled();
 });

 // Test for Story 1.4: Start button enabled with 2+ players
 test('start button enabled when at least one guest joins', async ({ browser, page }) => {
   test.setTimeout(10000);
   
   // Host creates room
   const hostContext = await browser.newContext();
   const hostPage = await hostContext.newPage();
   await hostPage.goto('/');
   await hostPage.getByRole('button', { name: 'Host Game' }).click();
   await hostPage.waitForTimeout(2000);
   await hostPage.waitForURL(/\/lobby\/.*/);
   const roomId = hostPage.url().split('/').pop();

   // Initially disabled (1 player)
   await expect(hostPage.getByTestId('start-game-button')).toBeDisabled();

   // Guest joins
   await page.goto(`/lobby/${roomId}`);
   await page.getByTestId('player-name-input').fill('Alice');
   await page.getByTestId('join-button').click();
   await expect(hostPage.locator('ul li')).toHaveCount(2);
 
   // Now enabled (2 players)
   await expect(hostPage.getByTestId('start-game-button')).toBeEnabled();

   await hostContext.close();
 });

 // Test for Story 1.4: Start button disabled when player leaves (back to 1 player)
 test('start button disabled when players drop below 2', async ({ browser, page }) => {
   test.setTimeout(10000);
   
   // Host creates room
   const hostContext = await browser.newContext();
   const hostPage = await hostContext.newPage();
   await hostPage.goto('/');
   await hostPage.getByRole('button', { name: 'Host Game' }).click();
   await hostPage.waitForTimeout(2000);
   await hostPage.waitForURL(/\/lobby\/.*/);
   const roomId = hostPage.url().split('/').pop();

   // Guest1 joins - button should enable
   const guest1Context = await browser.newContext();
   const guest1Page = await guest1Context.newPage();
   await guest1Page.goto(`/lobby/${roomId}`);
   await guest1Page.getByTestId('player-name-input').fill('Alice');
   await guest1Page.getByTestId('join-button').click();
   await expect(hostPage.locator('ul li')).toHaveCount(2);
 
   await expect(hostPage.getByTestId('start-game-button')).toBeEnabled();

   // Guest1 leaves - button should disable
   await guest1Context.close();
   await expect(hostPage.locator('ul li')).toHaveCount(1);
 
   await expect(hostPage.getByTestId('start-game-button')).toBeDisabled();

   await hostContext.close();
 });

 // Test for Story 1.4: Host starts game and both navigate to game page
 test('host can start game and all players navigate to game page', async ({ browser, page }) => {
   test.setTimeout(15000);
   
   // Host creates room
   const hostContext = await browser.newContext();
   const hostPage = await hostContext.newPage();
   await hostPage.goto('/');
   await hostPage.getByRole('button', { name: 'Host Game' }).click();
   await hostPage.waitForTimeout(2000);
   await hostPage.waitForURL(/\/lobby\/.*/);
   const roomId = hostPage.url().split('/lobby/')[1]?.split('?')[0] || '';

   // Guest joins to enable start button
   const guestContext = await browser.newContext();
   const guestPage = await guestContext.newPage();
   await guestPage.goto(`/lobby/${roomId}`);
   await guestPage.getByTestId('player-name-input').fill('Alice');
   await guestPage.getByTestId('join-button').click();
   await expect(hostPage.locator('ul li')).toHaveCount(2);
 
   // Verify button enabled before starting
   await expect(hostPage.getByTestId('start-game-button')).toBeEnabled();

   // Host clicks start button
   await hostPage.getByTestId('start-game-button').click();

   // Wait for navigation on both pages
   await Promise.all([
     hostPage.waitForURL(`/game/${roomId}`),
     guestPage.waitForURL(`/game/${roomId}`)
   ]);

   // Verify both navigated to game page
   expect(hostPage.url()).toContain(`/game/${roomId}`);
   expect(guestPage.url()).toContain(`/game/${roomId}`);

   await hostContext.close();
   await guestContext.close();
 });

 // Additional test for Story 1.1: Verify room creation and initial state
 test('host creates room and auto-joins successfully', async ({ page }) => {
  test.setTimeout(5000);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Host Game' })).toBeVisible();
  await page.getByRole('button', { name: 'Host Game' }).click();
  await page.waitForTimeout(2000); // Wait for async room creation and navigation
  await page.waitForURL(/\/lobby\/.*/);

  // Verify navigation to lobby with roomId
  expect(page.url()).toMatch(/\/lobby\/[a-zA-Z0-9_-]+(\?.*)?$/);

  // Verify lobby header
  await expect(page.locator('h1')).toContainText('Lobby:');

  // Verify shareable URL section (part of initial state)
  await expect(page.getByTestId('shareable-url')).toBeVisible();

  // Verify host auto-joined (player list shows "Player")
  await expect(page.locator('h2')).toHaveText('Players:');
  await expect(page.locator('ul li')).toHaveText('Player');
});

// Mock clipboard for tests
test.beforeEach(async ({ page }) => {
  // Suppress act() warnings and specific console.logs in E2E
  await page.addInitScript(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('act(...)')) {
        return; // Suppress act warnings
      }
      originalError.apply(console, args);
    };

    const originalLog = console.log;
    console.log = (...args) => {
      // Suppress specific state change logs if needed, but allow others
      if (args[0] && typeof args[0] === 'string' && args[0].includes('State changed, players:')) {
        return;
      }
      originalLog.apply(console, args);
    };

    // Clipboard mock
    const originalReadText = navigator.clipboard.readText;
    const originalWriteText = navigator.clipboard.writeText;
    let clipboardData = '';
    
    Object.defineProperty(navigator.clipboard, 'readText', {
      value: () => Promise.resolve(clipboardData),
    });
    
    Object.defineProperty(navigator.clipboard, 'writeText', {
      value: (text: string) => {
        clipboardData = text;
        return Promise.resolve();
      },
    });
  });

  // Capture and log only non-suppressed console messages
  page.on('console', msg => {
    if (msg.type() !== 'error' || !msg.text().includes('act(...)')) {
      console.log(`${msg.type()}:`, msg.text());
    }
  });
});

test('displays maze rendering after game starts', async ({ browser, page }) => {
  test.setTimeout(15000);
  
  // Host creates room
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  await hostPage.goto('/');
  await hostPage.getByRole('button', { name: 'Host Game' }).click();
  await hostPage.waitForTimeout(2000);
  await hostPage.waitForURL(/\/lobby\/.*/);
  const roomId = hostPage.url().split('/lobby/')[1]?.split('?')[0] || '';

  // Guest joins to enable start button
  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto(`/lobby/${roomId}`);
  await guestPage.getByTestId('player-name-input').fill('Alice');
  await guestPage.getByTestId('join-button').click();
  await expect(hostPage.locator('ul li')).toHaveCount(2);

  // Verify button enabled
  await expect(hostPage.getByTestId('start-game-button')).toBeEnabled();

  // Host starts game
  await hostPage.getByTestId('start-game-button').click();

  // Wait for game start and maze rendering
  await hostPage.waitForURL(`/game/${roomId}`);
  await guestPage.waitForURL(`/game/${roomId}`);
  
  // Wait for gameState to load and Phaser to initialize
  await hostPage.waitForSelector('[data-testid="phaser-game"]', { timeout: 10000 });
  await guestPage.waitForSelector('[data-testid="phaser-game"]', { timeout: 10000 });
  
  // Verify Phaser canvas is visible on host page
  await expect(hostPage.getByLabel('Maze game canvas')).toBeVisible();
  
  // Verify on guest page too
  await expect(guestPage.getByLabel('Maze game canvas')).toBeVisible();

  await hostContext.close();
  await guestContext.close();
});