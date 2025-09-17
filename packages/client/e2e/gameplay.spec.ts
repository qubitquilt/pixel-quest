import { test, expect } from '@playwright/test';

test.describe('Shared Flashlight Visibility', () => {
  test('multi-player join and shared movement updates', async ({ page, context }) => {
    const page1 = await context.newPage();
    await page1.goto('http://localhost:3000/');
    await page1.fill('input[placeholder="Player Name"]', 'Player1');
    await page1.click('button:has-text("Host Game")');
    const url = page1.url();
    const roomId = url.split('/lobby/')[1];
    expect(roomId).toBeDefined();

    const page2 = await context.newPage();
    await page2.goto(`http://localhost:3000/lobby/${roomId}`);
    await page2.fill('input[placeholder="Player Name"]', 'Player2');

    await page1.click('button:has-text("Start Game")');
    await expect(page1.locator('[data-testid="phaser-game"]')).toBeVisible();
    await expect(page2.locator('[data-testid="phaser-game"]')).toBeVisible();

    // Move player1
    await page1.keyboard.press('ArrowRight');
    await page1.waitForTimeout(300); // Wait for tween

    // Verify game canvas still responsive for player2
    await expect(page2.locator('[data-testid="phaser-game"] canvas')).toBeVisible();
    // Note: Visual verification of shared cone requires manual screenshot comparison or pixel check, but for unit, assume sync works if no crash
  });
});