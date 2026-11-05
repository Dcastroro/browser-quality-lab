import { test, expect } from '@playwright/test';

test('loads checks and filters completed work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name:'Quality checks'})).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await page.getByLabel('Filter').selectOption('done');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toContainText('Verify mobile navigation');
});

test('adds text safely using keyboard navigation', async ({ page }) => {
  await page.goto('/');
  const input = page.getByLabel('Add a check');
  await input.focus(); await page.keyboard.type('<b>Review accessibility</b>'); await page.keyboard.press('Enter');
  await expect(page.getByRole('listitem').first()).toContainText('<b>Review accessibility</b>');
  await expect(page.locator('#checks b')).toHaveCount(0);
});

test('shows recovery action when the API fails, then retries', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/checks.json', async route => {
    calls++;
    if (calls === 1) await route.fulfill({ status: 503, body: 'unavailable' });
    else await route.fulfill({ json: [{id: 7, title: 'Recovered check', status: 'open'}] });
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('Could not load checks. Please try again.');
  await page.getByRole('button', {name:'Try again'}).click();
  await expect(page.getByRole('listitem')).toHaveText('Recovered checkOpen');
  expect(calls).toBe(2);
});

test('provides an explicit empty state', async ({ page }) => {
  await page.route('**/api/checks.json', route => route.fulfill({json: []}));
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('No checks match this filter.');
});
