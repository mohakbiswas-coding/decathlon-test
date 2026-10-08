import { Locator, Page } from "@playwright/test";

export class HeaderLocators {
    readonly header: Locator;
    readonly searchField: Locator;
    readonly cartLink: Locator;

    constructor(page: Page) {
        this.header = page.locator("header").or(page.getByRole("banner")).first();
        this.searchField = page
            .getByPlaceholder(/search/i)
            .or(page.getByRole("searchbox"))
            .first();
        this.cartLink = page.getByRole("link", { name: /cart/i }).first();
    }
}
