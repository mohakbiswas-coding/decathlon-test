import { test, expect } from "@playwright/test";
import { PdpPage } from "../pages/PdpPage";
import { CartPage } from "../pages/CartPage";
import { TestData } from "../utils/testData";
import { normalize } from "../utils/helpers";

test.describe("Decathlon India - Add to cart and cart", () => {
    let pdp: PdpPage;
    let cart: CartPage;

    test.beforeEach(async ({ page }) => {
        pdp = new PdpPage(page);
        cart = new CartPage(page);
    });

    // TC_28
    test("TC_28 Verify size selection is mandatory for a size-based product", async ({ page }) => {
        let badgeBefore = 0;

        await test.step("1. Open a valid size-based Product Details Page", async () => {
            await pdp.open(TestData.product.id);
        });
        await test.step("2. Wait for the Select size section to be visible", async () => {
            await expect(pdp.ui.sizeLabel).toBeVisible();
        });
        await test.step("3. Verify no size has the selected highlight", async () => {
            expect(await pdp.highlightedSizeCount()).toBe(0);
        });
        await test.step("4. Verify the Add to cart button is visible", async () => {
            await expect(pdp.ui.addToCart).toBeVisible();
        });
        await test.step("5. Record the current Cart badge count if displayed", async () => {
            badgeBefore = await pdp.cartCount();
        });
        await test.step("6. Click Add to cart without selecting a size", async () => {
            await pdp.clickAddToCart();
        });
        await test.step("7. Verify the red message Please select a size appears", async () => {
            await expect(pdp.ui.sizeError).toBeVisible();
            await expect(pdp.ui.sizeError).toContainText(TestData.messages.sizeRequired);
            await expect
                .soft(pdp.ui.sizeError, "message colour is red")
                .toHaveCSS("color", /rgb\((1[5-9]\d|2\d\d), \d{1,2}, \d{1,2}\)/);
        });
        await test.step("8. Verify size options remain available", async () => {
            await expect(pdp.ui.sizeOptions.first()).toBeVisible();
        });
        await test.step("9. Verify the button continues to show Add to cart", async () => {
            await expect(pdp.ui.addToCart).toBeVisible();
        });
        await test.step("10. Verify no size is automatically selected", async () => {
            expect(await pdp.highlightedSizeCount()).toBe(0);
        });
        await test.step("11. Verify the Cart badge does not increase", async () => {
            await expect.poll(() => pdp.cartCount()).toBe(badgeBefore);
        });
        await test.step("12. Verify the shopper remains on the Product Details Page", async () => {
            await expect(page).toHaveURL(/\/p\//);
        });
    });

    // TC_29
    test("TC_29 Successful Add to Cart", async () => {
        const { size } = TestData.product;
        let badgeBefore = 0;

        await test.step("1. Open a valid in-stock Product Details Page", async () => {
            await pdp.open(TestData.product.id);
        });
        await test.step("2. Wait for the size options and Add to cart button", async () => {
            await expect(pdp.ui.sizeOptions.first()).toBeVisible();
            await expect(pdp.ui.addToCart).toBeVisible();
        });
        await test.step("3. Record the current Cart badge count", async () => {
            badgeBefore = await pdp.cartCount();
        });
        await test.step("4. Select available size 6.5", async () => {
            await pdp.selectSize(size);
        });
        await test.step("5. Verify size 6.5 receives the selected highlight", async () => {
            await expect.poll(() => pdp.isHighlighted(pdp.ui.size(size))).toBe(true);
        });
        await test.step("6. Verify the low-stock label 3 left is displayed for the selected size when present", async () => {
            if (await pdp.appears(pdp.ui.lowStock, 3000)) {
                await expect(pdp.ui.lowStock).toContainText(/\d+\s+left/i);
            }
        });
        await test.step("7. Click Add to cart", async () => {
            await pdp.clickAddToCart();
        });
        await test.step("8. Wait for the add operation to complete", async () => {
            await expect(pdp.ui.goToCart).toBeVisible();
        });
        await test.step("9. Verify Add to cart changes to Go to cart", async () => {
            await expect(pdp.ui.goToCart).toBeVisible();
            await expect(pdp.ui.addToCart).toBeHidden();
        });
        await test.step("10. Verify the Cart badge increases by one from the recorded value", async () => {
            await expect.poll(() => pdp.cartCount()).toBe(badgeBefore + 1);
        });
        await test.step("11. Verify the selected size remains highlighted", async () => {
            expect(await pdp.isHighlighted(pdp.ui.size(size))).toBe(true);
        });
        await test.step("12. Verify no size-validation message is displayed", async () => {
            await expect(pdp.ui.sizeError).toBeHidden();
        });
    });

    // TC_30
    test("TC_30 Cart item verification", async ({ page }) => {
        const { size } = TestData.product;
        const expected = TestData.cart;
        let pdpName = "";

        // precondition: the product is already added with size 6.5
        await test.step("Precondition: product 8873071 added to cart with size 6.5", async () => {
            await pdp.addProductToCart(TestData.product.id, size);
            pdpName = await pdp.ui.productName.innerText();
        });

        await test.step("1. Click Go to cart or the Cart icon", async () => {
            await pdp.ui.goToCart.click();
        });
        await test.step("2. Wait for the Cart Items page to load", async () => {
            await cart.waitForCart();
            await expect(page).toHaveURL(/checkout\/cart/);
        });
        await test.step("3. Verify one expected KIPRUN cart item is displayed", async () => {
            expect(await cart.uniqueItemCount()).toBe(1);
            await expect(cart.ui.itemName).toBeVisible();
        });
        await test.step("4. Verify the product image is displayed", async () => {
            await expect(cart.ui.itemImage).toBeVisible();
        });
        await test.step("5. Verify the product name matches the selected PDP product", async () => {
            const cartName = normalize(await cart.ui.itemName.innerText());
            expect(cartName).toContain(normalize(pdpName).slice(0, 25));
        });
        await test.step("6. Verify the selected size in Cart matches the chosen size", async () => {
            await expect(cart.ui.selectedSize(size)).toBeVisible();
        });
        await test.step("7. Verify quantity is 1 for the newly added item", async () => {
            await expect(cart.ui.quantity.locator("xpath=..")).toContainText(expected.quantity);
        });
        await test.step("8. Verify selling price is ₹4,999 for the captured test product", async () => {
            await expect(cart.ui.amount(expected.sellingPrice)).toBeVisible();
        });
        await test.step("9. Verify MRP is ₹6,499 for the captured test product", async () => {
            await expect(cart.ui.amount(expected.mrp)).toBeVisible();
        });
        await test.step("10. Verify the order summary shows a ₹1,500 discount", async () => {
            await expect(cart.ui.amount(expected.discount)).toBeVisible();
        });
        await test.step("11. Verify the total is ₹4,999 for quantity 1", async () => {
            await expect(cart.ui.totalRow).toContainText(expected.total);
        });
        await test.step("12. Verify guest users see Login to Proceed", async () => {
            await expect(cart.ui.loginToProceed).toBeVisible();
        });
    });
});
