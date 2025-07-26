import * as bioc from "bioconductor";
import { test_globals } from "./globals.js";
import * as jsp from "../src/index.js";
import * as fs from "fs";

if (!fs.existsSync("artifacts2")) {
    fs.mkdirSync("artifacts2");
}

/*******************************/

let all_types = new bioc.DataFrame(
    {
        "i8": new Int8Array([1,2,3,4,5,6,7,8,9,10]),
        "u8": new Uint8Array([1,2,3,4,5,6,7,8,9,10]),
        "i16": new Int16Array([1,2,3,4,5,6,7,8,9,10]),
        "u16": new Uint16Array([1,2,3,4,5,6,7,8,9,10]),
        "i32": new Int32Array([1,2,3,4,5,6,7,8,9,10]),
        "u32": new Uint32Array([1,2,3,4,5,6,7,8,9,10]),
        "i64": new BigInt64Array([1n,2n,3n,4n,5n,6n,7n,8n,9n,10n]),
        "u64": new BigUint64Array([1n,2n,3n,4n,5n,6n,7n,8n,9n,10n]),
        "f32": new Float32Array([1,2,3,4,5,6,7,8,9,10]),
        "f64": new Float64Array([1,2,3,4,5,6,7,8,9,10]),
        "number": [0.5,1,1.5,2,2.5,3,3.5,4,4.5,5],
        "string": ["foo_a","foo_b","foo_c","foo_d","foo_e","foo_f","foo_g","foo_h","foo_i","foo_j"],
        "boolean": [true,false,true,false,true,false,true,false,true,false],
        "integer_list": new bioc.IntegerList([1,2,3,4,5,6,7,8,9,10]),
        "integer_list2": new bioc.IntegerList([1,2,3,4,5,6,7,8,9,2**31]),
        "number_list": new bioc.NumberList([0.5,1,1.5,2,2.5,3,3.5,4,4.5,5]),
        "string_list": new bioc.StringList(["foo_a","foo_b","foo_c","foo_d","foo_e","foo_f","foo_g","foo_h","foo_i","foo_j"]),
        "boolean_list": new bioc.BooleanList([true,false,true,false,true,false,true,false,true,false])
    },
    {
        rowNames: ["sample_1","sample_2","sample_3","sample_4","sample_5","sample_6","sample_7","sample_8","sample_9","sample_10"]
    }
);

let path = "artifacts2/DataFrame-all_types";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(all_types, path, test_globals);

/*******************************/

let missingness = new bioc.DataFrame(
    {
        "number": [0.5,null,1.5,2,2.5,3,3.5,4,4.5,5],
        "number_with_NaN": [0.5,null,Number.NaN,2,2.5,3,3.5,4,4.5,5],
        "number_with_every_special": [Number.POSITIVE_INFINITY,null,Number.NaN,0,Number.NEGATIVE_INFINITY,Number.MAX_VALUE,-Number.MAX_VALUE,4,4.5,5],
        "string": ["foo_a","foo_b","foo_c",null,"foo_e","foo_f","foo_g","foo_h","foo_i","foo_j"],
        "string_with_na": ["foo_a","foo_b","NA",null,"foo_e","foo_f","foo_g","foo_h","foo_i","foo_j"],
        "boolean": [true,false,true,false,null,false,true,false,true,false],
        "integer_list": new bioc.IntegerList([1,null,3,4,5,6,7,8,9,10]),
        "number_list": new bioc.NumberList([0.5,null,1.5,2,2.5,3,3.5,4,4.5,5]),
        "string_list": new bioc.StringList(["foo_a","foo_b","foo_c",null,"foo_e","foo_f","foo_g","foo_h","foo_i","foo_j"]),
        "boolean_list": new bioc.BooleanList([true,false,true,false,null,false,true,false,true,false])
    }
);

path = "artifacts2/DataFrame-missing";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(missingness, path, test_globals);

/*******************************/

let nested = new bioc.DataFrame(
    {
        "X": new bioc.DataFrame(
            {
                "foo": new Int32Array([1,2,3,4,5,6,7,8,9,10]),
                "bar": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
            }
        ),
        "Y": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        "Z": new bioc.List([1,2,"C","D",true,false,null,null,null,null]),
        "AA": [1,2,"C","D",true,false,null,null,null,null]
    }
);

path = "artifacts2/DataFrame-nested";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(nested, path, test_globals);

/*******************************/

let hasmeta = new bioc.DataFrame(
    { "whee": new Int32Array([1,2,3,4,5,6,7,8,9,10]) },
    { metadata: new bioc.List({ foo: 1, bar: [ "A", "B", "C" ] }) }
);

path = "artifacts2/DataFrame-metadata";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(hasmeta, path, test_globals);

/*******************************/

class Thingy {
    #n;
    constructor(n) {
        this.#n = n;
    }
    _bioconductor_LENGTH() {
        return this.#n;
    }
};

let custom = new bioc.DataFrame({
    "whee": new Thingy(5),
    "X": new bioc.DataFrame({ "Y": [1,2,3,4,5] }) // adding this as a control.
});

path = "artifacts2/DataFrame-custom";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(custom, path, test_globals, {
    DataFrame_saveOther: (y, handle, name) => {
        if (y instanceof Thingy) {
            let xhandle = handle.createDataSet(name, "Int8", [bioc.LENGTH(y)], { data: new Int8Array(bioc.LENGTH(y)) }); 
            xhandle.writeAttribute("type", "String", [], ["boolean"]);
            return true;
        } else {
            return false;
        }
    }
});
