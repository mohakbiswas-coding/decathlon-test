import { Locator, Page } from "@playwright/test";

export class CartLocators {
    readonly itemLinks: Locator;
    readonly itemImage: Locator;
    readonly itemName: Locator;
    readonly quantity: Locator;
    readonly totalRow: Locator;
    readonly loginToProceed: Locator;

    constructor(private readonly page: Page) {
        // every cart item links back to /p/<id>/<slug>
        this.itemLinks = page.locator('a[href*="/p/"]');
        this.itemImage = page.locator('img[src*="mediadecathlon"]').first();
        this.itemName = page.getByRole("link", { name: /kiprun/i }).first();
        this.quantity = page.getByText(/\b(qty|quantity)\b/i).first();
        this.totalRow = page.getByText(/^total/i).first().locator("xpath=..");
        this.loginToProceed = page
            .getByRole("button", { name: /login to proceed/i })
            .or(page.getByRole("link", { name: /login to proceed/i }))
            .first();
    }

    // amounts and the chosen size, matched by their visible text
    amount(value: string): Locator {
        return this.page.getByText(value).first();
    }

    selectedSize(size: string): Locator {
        return this.page
            .getByText(new RegExp(`size[^\\d]*${size.replace(".", "\\.")}`, "i"))
            .first();
    }
}
