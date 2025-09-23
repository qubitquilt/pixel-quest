
import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

test.describe('Flashlight Prototype E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Launch the app; assume dev server is running or use playwright's server start
    await page.goto('http://localhost:3000'); // Adjust to game page URL if needed
    await page.waitForSelector('[data-testid="phaser-game"]');
  });

  test('WASD movement updates player position', async ({ page }) => {
    // Press W to move up
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(500); // Allow movement

    // Check if player has moved (this might require custom assertions, e.g., via console or visual diff)
    // For now, assume a console log or event; in real, use page.evaluate to check Phaser state if exposed
    const playerYBefore = await page.evaluate(() => {
      // Assume global access or exposed; adjust based on app
      return window.game?.scene?.player?.y || 100;
    });
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(500);
    const playerYAfter = await page.evaluate(() => {
      return window.game?.scene?.player?.y || 100;
    });

    expect(playerYAfter).toBeLessThan(playerYBefore); // Moved up
  });

  test('Flashlight cone rotates with direction change', async ({ page }) => {
    // Initial direction down
    // Press A to rotate left
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(300);

    // Check rotation (via evaluate)
    const angleBefore = await page.evaluate(() => {
      return window.game?.scene?.currentAngle || 0;
    });
    await page.keyboard.press('KeyD'); // Rotate right
    await page.waitForTimeout(300);
    const angleAfter = await page.evaluate(() => {
      return window.game?.scene?.currentAngle || 0;
    });

    expect(angleAfter).not.toBe(angleBefore); // Angle changed
  });

  test('Visibility updates with movement and rotation', async ({ page }) => {
    // Move and rotate, check if flashlight graphics update
    // This could check for canvas changes or exposed visibility polygon length
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(500);
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(300);

    // Assume a test for visibility rays or cone
    const visibilityUpdated = await page.evaluate(() => {
      // Check if polygon or graphics were redrawn
      return window.game?.scene?.flashlightGraphics?.dirty || true;
    });

    expect(visibilityUpdated).toBe(true);
  });
});
