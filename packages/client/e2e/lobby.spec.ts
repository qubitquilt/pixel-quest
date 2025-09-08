import { test, expect } from '@playwright/test';

test('displays shareable URL and copy functionality', async ({ page }) => {
  await page.goto('/lobby/testroom');

  // Wait for lobby to load and URL input to appear
  await expect(page.getByTestId('shareable-url')).toBeVisible();
  const urlInput = page.getByTestId('shareable-url');
  await expect(urlInput).toHaveValue('http://localhost:3000/lobby/testroom');

  // Click copy button
  const copyButton = page.getByRole('button', { name: 'Copy Link' });
  await copyButton.click();

  // Assert button text changes to Copied!
  await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
});