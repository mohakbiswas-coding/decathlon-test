import { Page, Locator } from "@playwright/test";

export abstract class BasePage {
    constructor(protected readonly page: Page) {}

    async goto(path: string) {
        await this.page.goto(path);
    }

    async scrollTo(locator: Locator) {
        await locator.scrollIntoViewIfNeeded();
    }

    // true when the locator becomes visible in time: used for the
    // "when data is available / applicable" checks in the test cases
    async appears(locator: Locator, timeout = 5000): Promise<boolean> {
        try {
            await locator.first().waitFor({ state: "visible", timeout });
            return true;
        } catch {
            return false;
        }
    }
}
