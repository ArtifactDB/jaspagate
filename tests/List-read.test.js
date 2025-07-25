import * as bioc from "bioconductor";
import { test_globals } from "./globals.js";
import * as jsp from "../src/index.js";

test("readList with different types", async () => {
    let list = await jsp.readObject("artifacts/List-all_types", null, test_globals);
    expect(list.length()).toEqual(6);
    expect(list.names()).toBeNull();

    expect(list.get(0) instanceof bioc.IntegerList).toBe(true);
    expect(list.get(0).toArray()).toEqual([1,2,3,4,5,6,7,8,9,10]);

    expect(list.get(1) instanceof bioc.NumberList).toBe(true);
    expect(list.get(1).toArray()).toEqual([0.5,1,1.5,2,2.5,3,3.5,4,4.5,5]);

    expect(list.get(2) instanceof bioc.StringList).toBe(true);
    expect(list.get(2).toArray()).toEqual(["foo_a","foo_b","foo_c","foo_d","foo_e","foo_f","foo_g","foo_h","foo_i","foo_j"]);

    expect(list.get(3) instanceof bioc.StringList).toBe(true);
    expect(list.get(3).toArray()).toEqual(["bar_A","bar_B","bar_C","bar_D","bar_E","bar_F","bar_G","bar_H","bar_I","bar_J"]);

    expect(list.get(4) instanceof bioc.BooleanList).toBe(true);
    expect(list.get(4).toArray()).toEqual([true,false,true,false,true,false,true,false,true,false]);

    expect(list.get(5)).toBeNull();
})

test("readList with names", async () => {
    let list = await jsp.readObject("artifacts/List-named", null, test_globals);
    expect(list.length()).toEqual(6);
    expect(list.names()).toEqual(["integer","number","string","factor","boolean","nothing"]);

    let expected = ["a","b","c","d","e","f","g","h","i","j"];
    expect(list.get(0).names()).toEqual(expected);
    expect(list.get(1).names()).toEqual(expected);
    expect(list.get(2).names()).toEqual(expected);
    expect(list.get(3).names()).toEqual(expected);
    expect(list.get(4).names()).toEqual(expected);
})

test("readList with scalars", async () => {
    let list = await jsp.readObject("artifacts/List-scalars", null, test_globals);
    expect(list.length()).toEqual(4);

    expect(list.get(0) instanceof bioc.IntegerList).toBe(true);
    expect(list.get(0).toArray()).toEqual([1]);

    expect(list.get(1) instanceof bioc.NumberList).toBe(true);
    expect(list.get(1).toArray()).toEqual([1.5]);

    expect(list.get(2) instanceof bioc.StringList).toBe(true);
    expect(list.get(2).toArray()).toEqual(["foo_bar"]);

    expect(list.get(3) instanceof bioc.BooleanList).toBe(true);
    expect(list.get(3).toArray()).toEqual([true]);
})

test("readList with specials", async () => {
    let list = await jsp.readObject("artifacts/List-specials", null, test_globals);
    expect(list.length()).toEqual(1);

    expect(list.get(0) instanceof bioc.NumberList).toBe(true);
    expect(list.get(0).toArray()).toEqual([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
})

test("readList with missing values", async () => {
    let list = await jsp.readObject("artifacts/List-missing", null, test_globals);
    expect(list.length()).toEqual(5);

    expect(list.get(0) instanceof bioc.IntegerList).toBe(true);
    expect(list.get(0).toArray()).toEqual([1,null,3]);

    expect(list.get(1) instanceof bioc.NumberList).toBe(true);
    expect(list.get(1).toArray()).toEqual([1.5,null,2.5]);

    expect(list.get(2) instanceof bioc.StringList).toBe(true);
    expect(list.get(2).toArray()).toEqual(["foo",null,"bar"]);

    expect(list.get(3) instanceof bioc.StringList).toBe(true);
    expect(list.get(3).toArray()).toEqual(["whee",null,"stuff"]);

    expect(list.get(4) instanceof bioc.BooleanList).toBe(true);
    expect(list.get(4).toArray()).toEqual([true,null,false]);
})

test("readList with nested structures", async () => {
    let list = await jsp.readObject("artifacts/List-nested", null, test_globals);
    expect(list.length()).toEqual(2);
    expect(list.names()).toEqual(["unnamed", "named"]);

    expect(list.get(0) instanceof bioc.List).toBe(true);
    expect(list.get(0).get(0) instanceof bioc.IntegerList).toBe(true);
    expect(list.get(0).get(0).toArray()).toEqual([1,2,3,4,5]);
    expect(list.get(0).get(1) instanceof bioc.List).toBe(true);
    expect(list.get(0).get(1).get(0) instanceof bioc.IntegerList).toBe(true);
    expect(list.get(0).get(1).get(0).toArray()).toEqual([6,7,8]);
    expect(list.get(0).get(1).get(1) instanceof bioc.IntegerList).toBe(true);
    expect(list.get(0).get(1).get(1).toArray()).toEqual([9,10]);

    expect(list.get(1) instanceof bioc.List).toBe(true);
    expect(list.get(1).names()).toEqual(["foo", "bar"]);
    expect(list.get(1).get(0) instanceof bioc.IntegerList).toBe(true);
    expect(list.get(1).get(0).toArray()).toEqual([1,2,3,4,5]);
    expect(list.get(1).get(1) instanceof bioc.List).toBe(true);
    expect(list.get(1).get(1).get(0) instanceof bioc.StringList).toBe(true);
    expect(list.get(1).get(1).get(0).toArray()).toEqual(["A"]);
    expect(list.get(1).get(1).get(1) instanceof bioc.StringList).toBe(true);
    expect(list.get(1).get(1).get(1).toArray()).toEqual(["a"]);
})

test("readList with external", async () => {
    let list = await jsp.readObject("artifacts/List-external", null, test_globals);
    expect(list.length()).toEqual(3);
    expect(list.get(0) instanceof bioc.DataFrame).toBe(true);
    expect(list.get(0).columnNames(0)).toEqual(["A"]);
    expect(list.get(1).toArray()).toEqual([1,2,3,4,5]);
    expect(list.get(2).get(0).toArray()).toEqual(["A","B","C"]);
    expect(list.get(2).get(1) instanceof bioc.DataFrame).toBe(true);
    expect(list.get(2).get(1).columnNames(0)).toEqual(["B"]);
})
