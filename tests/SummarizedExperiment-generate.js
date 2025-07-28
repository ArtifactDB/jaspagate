import * as bioc from "bioconductor";
import { test_globals } from "./globals.js";
import * as jsp from "../src/index.js";
import * as matrix from "./matrix.js";
import * as fs from "fs";

if (!fs.existsSync("artifacts2")) {
    fs.mkdirSync("artifacts2");
}

/*******************************/

let full = new bioc.SummarizedExperiment(
    {
        "counts": new matrix.TestDenseMatrix(10, 5),
        "logcounts": new matrix.TestDenseMatrix(10, 5)
    },
    {
        assayOrder: ["counts", "logcounts"],
        rowData: new bioc.DataFrame({ "symbol": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] }),
        columnData: new bioc.DataFrame({ "label": ["foo_a","foo_b","foo_c","foo_d","foo_e"] }),
        rowNames: ["gene_1","gene_2","gene_3","gene_4","gene_5","gene_6","gene_7","gene_8","gene_9","gene_10"],
        columnNames: ["sample_1","sample_2","sample_3","sample_4","sample_5"],
        metadata: { foo: 1, bar: ["A", "B", "C" ] }
    }
);

let path = "artifacts2/SummarizedExperiment-full";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
await jsp.saveObject(full, path, test_globals);

/*******************************/

let empty = new bioc.SummarizedExperiment(
    {},
    {
        columnData: new bioc.DataFrame({}, { numberOfRows: 0 }),
        rowData: new bioc.DataFrame({}, { numberOfRows: 0 })
    }
);

path = "artifacts2/SummarizedExperiment-empty";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
await jsp.saveObject(empty, path, test_globals);

/*******************************/

let unnamed = new bioc.SummarizedExperiment(
    {
        "counts": new matrix.TestDenseMatrix(10, 5),
        "logcounts": new matrix.TestDenseMatrix(10, 5)
    },
    {
        assayOrder: ["counts", "logcounts"],
        rowData: new bioc.DataFrame(
            {
                "symbol": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] },
            {
                rowNames: ["gene_1","gene_2","gene_3","gene_4","gene_5","gene_6","gene_7","gene_8","gene_9","gene_10"] // should be wiped as the SE itself has no row names.
            }
        ),
        columnData: new bioc.DataFrame(
            {
                "label": ["foo_a","foo_b","foo_c","foo_d","foo_e"]
            },
            {
                rowNames: ["sample_1","sample_2","sample_3","sample_4","sample_5"] // should be wiped as the SE itself has no row names.
            }
        )
    }
);

path = "artifacts2/SummarizedExperiment-unnamed";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
await jsp.saveObject(unnamed, path, test_globals);
