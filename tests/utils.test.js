import * as jsp from "../src/utils.js";

test("joinPath works properly", () => {
    expect(jsp.joinPath(".")).toEqual(".");
    expect(jsp.joinPath(".", "foo")).toEqual("foo");
    expect(jsp.joinPath("foo", "bar")).toEqual("foo/bar");
    expect(jsp.joinPath("foo", ".", "bar")).toEqual("foo/bar");
    expect(jsp.joinPath("foo")).toEqual("foo");
    expect(jsp.joinPath("foo", "bar/whee")).toEqual("foo/bar/whee");
})

test("exceedsInt32 works correctly", () => {
    expect(jsp.exceedsInt32([1,2,3,4,2**31-1,-(2**31),0])).toBe(false);
    expect(jsp.exceedsInt32([2**31])).toBe(true);
    expect(jsp.exceedsInt32([-(2**32)])).toBe(true);
})

test("formatIntegerArrayForHdf5 works correctly", () => {
    let out = jsp.formatIntegerArrayForHdf5([1,2,3,4,5]);
    expect(out.integer).toBe(true);
    expect(out.data).toEqual([1,2,3,4,5]);
    expect(out.placeholder).toBeNull();

    // Falls back to being numeric.
    out = jsp.formatIntegerArrayForHdf5([1,2,3,2**31]);
    expect(out.integer).toBe(false);
    expect(out.data).toEqual([1,2,3,2**31]);
    expect(out.placeholder).toBeNull();

    out = jsp.formatIntegerArrayForHdf5([1,2,null,2**31]);
    expect(out.integer).toBe(false);
    expect(out.data).toEqual(new Float64Array([1,2,Number.NaN,2**31]));
    expect(Number.isNaN(out.placeholder)).toBe(true);

    // Handles missing value (simple).
    out = jsp.formatIntegerArrayForHdf5([1,2,null,4,5]);
    expect(out.integer).toBe(true);
    expect(out.data).toEqual(new Int32Array([1,2,-(2**31),4,5]));
    expect(out.placeholder).toBe(-(2**31));

    out = jsp.formatIntegerArrayForHdf5([1,2,null,(2**31-1),-(2**31),0]);
    expect(out.integer).toBe(true);
    expect(out.data).toEqual(new Int32Array([1,2,-(2**31)+1,(2**31-1),-(2**31),0]));
    expect(out.placeholder).toBe(-(2**31)+1);
})

test("formatNumberArrayForHdf5 works correctly", () => {
    let out = jsp.formatNumberArrayForHdf5([1,2,3,4,5]);
    expect(out.data).toEqual([1,2,3,4,5]);
    expect(out.placeholder).toBeNull();

    out = jsp.formatNumberArrayForHdf5([1,2,null,4,5]);
    expect(out.data).toEqual(new Float64Array([1,2,Number.NaN,4,5]));
    expect(Number.isNaN(out.placeholder)).toBe(true);

    out = jsp.formatNumberArrayForHdf5([1,2,null,Number.NaN,Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.MAX_VALUE,-Number.MAX_VALUE,0]);
    expect(out.data).toEqual(new Float64Array([1,2,-Number.MAX_VALUE/2,Number.NaN,Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.MAX_VALUE,-Number.MAX_VALUE,0]));
    expect(out.placeholder).toBe(-Number.MAX_VALUE/2);
})

test("formatStringArrayForHdf5 works correctly", () => {
    let out = jsp.formatStringArrayForHdf5(["A","B","C"]);
    expect(out.data).toEqual(["A","B","C"]);
    expect(out.placeholder).toBeNull();

    out = jsp.formatStringArrayForHdf5(["A","B","C",null]);
    expect(out.data).toEqual(["A","B","C","NA"]);
    expect(out.placeholder).toBe("NA");

    out = jsp.formatStringArrayForHdf5(["A","B","C",null,"NA"]);
    expect(out.data).toEqual(["A","B","C","NA_","NA"]);
    expect(out.placeholder).toBe("NA_");

    out = jsp.formatStringArrayForHdf5(["A","B","C",null,"NA","NA_"]);
    expect(out.data).toEqual(["A","B","C","NA__","NA","NA_"]);
    expect(out.placeholder).toBe("NA__");
})

test("formatBooleanArrayForHdf5 works correctly", () => {
    let out = jsp.formatBooleanArrayForHdf5([true,false,true]);
    expect(out.data).toEqual(new Uint8Array([1,0,1]));
    expect(out.placeholder).toBeNull();

    out = jsp.formatBooleanArrayForHdf5([true,false,null]);
    expect(out.data).toEqual(new Uint8Array([1,0,2]));
    expect(out.placeholder).toBe(2);
})
