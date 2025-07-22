import * as jsp from "../src/index.js";

test("joinPath works properly", () => {
    expect(jsp.joinPath(".")).toEqual(".");
    expect(jsp.joinPath(".", "foo")).toEqual("foo");
    expect(jsp.joinPath("foo", "bar")).toEqual("foo/bar");
    expect(jsp.joinPath("foo", ".", "bar")).toEqual("foo/bar");
    expect(jsp.joinPath("foo")).toEqual("foo");
    expect(jsp.joinPath("foo", "bar/whee")).toEqual("foo/bar/whee");
})
