import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { HeaderLocators } from "../ui-store/HeaderLocators";
import { SearchLocators } from "../ui-store/SearchLocators";

export class SearchPage extends BasePage {
    readonly header: HeaderLocators;
    readonly ui: SearchLocators;

    constructor(page: Page) {
        super(page);
        this.header = new HeaderLocators(page);
        this.ui = new SearchLocators(page);
    }

    async launch() {
        await this.goto("/");
    }

    async openOverlay() {
        await this.header.searchField.click();
    }

    async typeKeyword(text: string) {
        await this.ui.overlayInput.click();
        await this.ui.overlayInput.fill(text);
    }

    async submit() {
        await this.ui.overlayInput.press("Enter");
    }

    async waitForResultsPage() {
        await this.page.waitForURL(/search|query=/i);
        await this.page.waitForLoadState("domcontentloaded");
    }

    // precondition shared by TC_23 and TC_25
    async openResultsFor(keyword: string) {
        await this.launch();
        await this.openOverlay();
        await this.typeKeyword(keyword);
        await this.submit();
        await this.waitForResultsPage();
        await expect(this.ui.productCards.first()).toBeVisible();
    }

    async firstTrendingTerm(): Promise<string> {
        return (await this.ui.firstTrendingTerm.innerText()).trim();
    }

    // stable in-stock card: the first one that is not marked out of stock
    inStockCard(): Locator {
        return this.ui.productCards.filter({ hasNotText: /out of stock|sold out/i }).first();
    }

    // image, name and selling price of a card
    async expectCardCore(card: Locator) {
        await expect(card.locator("img").first()).toBeVisible();
        await expect(card).toContainText(/\S{3,}/);
        await expect(card).toContainText(/₹\s?[\d,]+/);
    }

    // optional card details: recorded, not asserted ("when applicable")
    async describeCard(card: Locator): Promise<string> {
        const text = await card.innerText();
        const has = (re: RegExp) => (re.test(text) ? "yes" : "no");
        return [
            `MRP: ${has(/MRP/i)}`,
            `discount: ${has(/\d+%\s*off/i)}`,
            `rating: ${has(/\b\d(\.\d)?\b/)}`,
        ].join(", ");
    }

    // the submitted term shows up in the URL, the field or the results heading
    async expectTermRepresented(term: string) {
        const wanted = term.toLowerCase();
        await expect
            .poll(
                async () => {
                    const url = decodeURIComponent(this.page.url()).toLowerCase().replace(/\+/g, " ");
                    const field = (await this.header.searchField.inputValue().catch(() => "")).toLowerCase();
                    const heading = (await this.ui.resultsHeading.innerText().catch(() => "")).toLowerCase();
                    return url.includes(wanted) || field.includes(wanted) || heading.includes(wanted);
                },
                { message: `"${term}" is shown in the URL, field or heading` }
            )
            .toBe(true);
    }

    queryParam(): string | null {
        return new URL(this.page.url()).searchParams.get("query");
    }

    async firstCardTexts(limit = 5): Promise<string[]> {
        return this.ui.productCards.evaluateAll(
            (els, n) => els.slice(0, n).map((e) => (e.textContent ?? "").replace(/\s+/g, " ").trim()),
            limit
        );
    }
}
