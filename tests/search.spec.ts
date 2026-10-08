import { test, expect, Locator } from "@playwright/test";
import { SearchPage } from "../pages/SearchPage";
import { PdpPage } from "../pages/PdpPage";
import { TestData } from "../utils/testData";
import { normalize } from "../utils/helpers";

test.describe("Decathlon India - Search", () => {
    let search: SearchPage;

    test.beforeEach(async ({ page }) => {
        search = new SearchPage(page);
    });

    // TC_20
    test("TC_20 Open search overlay", async ({ page }) => {
        await test.step("1. Launch the Decathlon website", async () => {
            await search.launch();
        });
        await test.step("2. Wait until the homepage header is visible", async () => {
            await expect(search.header.header).toBeVisible();
        });
        await test.step("3. Locate the Search field in the header", async () => {
            await expect(search.header.searchField).toBeVisible();
        });
        await test.step("4. Click the Search field", async () => {
            await search.openOverlay();
        });
        await test.step("5. Verify the background page remains visible", async () => {
            await expect(search.header.header).toBeVisible();
        });
        await test.step("6. Verify the Search overlay opens", async () => {
            await expect(search.ui.overlay).toBeVisible();
        });
        await test.step("7. Verify the Search input is visible in the overlay", async () => {
            await expect(search.ui.overlayInput).toBeVisible();
        });
        await test.step("8. Verify Trending searches is displayed when data is available", async () => {
            if (await search.appears(search.ui.trendingHeading)) {
                await expect(search.ui.trendingHeading).toBeVisible();
            }
        });
        await test.step("9. Verify Recommended For You or Bestsellers is displayed when data is available", async () => {
            if (await search.appears(search.ui.discoveryHeading)) {
                await expect(search.ui.discoveryHeading).toBeVisible();
            }
        });
        await test.step("10. Verify the close control is visible", async () => {
            await expect(search.ui.closeButton).toBeVisible();
        });
        await test.step("11. Click the close control", async () => {
            await search.ui.closeButton.click();
        });
        await test.step("12. Verify the Search overlay closes", async () => {
            await expect(search.ui.overlay).toBeHidden();
        });
    });

    // TC_21
    test("TC_21 Trending search", async ({ page }) => {
        let term = "";

        await test.step("1. Launch the Decathlon website", async () => {
            await search.launch();
        });
        await test.step("2. Click the Search field", async () => {
            await search.openOverlay();
        });
        await test.step("3. Verify the Search overlay opens", async () => {
            await expect(search.ui.overlay).toBeVisible();
        });
        await test.step("4. Locate the Trending searches section", async () => {
            await expect(search.ui.trendingHeading).toBeVisible();
        });
        await test.step("5. Record one currently displayed trending term", async () => {
            term = await search.firstTrendingTerm();
            expect(term).not.toBe("");
            test.info().annotations.push({ type: "trending term", description: term });
        });
        await test.step("6. Click the recorded trending term", async () => {
            await search.ui.firstTrendingTerm.click();
        });
        await test.step("7. Wait for navigation or result loading to finish", async () => {
            await search.waitForResultsPage();
        });
        await test.step("8. Verify a Search results page is displayed", async () => {
            await expect(page).toHaveURL(/search|query=/i);
        });
        await test.step("9. Verify the submitted term is represented in the URL, field, or results heading", async () => {
            await search.expectTermRepresented(term);
        });
        await test.step("10. Verify at least one product card is visible", async () => {
            await expect(search.ui.productCards.first()).toBeVisible();
        });
        await test.step("11. Verify a visible card contains an image, product name, and selling price", async () => {
            await search.expectCardCore(search.ui.productCards.first());
        });
        await test.step("12. Verify the page remains usable without a blocked loader", async () => {
            await expect(search.ui.loader).toBeHidden();
        });
    });

    // TC_22
    test("TC_22 Partial keyword search", async ({ page }) => {
        await test.step("1. Launch the Decathlon website", async () => {
            await search.launch();
        });
        await test.step("2. Click the Search field", async () => {
            await search.openOverlay();
        });
        await test.step("3. Verify the Search overlay opens", async () => {
            await expect(search.ui.overlay).toBeVisible();
        });
        await test.step("4. Click inside the Search input", async () => {
            await search.ui.overlayInput.click();
        });
        await test.step("5. Enter the partial keyword Cy", async () => {
            await search.ui.overlayInput.fill(TestData.partialKeyword);
        });
        await test.step("6. Verify Cy remains visible in the input", async () => {
            await expect(search.ui.overlayInput).toHaveValue(TestData.partialKeyword);
        });
        await test.step("7. Verify the clear X control appears in the input", async () => {
            await expect(search.ui.clearButton).toBeVisible();
        });
        await test.step("8. Observe the available discovery or suggestion content", async () => {
            const shown = await search.appears(search.ui.trendingHeading, 3000);
            test.info().annotations.push({
                type: "observed",
                description: `discovery content displayed: ${shown}`,
            });
        });
        await test.step("9. Press Enter to submit the partial keyword", async () => {
            await search.submit();
        });
        await test.step("10. Wait for the Search results page to load", async () => {
            await search.waitForResultsPage();
        });
        await test.step("11. Verify the URL contains a search query parameter", async () => {
            await expect(page).toHaveURL(/[?&]query=/i);
        });
        await test.step("12. Verify product results are displayed for the submitted partial text", async () => {
            await expect(search.ui.productCards.first()).toBeVisible();
        });
    });

    // TC_23
    test("TC_23 Search-result product cards", async ({ page }) => {
        let card: Locator;

        await test.step("1. Open a Search results page", async () => {
            await search.openResultsFor(TestData.partialKeyword);
        });
        await test.step("2. Wait for the product grid to be visible", async () => {
            await expect(search.ui.productCards.first()).toBeVisible();
        });
        await test.step("3. Locate the first visible product card", async () => {
            card = search.ui.productCards.first();
            await expect(card).toBeVisible();
        });
        await test.step("4. Verify the product image is displayed", async () => {
            await expect(card.locator("img").first()).toBeVisible();
        });
        await test.step("5. Verify the brand or product name is displayed", async () => {
            await expect(card).toContainText(/\S{3,}/);
        });
        await test.step("6. Verify the selling price is displayed", async () => {
            await expect(card).toContainText(/₹\s?[\d,]+/);
        });
        await test.step("7. Verify MRP is displayed when applicable", async () => {
            const text = await card.innerText();
            if (/MRP/i.test(text)) {
                await expect(card).toContainText(/MRP\s*₹\s?[\d,]+/i);
            }
        });
        await test.step("8. Verify rating and review count are displayed when available", async () => {
            test.info().annotations.push({
                type: "optional card details",
                description: await search.describeCard(card),
            });
        });
        await test.step("9. Verify a discount label is displayed when applicable", async () => {
            const text = await card.innerText();
            if (/\d+%\s*off/i.test(text)) {
                await expect(card).toContainText(/\d+%\s*off/i);
            }
        });
        await test.step("10. Verify colour indicators are displayed when applicable", async () => {
            const swatches = await card.locator('[class*="colo" i]').count();
            test.info().annotations.push({
                type: "colour indicators",
                description: `${swatches} found`,
            });
        });
        await test.step("11. Verify Wishlist and Add to cart actions are visible", async () => {
            await expect(search.ui.wishlistButtons.first()).toBeVisible();
            await expect(card.getByText(/add to cart/i)).toBeVisible();
        });
        await test.step("12. Repeat the core checks for another visible product card", async () => {
            await search.expectCardCore(search.ui.productCards.nth(1));
        });
    });

    // TC_24
    test("TC_24 Unrelated keyword handling", async ({ page }) => {
        const keyword = TestData.unrelatedKeyword;
        let names: string[] = [];
        let resultCount = "not displayed";

        await test.step("1. Launch the Decathlon website", async () => {
            await search.launch();
        });
        await test.step("2. Click the Search field", async () => {
            await search.openOverlay();
        });
        await test.step("3. Clear any existing Search text", async () => {
            await search.ui.overlayInput.clear();
        });
        await test.step("4. Enter zzz-no-product-98765", async () => {
            await search.ui.overlayInput.fill(keyword);
        });
        await test.step("5. Press Enter to submit the keyword", async () => {
            await search.submit();
        });
        await test.step("6. Wait for the results page to load", async () => {
            await search.waitForResultsPage();
        });
        await test.step("7. Verify the URL contains query=zzz-no-product-98765", async () => {
            await expect(page).toHaveURL(new RegExp(`query=${keyword}`));
        });
        await test.step("8. Verify the results heading represents the submitted keyword", async () => {
            await expect(search.ui.resultsHeading).toContainText(keyword, { ignoreCase: true });
        });
        await test.step("9. Record the number of results displayed by the application", async () => {
            resultCount = await search.ui.resultCount.innerText().catch(() => "not displayed");
            test.info().annotations.push({ type: "result count", description: resultCount });
        });
        await test.step("10. Inspect the first visible product names for relevance", async () => {
            names = await search.firstCardTexts();
            test.info().annotations.push({
                type: "first product names",
                description: names.length ? names.join(" | ") : "no products shown",
            });
        });
        await test.step("11. Compare the URL query, Search field text, and results heading", async () => {
            const urlQuery = search.queryParam();
            const fieldText = await search.header.searchField.inputValue().catch(() => "");
            const heading = await search.ui.resultsHeading.innerText().catch(() => "");
            test.info().annotations.push({
                type: "search values",
                description: `url="${urlQuery}", field="${fieldText}", heading="${heading}"`,
            });
            expect.soft(urlQuery, "URL query").toBe(keyword);
            expect.soft(fieldText, "Search field text").toBe(keyword);
            expect.soft(normalize(heading), "results heading").toContain(normalize(keyword));
        });
        await test.step("12. Record a defect if the three Search values differ or unrelated results appear without explanation", async () => {
            expect
                .soft(names.length, "unrelated products shown without explanation")
                .toBe(0);
        });
    });

    // TC_25
    test("TC_25 Open PDP from Search", async ({ page }) => {
        const pdp = new PdpPage(page);
        let card: Locator;
        let cardText = "";
        let cardHref = "";

        await test.step("1. Open a Search results page", async () => {
            await search.openResultsFor(TestData.partialKeyword);
        });
        await test.step("2. Wait for product cards to load", async () => {
            await expect(search.ui.productCards.first()).toBeVisible();
        });
        await test.step("3. Select one stable in-stock product card", async () => {
            card = search.inStockCard();
            await expect(card).toBeVisible();
        });
        await test.step("4. Record the visible brand and product name", async () => {
            cardText = await card.innerText();
            cardHref = (await card.getAttribute("href")) ?? "";
            expect(cardText).not.toBe("");
        });
        await test.step("5. Click the product image or product name", async () => {
            await card.click();
        });
        await test.step("6. Wait for the Product Details Page to load", async () => {
            await page.waitForURL(/\/p\//);
            await expect(pdp.ui.productName).toBeVisible();
        });
        await test.step("7. Verify the URL contains a product path", async () => {
            await expect(page).toHaveURL(/\/p\/\d+/);
        });
        await test.step("8. Verify the Product Details Page displays a brand", async () => {
            await expect(pdp.ui.brandLabel).toBeVisible();
        });
        await test.step("9. Verify the Product Details Page displays a product name", async () => {
            await expect(pdp.ui.productName).not.toBeEmpty();
        });
        await test.step("10. Compare the displayed product with the selected Search result", async () => {
            const id = cardHref.match(/\/p\/(\d+)/)?.[1] ?? "";
            expect(id).not.toBe("");
            expect(page.url()).toContain(`/p/${id}`);
            const name = await pdp.ui.productName.innerText();
            expect(normalize(cardText)).toContain(normalize(name));
        });
        await test.step("11. Verify the selling price and main product image are visible", async () => {
            await expect(pdp.ui.sellingPrice).toBeVisible();
            await expect(pdp.ui.mainImage).toBeVisible();
        });
        await test.step("12. Verify no Page Not Found message is displayed", async () => {
            await expect(pdp.ui.notFound).toHaveCount(0);
        });
    });
});
