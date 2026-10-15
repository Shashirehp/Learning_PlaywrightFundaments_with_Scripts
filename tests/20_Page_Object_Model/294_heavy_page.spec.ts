import { test, expect } from '@playwright/test';
import { HeavyPage } from './pages/HeavyPage';
import { LoginPage } from './pages/LoginPage';

test('a 100-locator page object costs nothing to build', async ({ page }) => {
    const start = Date.now();
    const heavy = new HeavyPage(page);
    const buildMs = Date.now() - start;

    // Locators are per-instance: built in the constructor, one set per object.
    // Methods are on the prototype: declared once, shared by every instance.
    const methods = Object.getOwnPropertyNames(HeavyPage.prototype)
        .filter(m => m !== 'constructor');

    console.log(`built ${heavy.allLocators().length} locators in ${buildMs}ms`);
    console.log(`${methods.length} methods on the prototype, shared by all instances`);

    expect(heavy.allLocators()).toHaveLength(100);
    expect(methods.length).toBeGreaterThanOrEqual(110);
    expect(buildMs).toBeLessThan(100);

    // A second instance re-creates the 100 locators but adds no methods.
    const another = new HeavyPage(page);
    expect(Object.getOwnPropertyNames(HeavyPage.prototype).length)
        .toBe(methods.length + 1);   // +1 for constructor
    expect(another.allLocators()).toHaveLength(100);

    // Only acting on a locator reaches the DOM. The other 99 cost nothing.
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'tta_secret');

    await expect(heavy.title).toHaveText('Products');
    expect(await heavy.isTitleVisible()).toBe(true);   // locator-backed method
    expect(heavy.getUrl()).toContain('inventory');     // page-level method
});
