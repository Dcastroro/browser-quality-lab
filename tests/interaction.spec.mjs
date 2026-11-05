import {test, expect} from '@playwright/test';

test('pointer feedback clears on release and keyboard adds a check instantly', async ({page}) => {
  await page.goto('/');
  const input = page.getByLabel('Add a check');
  const button = page.getByRole('button', {name:'Add check'});
  await expect(page.getByText('Review checkout flow')).toBeVisible();
  await input.fill('Check interaction');
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(button).toHaveClass(/pointer-pressed/);
  await page.mouse.up();
  await expect(button).not.toHaveClass(/pointer-pressed/);
  await expect(page.getByRole('status')).toContainText('Added Check interaction.');
  await input.fill('Keyboard check'); await input.press('Enter');
  await expect(button).not.toHaveClass(/pointer-pressed/);
  await expect(page.getByRole('listitem').first()).toContainText('Keyboard check');
});

test('reduced motion removes pointer scaling', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/');
  const button = page.getByRole('button', {name:'Add check'});
  await button.dispatchEvent('pointerdown', {button:0});
  await expect(button).toHaveCSS('transform','none');
  await button.dispatchEvent('pointerup', {button:0});
});
