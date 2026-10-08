import * as fs from "fs";
import * as path from "path";

// Loads utils/testData.json once, so the specs keep using `TestData.x.y`
// and the data itself lives in the JSON file (edit values there).

export interface TestDataShape {
    partialKeyword: string;
    unrelatedKeyword: string;
    product: {
        id: string;
        altId: string;
        brand: string;
        rating: string;
        size: string;
        altSize: string;
    };
    invalidPincode: string;
    messages: {
        sizeRequired: string;
        invalidPincode: string;
        guestLogin: string;
    };
    cart: {
        quantity: string;
        sellingPrice: string;
        mrp: string;
        discount: string;
        total: string;
    };
    specs: {
        distance: string;
        weight: string;
        frequency: string;
        footWidth: string;
    };
}

// playwright runs from the project root, so the path is built from there
const file = path.join(process.cwd(), "utils", "testData.json");

export const TestData: TestDataShape = JSON.parse(fs.readFileSync(file, "utf-8"));
