import { Locator, Page } from "@playwright/test";

export class PdpLocators {
    // identity
    readonly breadcrumbs: Locator;
    readonly brandLabel: Locator;
    readonly productName: Locator;
    readonly mainImage: Locator;
    readonly notFound: Locator;

    // price and rating
    readonly sellingPrice: Locator;
    readonly mrp: Locator;
    readonly reviewLink: Locator;

    // colour
    readonly colourLabel: Locator;
    readonly colourThumbnails: Locator;

    // size and cart
    readonly sizeLabel: Locator;
    readonly sizeOptions: Locator;
    readonly addToCart: Locator;
    readonly goToCart: Locator;
    readonly sizeError: Locator;
    readonly lowStock: Locator;

    // information drawers
    readonly productDetailsTrigger: Locator;
    readonly productSpecsTrigger: Locator;
    readonly drawer: Locator;
    readonly drawerClose: Locator;
    readonly backdrop: Locator;

    // delivery drawer
    readonly deliveryTrigger: Locator;
    readonly guestLoginPrompt: Locator;
    readonly pincodeInput: Locator;
    readonly pincodeSubmit: Locator;

    // reviews
    readonly reviewsHeading: Locator;
    readonly reviewsSection: Locator;
    readonly reviewCountLink: Locator;
    readonly ratingDistribution: Locator;
    readonly attributeRatings: Locator;
    readonly reviewTitles: Locator;
    readonly viewAllReviews: Locator;

    constructor(private readonly page: Page) {
        this.breadcrumbs = page
            .getByRole("navigation", { name: /breadcrumb/i })
            .or(page.locator('[aria-label*="breadcrumb" i], nav ol'))
            .first();
        this.brandLabel = page
            .locator('[data-test-id*="brand" i], [class*="brand" i]')
            .first();
        this.productName = page.getByRole("heading", { level: 1 }).first();
        this.mainImage = page.locator('img[src*="mediadecathlon"]').first();
        this.notFound = page.getByText(/page not found/i);

        this.sellingPrice = page.getByText(/₹\s?[\d,]+/).first();
        this.mrp = page.getByText(/MRP/i).first();
        this.reviewLink = page.getByRole("link", { name: /review/i }).first();

        this.colourLabel = page.getByText(/^colou?rs?\b/i).first();
        this.colourThumbnails = this.colourLabel
            .locator("xpath=ancestor::*[count(.//img)>=2][1]")
            .locator("img");

        this.sizeLabel = page.getByText(/select size/i).first();
        this.sizeOptions = page.getByRole("button", { name: /^\d+(\.\d+)?$/ });
        this.addToCart = page.getByRole("button", { name: /^add to cart$/i }).first();
        this.goToCart = page
            .getByRole("button", { name: /go to cart/i })
            .or(page.getByRole("link", { name: /go to cart/i }))
            .first();
        this.sizeError = page.getByText(/please select a size/i).first();
        this.lowStock = page.getByText(/\d+\s+left/i).first();

        this.productDetailsTrigger = page.getByText("Product details", { exact: true }).first();
        this.productSpecsTrigger = page.getByText("Product specifications", { exact: true }).first();
        this.drawer = page.getByRole("dialog").first();
        this.drawerClose = this.drawer
            .getByRole("button", { name: /close/i })
            .or(this.drawer.locator('[aria-label*="close" i]'))
            .first();
        this.backdrop = page
            .locator('[class*="backdrop" i], [class*="overlay" i], [class*="dim" i]')
            .first();

        this.deliveryTrigger = page.getByText(/select delivery location/i).first();
        this.guestLoginPrompt = page.getByText(/login for personali[sz]ed experience/i).first();
        this.pincodeInput = page
            .getByPlaceholder(/pincode/i)
            .or(page.getByLabel(/pincode/i))
            .first();
        this.pincodeSubmit = this.drawer
            .getByRole("button", { name: /submit|check|apply|arrow/i })
            .or(this.pincodeInput.locator("xpath=following::button[1]"))
            .first();

        this.reviewsHeading = page.getByRole("heading", { name: /^reviews/i }).first();
        this.reviewsSection = this.reviewsHeading.locator(
            "xpath=ancestor::*[.//*[contains(.,'View all reviews')]][1]"
        );
        this.reviewCountLink = page.getByRole("link", { name: /\d+\s*reviews?/i }).first();
        this.ratingDistribution = this.reviewsSection
            .locator('[role="progressbar"], progress, [class*="distribution" i]')
            .first();
        this.attributeRatings = this.reviewsSection.getByText(/fit|comfort/i).first();
        this.reviewTitles = this.reviewsSection.locator("h3, h4");
        this.viewAllReviews = page
            .getByRole("button", { name: /view all reviews/i })
            .or(page.getByRole("link", { name: /view all reviews/i }))
            .first();
    }

    // locators that depend on a value
    text(value: string | RegExp, exact = false): Locator {
        return this.page.getByText(value, { exact }).first();
    }

    size(label: string): Locator {
        return this.page.getByRole("button", { name: label, exact: true });
    }
}
