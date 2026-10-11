
import { test, expect } from '@playwright/test';

test('Verify Make Appointment page is loaded', async ({ page }) => {

    await page.goto('https://katalon-demo-cura.herokuapp.com/');

    await page.locator('#btn-make-appointment').click();

    await page.locator('#txt-username').fill('John Doe');
    await page.locator('#txt-password').fill('ThisIsNotAPassword');

    await page.locator('#btn-login').click();

    await expect(page.getByRole('heading', { name: 'Make Appointment' })).toBeVisible();

});

/* for full screen view

import { test, expect } from '@playwright/test';

test('Verify Make Appointment page is loaded', async ({ browser }) => {

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    await page.goto('https://katalon-demo-cura.herokuapp.com/');

    await page.locator('#btn-make-appointment').click();
    await page.locator('#txt-username').fill('John Doe');
    await page.locator('#txt-password').fill('ThisIsNotAPassword');
    await page.locator('#btn-login').click();

    // Assertion
    await expect(page.getByRole('heading', { name: 'Make Appointment' })).toBeVisible();

    console.log('Make Appointment page is loaded successfully');

    await context.close();
});*/