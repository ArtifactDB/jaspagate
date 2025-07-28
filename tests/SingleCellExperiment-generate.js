import * as bioc from "bioconductor";
import { test_globals } from "./globals.js";
import * as jsp from "../src/index.js";
import * as matrix from "./matrix.js";
import * as fs from "fs";

if (!fs.existsSync("artifacts2")) {
    fs.mkdirSync("artifacts2");
}

/*******************************/

let all_types = new bioc.SingleCellExperiment(
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
        reducedDimensions: {
            "TSNE": new matrix.TestDenseMatrix(5, 2),
            "UMAP": new matrix.TestDenseMatrix(5, 5)
        },
        alternativeExperiments: {
            "foo": new bioc.SummarizedExperiment(
                {
                    "whee": new matrix.TestDenseMatrix(20, 5)
                }
            )
        },
        mainExperimentName: "RNA",
    }
);

let path = "artifacts2/SingleCellExperiment-full";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
await jsp.saveObject(all_types, path, test_globals);

/*******************************/

let empty = new bioc.SingleCellExperiment(
    {},
    {
        columnData: new bioc.DataFrame({}, { numberOfRows: 0 }),
        rowData: new bioc.DataFrame({}, { numberOfRows: 0 })
    }
);

path = "artifacts2/SingleCellExperiment-empty";
if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
}
await jsp.saveObject(empty, path, test_globals);
