import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { HeaderLocators } from "../ui-store/HeaderLocators";
import { PdpLocators } from "../ui-store/PdpLocators";

export class PdpPage extends BasePage {
    readonly header: HeaderLocators;
    readonly ui: PdpLocators;

    constructor(page: Page) {
        super(page);
        this.header = new HeaderLocators(page);
        this.ui = new PdpLocators(page);
    }

    async open(productId: string) {
        await this.goto(`/p/${productId}`);
        await expect(this.ui.productName).toBeVisible();
    }

    async selectSize(size: string) {
        await this.ui.size(size).click();
    }

    async clickAddToCart() {
        await this.ui.addToCart.click();
    }

    // reads the number shown on the Cart link (0 when there is no badge)
    async cartCount(): Promise<number> {
        const text = (await this.header.cartLink.innerText()).replace(/\s+/g, " ");
        const match = text.match(/\d+/);
        return match ? Number(match[0]) : 0;
    }

    // true when the element (or a parent control) carries a selected state
    async isHighlighted(element: Locator): Promise<boolean> {
        return element.evaluate((node) => {
            const selected = (n: Element) =>
                n.getAttribute("aria-pressed") === "true" ||
                n.getAttribute("aria-checked") === "true" ||
                n.getAttribute("aria-selected") === "true" ||
                /(^|[\s_-])(selected|active|checked)([\s_-]|$)/i.test(n.getAttribute("class") ?? "");
            return (
                selected(node) ||
                !!node.closest("[aria-pressed='true'],[aria-checked='true'],[aria-selected='true']") ||
                !!node.querySelector("input:checked")
            );
        });
    }

    async highlightedSizeCount(): Promise<number> {
        const total = await this.ui.sizeOptions.count();
        let highlighted = 0;
        for (let i = 0; i < total; i++) {
            if (await this.isHighlighted(this.ui.sizeOptions.nth(i))) highlighted++;
        }
        return highlighted;
    }

    // some colour thumbnail (or its link/button) carries the selected state
    async hasHighlightedColour(): Promise<boolean> {
        const total = await this.ui.colourThumbnails.count();
        for (let i = 0; i < total; i++) {
            const holder = this.ui.colourThumbnails
                .nth(i)
                .locator("xpath=ancestor-or-self::*[self::a or self::button or self::li][1]");
            if (await this.isHighlighted(holder)) return true;
        }
        return false;
    }

    async openDrawer(trigger: Locator) {
        await this.scrollTo(trigger);
        await trigger.click();
    }

    async closeDrawer() {
        await this.ui.drawerClose.click();
    }

    async enterPincode(pincode: string) {
        await this.ui.pincodeInput.clear();
        await this.ui.pincodeInput.fill(pincode);
        await this.ui.pincodeSubmit.click();
    }

    // precondition of TC_30: a product with a size is already in the cart
    async addProductToCart(productId: string, size: string) {
        await this.open(productId);
        await this.selectSize(size);
        await this.clickAddToCart();
        await expect(this.ui.goToCart).toBeVisible();
    }
}
