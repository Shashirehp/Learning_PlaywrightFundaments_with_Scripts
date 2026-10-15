import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { Inventorypage } from './pages/InventoryPage';
import { Cartpage } from './pages/CartPage';
import { shot } from '../../utils/stepScreenshot';

test('add first item to cart and verify it in the cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new Inventorypage(page);
    const cartPage = new Cartpage(page);
    let itemName = '';

    await test.step('open the login page', async () => {
        await loginPage.goto();
        await shot(page, 0, 'login page');
    });

    await test.step('login as standard_user', async () => {
        await loginPage.login('standard_user', 'tta_secret');
        await expect(inventoryPage.title).toHaveText('Products');
        await shot(page, 1, 'inventory');
    });

    await test.step('add the first item to the cart', async () => {
        itemName = await inventoryPage.addFirstItemToCart();
        await shot(page, 2, 'item added');
    });

    await test.step('open the cart', async () => {
        await inventoryPage.openCart();
        await expect(cartPage.title).toHaveText('Your Cart');
        await shot(page, 3, 'cart');
    });

    await test.step('verify the item is in the cart', async () => {
        await expect(cartPage.itemName).toHaveText(itemName);
        await expect(cartPage.checkout).toBeVisible();
        await shot(page, 4, 'verified');
    });
});
