import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { CartLocators } from "../ui-store/CartLocators";

export class CartPage extends BasePage {
    readonly ui: CartLocators;

    constructor(page: Page) {
        super(page);
        this.ui = new CartLocators(page);
    }

    async waitForCart() {
        await this.page.waitForURL(/checkout\/cart/);
    }

    // number of different products in the cart (image and name links share an href)
    async uniqueItemCount(): Promise<number> {
        return this.ui.itemLinks.evaluateAll(
            (els) => new Set(els.map((e) => e.getAttribute("href"))).size
        );
    }
}
