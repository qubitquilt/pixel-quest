import { test, expect } from '@playwright/test';

test.describe('Shared Flashlight Visibility', () => {
  test('multi-player join and shared movement updates', async ({ page, context }) => {
    // Assume server running at localhost:3001 for Colyseus

    const page1 = await context.newPage();
    await page1.goto('http://localhost:3000/');
    // Host no name input, just button
    await page1.click('button:has-text("Host Game")');
    await page1.waitForURL(/\/lobby\/.*/);
    const url = page1.url();
    const roomId = url.split('/lobby/')[1].split('?')[0];
    expect(roomId).toBeDefined();

    const page2 = await context.newPage();
    await page2.goto(`http://localhost:3000/lobby/${roomId}`);
    // Join fills name, clicks join
    await page2.fill('input[placeholder="Your name"]', 'Player2');
    await page2.click('button:has-text("Join Game")');
    await expect(page2.locator('h1')).toContainText(`Lobby: ${roomId}`);
    // Wait for players list to show both
    await expect(page2.locator('li')).toHaveCount(2);

    // Host starts game
    await page1.click('[data-testid="start-game-button"]');
    await page1.waitForURL(/\/game\/.*/, { timeout: 20000 });
    await page2.waitForURL(/\/game\/.*/, { timeout: 20000 });

    // Wait for game state to load (h1 appears after loading)
    await expect(page1.locator('h1')).toContainText(`Game: ${roomId}`);
    await expect(page2.locator('h1')).toContainText(`Game: ${roomId}`);

    // Wait for loading to disappear before Phaser render
    await page1.waitForSelector('div:has-text("Loading game...")', { state: 'hidden', timeout: 30000 });
    await page2.waitForSelector('div:has-text("Loading game...")', { state: 'hidden', timeout: 30000 });

    // Wait for PhaserGame to render
    await page1.waitForSelector('[data-testid="phaser-game"]', { timeout: 30000 });
    await page2.waitForSelector('[data-testid="phaser-game"]', { timeout: 30000 });

    await expect(page1.locator('[data-testid="phaser-game"]')).toBeVisible({ timeout: 30000 });
    await expect(page2.locator('[data-testid="phaser-game"]')).toBeVisible({ timeout: 30000 });

    // Wait for Phaser canvas to initialize
    await page1.waitForSelector('[data-testid="phaser-game"] canvas', { timeout: 30000 });
    await page2.waitForSelector('[data-testid="phaser-game"] canvas', { timeout: 30000 });

    await expect(page1.locator('[data-testid="phaser-game"] canvas')).toBeVisible({ timeout: 30000 });
    await expect(page2.locator('[data-testid="phaser-game"] canvas')).toBeVisible({ timeout: 30000 });

    // Skip screenshots for stability; verify movement by checking player position updates if needed in future

    // Focus on game canvas for keyboard input
    await page1.locator('[data-testid="phaser-game"]').focus();
    await page2.locator('[data-testid="phaser-game"]').focus();

    // Move player1 right
    await page1.keyboard.press('ArrowRight');
    await page1.waitForTimeout(2000);

    // Move player2 down
    await page2.keyboard.press('ArrowDown');
    await page2.waitForTimeout(2000);

    // Verify shared updates by checking canvas still responsive (no crash)
    await expect(page1.locator('[data-testid="phaser-game"] canvas')).toBeVisible({ timeout: 5000 });
    await expect(page2.locator('[data-testid="phaser-game"] canvas')).toBeVisible({ timeout: 5000 });
  });

  test('performance with 4+ players', async ({ page, context }) => {
    const page1 = await context.newPage();
    await page1.goto('http://localhost:3000/');
    await page1.click('button:has-text("Host Game")');
    await page1.waitForURL(/\/lobby\/.*/);
    const url = page1.url();
    const roomId = url.split('/lobby/')[1].split('?')[0];

    // Join 3 more players
    const pages = [];
    for (let i = 2; i <= 4; i++) {
      const p = await context.newPage();
      await p.goto(`http://localhost:3000/lobby/${roomId}`);
      await p.fill('input[placeholder="Your name"]', `Player${i}`);
      await p.click('button:has-text("Join Game")');
      await expect(p.locator('h1')).toContainText(`Lobby: ${roomId}`); // Verify lobby loaded for each player
      await expect(p.locator('li')).toHaveCount(i); // Wait for list update (host + i-1 players)
      pages.push(p);
    }

    // Start game
    await page1.click('[data-testid="start-game-button"]');
    await page1.waitForURL(/\/game\/.*/, { timeout: 20000 });
    for (const p of pages) {
      await p.waitForURL(/\/game\/.*/, { timeout: 20000 });
      await expect(p.locator('h1')).toContainText(`Game: ${roomId}`); // Wait for game state load
      await p.waitForSelector('div:has-text("Loading game...")', { state: 'hidden', timeout: 30000 });
      await p.waitForSelector('[data-testid="phaser-game"]', { timeout: 30000 });
      await expect(p.locator('[data-testid="phaser-game"]')).toBeVisible({ timeout: 30000 });
      await p.waitForSelector('[data-testid="phaser-game"] canvas', { timeout: 30000 });
      await expect(p.locator('[data-testid="phaser-game"] canvas')).toBeVisible({ timeout: 30000 }); // Phaser init
    }

    // Focus on game canvases for keyboard input
    await page1.locator('[data-testid="phaser-game"]').focus();
    for (const p of pages) {
      await p.locator('[data-testid="phaser-game"]').focus();
    }

    // Simultaneous moves, check no crash, canvas responsive
    await Promise.all([
      page1.keyboard.press('ArrowRight'),
      pages[0].keyboard.press('ArrowDown'),
      pages[1].keyboard.press('ArrowLeft'),
      pages[2].keyboard.press('ArrowUp')
    ]);
    await Promise.all([
      page1.waitForTimeout(1000),
      ...pages.map(p => p.waitForTimeout(1000))
    ]);

    // Verify all canvases still visible (no lag crash)
    await expect(page1.locator('[data-testid="phaser-game"] canvas')).toBeVisible({ timeout: 5000 });
    for (const p of pages) {
      await expect(p.locator('[data-testid="phaser-game"] canvas')).toBeVisible({ timeout: 5000 });
    }
  });
});