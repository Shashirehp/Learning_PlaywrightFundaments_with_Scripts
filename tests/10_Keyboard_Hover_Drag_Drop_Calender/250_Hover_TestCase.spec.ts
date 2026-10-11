import { test, expect, Locator } from '@playwright/test';

test('Verify Hover for Drag and Drop', async ({ page }) => {
   await page.goto('https://app.thetestingacademy.com/playwright/widgets/dnd');

   const columnA = page.locator('#column-a');
   const columnB = page.locator('#column-b');

   await columnA.dragTo(columnB, { force:  true});

   await page.pause();
});
