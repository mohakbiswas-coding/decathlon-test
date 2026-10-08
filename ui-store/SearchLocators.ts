import { Locator, Page } from "@playwright/test";

export class SearchLocators {
    // search overlay
    readonly overlay: Locator;
    readonly overlayInput: Locator;
    readonly clearButton: Locator;
    readonly closeButton: Locator;
    readonly trendingHeading: Locator;
    readonly firstTrendingTerm: Locator;
    readonly discoveryHeading: Locator;

    // search results page
    readonly resultsHeading: Locator;
    readonly resultCount: Locator;
    readonly productCards: Locator;
    readonly wishlistButtons: Locator;
    readonly loader: Locator;

    constructor(page: Page) {
        this.overlay = page.getByRole("dialog").first();
        this.overlayInput = page
            .locator('input[type="search"], input[placeholder*="search" i]')
            .last();
        this.clearButton = page.getByRole("button", { name: /clear/i }).first();
        this.closeButton = page.getByRole("button", { name: /close|cancel/i }).first();
        this.trendingHeading = page.getByText(/trending searches/i).first();
        this.firstTrendingTerm = this.trendingHeading
            .locator("xpath=following::*[self::a or self::button][1]");
        this.discoveryHeading = page.getByText(/recommended for you|bestsellers/i).first();

        this.resultsHeading = page.getByRole("heading", { level: 1 }).first();
        this.resultCount = page.getByText(/\d+\s+items?/i).first();
        // each product card is a link to /p/<id>/<slug>
        this.productCards = page.locator('a[href*="/p/"]');
        this.wishlistButtons = page.getByRole("button", { name: /wishlist/i });
        this.loader = page
            .locator('[class*="loader" i], [class*="spinner" i], [role="progressbar"]')
            .first();
    }
}
