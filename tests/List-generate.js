import * as bioc from "bioconductor";
import { test_globals } from "./globals.js";
import * as jsp from "../src/index.js";
import * as fs from "fs";

if (!fs.existsSync("artifacts2")) {
    fs.mkdirSync("artifacts2");
}

/*******************************/

let all_types = new bioc.List([ 
    [1,2,3,4,5],
    new Int32Array([1,2,3,4,5]),
    new BigUint64Array([1n,2n,3n,4n,5n]),
    new Float64Array([1,2,3,4,5]),
    ["foo","bar"],
    [true,false],
    new bioc.IntegerList([1,2,3,4,5]),
    new bioc.NumberList([1,2,3,4,5]),
    new bioc.StringList(["foo","bar"]),
    new bioc.BooleanList([true,false]),
    null
])

let path = "artifacts2/List-all_types";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(all_types, path, test_globals);

/*******************************/

let named = new bioc.List({
    base: [1,2,3,4,5],
    integer: new bioc.IntegerList({a: 1, b: 2, c: 3, d: 4, e: 5}),
    number: new bioc.NumberList([1,2,3,4,5], { names: [ "A", "B", "C", "D", "E" ] }),
    string: new bioc.StringList(["foo","bar"], { names: [ "akari", "alicia" ] }),
    bool: new bioc.BooleanList([true,false], { names: [ "aika", "alice" ] }),
    nothing: null
})

path = "artifacts2/List-named";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(named, path, test_globals);

/*******************************/

let scalars = new bioc.List([
    1,
    "foo_bar",
    true
])

{
    let scalar_ilist = new bioc.IntegerList([1]);
    scalar_ilist._jaspagate_scalar = true;
    scalars.set(scalars.length(), scalar_ilist, { inPlace: true });
    let scalar_nlist = new bioc.NumberList([1]);
    scalar_nlist._jaspagate_scalar = true;
    scalars.set(scalars.length(), scalar_nlist, { inPlace: true });
    let scalar_slist = new bioc.StringList(["alpha"]);
    scalar_slist._jaspagate_scalar = true;
    scalars.set(scalars.length(), scalar_slist, { inPlace: true });
    let scalar_blist = new bioc.BooleanList([false]);
    scalar_blist._jaspagate_scalar = true;
    scalars.set(scalars.length(), scalar_blist, { inPlace: true });
}

{
    let scalar_ilist = new bioc.IntegerList([1]);
    scalars.set(scalars.length(), scalar_ilist, { inPlace: true });
    let scalar_nlist = new bioc.NumberList([1]);
    scalars.set(scalars.length(), scalar_nlist, { inPlace: true });
    let scalar_slist = new bioc.StringList(["alpha"]);
    scalars.set(scalars.length(), scalar_slist, { inPlace: true });
    let scalar_blist = new bioc.BooleanList([false]);
    scalars.set(scalars.length(), scalar_blist, { inPlace: true });
}

path = "artifacts2/List-scalars";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(scalars, path, test_globals);

/*******************************/

let specials = new bioc.List([[Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]]);

path = "artifacts2/List-specials";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(specials, path, test_globals);

/*******************************/

let outofrange = new bioc.List([new bioc.IntegerList([2**31, -(2**31 + 1)])])

path = "artifacts2/List-outofrange";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(outofrange, path, test_globals);

/*******************************/

let missingness = new bioc.List([
    [1, null, 3],
    new bioc.IntegerList([1, null, 3]),
    new bioc.StringList(["foo", null, "bar"]),
    new bioc.BooleanList([true, null, false])
]);

path = "artifacts2/List-missing";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(missingness, path, test_globals);

/*******************************/

let nested = new bioc.List({
    unnamed: new bioc.List([
        [1,2,3,4,5],
        new bioc.List([[6,7,8], [9,10]])
    ]),
    named: new bioc.List({
        foo: [1,2,3,4,5],
        bar: new bioc.List({ whee: "A", stuff: "a" })
    })
})

path = "artifacts2/List-nested"
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(nested, path, test_globals);

/*******************************/

let external = new bioc.List([
    new bioc.DataFrame({A: [1,2,3,4,5] }),
    [1,2,3,4,5],
    new bioc.List([
        ["A", "B", "C"],
        new bioc.DataFrame({ B: [1,2,3,4,5] })
    ])
])

path = "artifacts2/List-external"
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(external, path, test_globals);
