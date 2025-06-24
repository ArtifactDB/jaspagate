import { test_globals } from "./globals.js";
import * as jsp from "../src/index.js";

test("all types loader works as expected", async () => {
    let df = await jsp.readObject("artifacts/DataFrame-all_types", null, test_globals);
    expect(df.numberOfRows()).toBe(10);
})
