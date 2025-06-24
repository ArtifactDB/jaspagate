import * as bioc from "bioconductor";
import { test_globals } from "./globals.js";
import * as jsp from "../src/index.js";

test("readDataFrame with different types", async () => {
    let df = await jsp.readObject("artifacts/DataFrame-all_types", null, test_globals);
    expect(df.numberOfRows()).toBe(10);
    expect(df.rowNames()).toEqual(["sample_1", "sample_2", "sample_3", "sample_4", "sample_5", "sample_6", "sample_7", "sample_8", "sample_9", "sample_10" ]);

    expect(df.columnNames()).toEqual(["integer", "real", "string", "factor", "vls", "boolean"]);
    expect(df.column(0)).toEqual(new Int32Array([1,2,3,4,5,6,7,8,9,10]));
    expect(df.column(1)).toEqual(new Float64Array([0.5,1,1.5,2,2.5,3,3.5,4,4.5,5]));
    expect(df.column(2)).toEqual(["foo_a", "foo_b", "foo_c", "foo_d", "foo_e", "foo_f", "foo_g", "foo_h", "foo_i", "foo_j"]);
    expect(df.column(3)).toEqual(["bar_A", "bar_B", "bar_C", "bar_D", "bar_E", "bar_F", "bar_G", "bar_H", "bar_I", "bar_J"]);

    const expected_vls = Array(10);
    for (var i = 0; i < 10; i++) {
        expected_vls[i] = "";
    }
    let first_string = "";
    for (var i = 0; i < 100; i++) {
        first_string += "WHEE";
    }
    expected_vls[0] = first_string;
    expect(df.column(4)).toEqual(expected_vls);

    expect(df.column(5)).toEqual([true,false,true,false,true,false,true,false,true,false]);
})

test("readDataFrame with missing values", async () => {
    let df = await jsp.readObject("artifacts/DataFrame-missing", null, test_globals);
    expect(df.numberOfRows()).toBe(10);
    expect(df.rowNames()).toBeNull();

    expect(df.columnNames()).toEqual(["integer", "real", "string", "factor", "vls", "boolean"]);
    expect(df.column(0)).toEqual([1,2,3,4,null,6,7,8,9,10]);
    expect(df.column(1)).toEqual([0.5,1,1.5,2,null,3,3.5,4,4.5,5]);
    expect(df.column(2)).toEqual(["foo_a", "foo_b", "foo_c", "foo_d", null, "foo_f", "foo_g", "foo_h", "foo_i", "foo_j"]);
    expect(df.column(3)).toEqual(["bar_A", "bar_B", "bar_C", "bar_D", null, "bar_F", "bar_G", "bar_H", "bar_I", "bar_J"]);

    const expected_vls = Array(10);
    for (var i = 0; i < 10; i++) {
        expected_vls[i] = "";
    }
    let first_string = "";
    for (var i = 0; i < 100; i++) {
        first_string += "WHEE";
    }
    expected_vls[0] = first_string;
    expected_vls[4] = null;
    expect(df.column(4)).toEqual(expected_vls);

    expect(df.column(5)).toEqual([true,false,true,false,null,false,true,false,true,false]);
})

test("readDataFrame with non-atomic columns", async () => {
    let df = await jsp.readObject("artifacts/DataFrame-nested", null, test_globals);
    expect(df.column(0) instanceof bioc.DataFrame).toBe(true);
    expect(df.column(0).column("foo")).toEqual(new Int32Array([1,2,3,4,5,6,7,8,9,10]));
    expect(df.column(0).column("bar")).toEqual(["a","b","c","d","e","f","g","h","i","j"]);
    expect(df.column(1)).toEqual(["A","B","C","D","E","F","G","H","I","J"]);
})
