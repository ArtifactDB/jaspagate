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
        "boolean": [true,false,true,false,true,false,true,false,true,false]
    },
    {
        rowNames: ["sample_1","sample_2","sample_3","sample_4","sample_5","sample_6","sample_7","sample_8","sample_9","sample_10"]
    }
)

let path = "artifacts2/DataFrame-all_types"
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
jsp.saveObject(all_types, path, test_globals)

//##############################
//
//missingness <- all_types
//rownames(missingness) <- NULL
//for (col in seq_along(missingness)) {
//    missingness[5,col] <- NA
//}
//
//path <- "artifacts/DataFrame-missing"
//unlink(path, recursive=TRUE)
//saveObject(missingness, path)
//
//##############################
//
//nested <- DataFrame(X=I(DataFrame(foo=1:10, bar=letters[1:10])), Y=LETTERS[1:10])
//path <- "artifacts/DataFrame-nested"
//unlink(path, recursive=TRUE)
//saveObject(nested, path)
