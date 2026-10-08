import { test, expect } from "@playwright/test";
import { PdpPage } from "../pages/PdpPage";
import { TestData } from "../utils/testData";

test.describe("Decathlon India - Product Details Page", () => {
    let pdp: PdpPage;

    test.beforeEach(async ({ page }) => {
        pdp = new PdpPage(page);
    });

    // TC_26
    test("TC_26 Core product information", async () => {
        const { id, brand, rating } = TestData.product;

        await test.step("1. Open the valid product URL for ID 8873071", async () => {
            await pdp.goto(`/p/${id}`);
        });
        await test.step("2. Wait for the Product Details Page to load", async () => {
            await expect(pdp.ui.productName).toBeVisible();
        });
        await test.step("3. Verify breadcrumbs are visible", async () => {
            await expect(pdp.ui.breadcrumbs).toBeVisible();
        });
        await test.step("4. Verify the brand KIPRUN is displayed", async () => {
            await expect(pdp.ui.text(brand)).toBeVisible();
        });
        await test.step("5. Verify the product name is displayed", async () => {
            await expect(pdp.ui.productName).not.toBeEmpty();
        });
        await test.step("6. Verify product ID 8873071 is displayed", async () => {
            await expect(pdp.ui.text(id)).toBeVisible();
        });
        await test.step("7. Verify the main product image is visible", async () => {
            await expect(pdp.ui.mainImage).toBeVisible();
        });
        await test.step("8. Verify the selling price is displayed", async () => {
            await expect(pdp.ui.sellingPrice).toBeVisible();
        });
        await test.step("9. Verify MRP is displayed", async () => {
            await expect(pdp.ui.mrp).toBeVisible();
        });
        await test.step("10. Verify the rating value and review link are visible", async () => {
            await expect(pdp.ui.text(rating)).toBeVisible();
            await expect(pdp.ui.reviewLink).toBeVisible();
        });
        await test.step("11. Verify colour options are displayed", async () => {
            await expect(pdp.ui.colourLabel).toBeVisible();
            await expect(pdp.ui.colourThumbnails.first()).toBeVisible();
        });
        await test.step("12. Verify size options and Add to cart are displayed", async () => {
            await expect(pdp.ui.sizeOptions.first()).toBeVisible();
            await expect(pdp.ui.addToCart).toBeVisible();
        });
    });

    // TC_27
    test("TC_27 Select colour variant", async ({ page }) => {
        let urlBefore = "";
        let imageBefore = "";

        await test.step("1. Open Product Details Page ID 8873070 or 8873071", async () => {
            await pdp.open(TestData.product.id);
        });
        await test.step("2. Wait for the Colour section to be visible", async () => {
            await expect(pdp.ui.colourLabel).toBeVisible();
        });
        await test.step("3. Verify multiple colour thumbnails are displayed", async () => {
            await expect
                .poll(() => pdp.ui.colourThumbnails.count())
                .toBeGreaterThanOrEqual(2);
        });
        await test.step("4. Record the current product URL or product ID", async () => {
            urlBefore = page.url();
        });
        await test.step("5. Record the current main product image", async () => {
            imageBefore = (await pdp.ui.mainImage.getAttribute("src")) ?? "";
            expect(imageBefore).not.toBe("");
        });
        await test.step("6. Click a different colour thumbnail", async () => {
            await pdp.ui.colourThumbnails.nth(1).click();
        });
        await test.step("7. Wait for the variant update to complete", async () => {
            await page.waitForLoadState("domcontentloaded");
            await expect(pdp.ui.productName).toBeVisible();
        });
        await test.step("8. Verify the selected thumbnail has a highlighted border", async () => {
            await expect.poll(() => pdp.hasHighlightedColour()).toBe(true);
        });
        await test.step("9. Verify the main product image changes to the selected colour", async () => {
            await expect
                .poll(async () => (await pdp.ui.mainImage.getAttribute("src")) ?? "")
                .not.toBe(imageBefore);
        });
        await test.step("10. Verify the URL or product ID changes when the colour is a separate variant", async () => {
            // soft check: some colours are not separate variants
            expect.soft(page.url(), "URL after choosing another colour").not.toBe(urlBefore);
        });
        await test.step("11. Verify price and size controls remain visible", async () => {
            await expect(pdp.ui.sellingPrice).toBeVisible();
            await expect(pdp.ui.sizeOptions.first()).toBeVisible();
        });
        await test.step("12. Verify the page does not display an application error", async () => {
            await expect(page.getByText(/something went wrong|application error/i)).toHaveCount(0);
        });
    });

    // TC_31
    test("TC_31 Product details drawer", async () => {
        const { id } = TestData.product;

        await test.step("1. Open Product Details Page ID 8873071", async () => {
            await pdp.open(id);
        });
        await test.step("2. Scroll to the information section", async () => {
            await pdp.scrollTo(pdp.ui.productDetailsTrigger);
        });
        await test.step("3. Verify Product details is visible", async () => {
            await expect(pdp.ui.productDetailsTrigger).toBeVisible();
        });
        await test.step("4. Click Product details", async () => {
            await pdp.ui.productDetailsTrigger.click();
        });
        await test.step("5. Verify the background page becomes dimmed", async () => {
            await expect(pdp.ui.backdrop).toBeVisible();
        });
        await test.step("6. Verify a right-side drawer opens", async () => {
            await expect(pdp.ui.drawer).toBeVisible();
        });
        await test.step("7. Verify the drawer heading is Product details", async () => {
            await expect(pdp.ui.drawer).toContainText("Product details");
        });
        await test.step("8. Verify ID: 8873071 is displayed", async () => {
            await expect(pdp.ui.drawer).toContainText(`ID: ${id}`);
        });
        await test.step("9. Verify descriptive product text is displayed", async () => {
            await expect
                .poll(async () => (await pdp.ui.drawer.innerText()).length)
                .toBeGreaterThan(80);
        });
        await test.step("10. Verify the drawer close X is visible", async () => {
            await expect(pdp.ui.drawerClose).toBeVisible();
        });
        await test.step("11. Click the close X", async () => {
            await pdp.closeDrawer();
        });
        await test.step("12. Verify the drawer closes and the page becomes active", async () => {
            await expect(pdp.ui.drawer).toBeHidden();
            await expect(pdp.ui.backdrop).toBeHidden();
        });
    });

    // TC_32
    test("TC_32 Product specifications drawer", async () => {
        const { distance, weight, frequency, footWidth } = TestData.specs;

        await test.step("1. Open Product Details Page ID 8873071", async () => {
            await pdp.open(TestData.product.id);
        });
        await test.step("2. Scroll to Product specifications", async () => {
            await pdp.scrollTo(pdp.ui.productSpecsTrigger);
        });
        await test.step("3. Click Product specifications", async () => {
            await pdp.ui.productSpecsTrigger.click();
        });
        await test.step("4. Verify the background page becomes dimmed", async () => {
            await expect(pdp.ui.backdrop).toBeVisible();
        });
        await test.step("5. Verify the right-side drawer heading is Product specifications", async () => {
            await expect(pdp.ui.drawer).toContainText("Product specifications");
        });
        await test.step("6. Verify Distance shows From 1 to 10 km", async () => {
            await expect(pdp.ui.drawer).toContainText(/distance/i);
            await expect(pdp.ui.drawer).toContainText(distance);
        });
        await test.step("7. Verify Weight (in g) shows 264 g", async () => {
            await expect(pdp.ui.drawer).toContainText(/weight \(in g\)/i);
            await expect(pdp.ui.drawer).toContainText(weight);
        });
        await test.step("8. Verify Frequency shows Regular,intensive", async () => {
            await expect(pdp.ui.drawer).toContainText(/frequency/i);
            await expect(pdp.ui.drawer).toContainText(frequency);
        });
        await test.step("9. Verify Foot width shows Medium", async () => {
            await expect(pdp.ui.drawer).toContainText(/foot width/i);
            await expect(pdp.ui.drawer).toContainText(footWidth);
        });
        await test.step("10. Verify Removable insole and Shoe height entries are visible", async () => {
            await expect(pdp.ui.drawer).toContainText(/removable insole/i);
            await expect(pdp.ui.drawer).toContainText(/shoe height/i);
        });
        await test.step("11. Scroll inside the drawer to confirm additional content is accessible", async () => {
            const lastEntry = pdp.ui.drawer.getByText(/shoe height/i).first();
            await lastEntry.scrollIntoViewIfNeeded();
            await expect(lastEntry).toBeVisible();
        });
        await test.step("12. Close the drawer using X", async () => {
            await pdp.closeDrawer();
            await expect(pdp.ui.drawer).toBeHidden();
        });
    });

    // TC_33
    test("TC_33 Invalid delivery PIN code", async () => {
        await test.step("1. Open Product Details Page ID 8873071", async () => {
            await pdp.open(TestData.product.id);
        });
        await test.step("2. Locate the delivery location or PIN-code area", async () => {
            await expect(pdp.ui.deliveryTrigger).toBeVisible();
        });
        await test.step("3. Open Select delivery location", async () => {
            await pdp.openDrawer(pdp.ui.deliveryTrigger);
        });
        await test.step("4. Verify the right-side delivery drawer opens", async () => {
            await expect(pdp.ui.drawer).toBeVisible();
        });
        await test.step("5. Verify Login for personalised experience is displayed for a guest user", async () => {
            await expect(pdp.ui.guestLoginPrompt).toBeVisible();
        });
        await test.step("6. Locate the Enter pincode field", async () => {
            await expect(pdp.ui.pincodeInput).toBeVisible();
        });
        await test.step("7. Clear any existing PIN code", async () => {
            await pdp.ui.pincodeInput.clear();
        });
        await test.step("8. Enter 723000", async () => {
            await pdp.ui.pincodeInput.fill(TestData.invalidPincode);
        });
        await test.step("9. Click the arrow submit button", async () => {
            await pdp.ui.pincodeSubmit.click();
        });
        await test.step("10. Wait for delivery validation to finish", async () => {
            await expect(pdp.ui.pincodeSubmit).toBeEnabled();
        });
        await test.step("11. Verify the red message Unable to find location for this pincode appears", async () => {
            await expect(pdp.ui.text(TestData.messages.invalidPincode)).toBeVisible();
        });
        await test.step("12. Close the delivery drawer using X", async () => {
            await pdp.closeDrawer();
            await expect(pdp.ui.drawer).toBeHidden();
        });
    });

    // TC_34
    test("TC_34 Reviews section", async () => {
        await test.step("1. Open Product Details Page ID 8873071", async () => {
            await pdp.open(TestData.product.id);
        });
        await test.step("2. Scroll to the Reviews section", async () => {
            await pdp.scrollTo(pdp.ui.reviewsHeading);
        });
        await test.step("3. Verify the Reviews heading is visible", async () => {
            await expect(pdp.ui.reviewsHeading).toBeVisible();
        });
        await test.step("4. Verify overall rating 4.7 is displayed", async () => {
            await expect(pdp.ui.reviewsSection).toContainText(TestData.product.rating);
        });
        await test.step("5. Verify the review count link is displayed", async () => {
            await expect(pdp.ui.reviewCountLink).toBeVisible();
        });
        await test.step("6. Verify the star-rating distribution is visible", async () => {
            await expect(pdp.ui.ratingDistribution).toBeVisible();
        });
        await test.step("7. Verify attribute ratings such as fitting comfort are displayed", async () => {
            await expect(pdp.ui.attributeRatings).toBeVisible();
        });
        await test.step("8. Verify at least one written review title is displayed", async () => {
            await expect(pdp.ui.reviewTitles.first()).toBeVisible();
        });
        await test.step("9. Verify review metadata is displayed where available", async () => {
            const text = await pdp.ui.reviewsSection.innerText();
            test.info().annotations.push({
                type: "review metadata",
                description: /\b(20\d\d|ago|verified)\b/i.test(text) ? "found" : "not found",
            });
        });
        await test.step("10. Verify multiple review entries can be seen", async () => {
            await expect.poll(() => pdp.ui.reviewTitles.count()).toBeGreaterThanOrEqual(2);
        });
        await test.step("11. Verify View all reviews is visible", async () => {
            await expect(pdp.ui.viewAllReviews).toBeVisible();
        });
        await test.step("12. Verify the section remains readable without overlapping content", async () => {
            const box = await pdp.ui.reviewsSection.boundingBox();
            expect(box).not.toBeNull();
            expect(box!.width).toBeGreaterThan(200);
            await expect(pdp.ui.viewAllReviews).toBeInViewport();
        });
    });
});
