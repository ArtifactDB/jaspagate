import * as bioc from "bioconductor";
import { test_globals } from "./globals.js";
import * as misc from "./matrix.js";
import * as jsp from "../src/index.js";

test("readSummarizedExperiment with full contents", async () => {
    let se = await jsp.readObject("artifacts/SummarizedExperiment-full", null, test_globals);

    expect(se.numberOfRows()).toBe(100);
    expect(se.numberOfColumns()).toBe(10);
    expect(se.assayNames()).toEqual(["counts", "logcounts"]);

    expect(se.rowNames()[0]).toBe("GENE_1");
    expect(se.rowNames()[99]).toBe("GENE_100");
    expect(se.columnNames()[0]).toBe("a");
    expect(se.columnNames()[9]).toBe("j");

    expect(se.rowData().columnNames()).toEqual(["symbol"]);
    expect(se.columnData().columnNames()).toEqual(["label"]);

    let meta = se.metadata();
    expect(meta.names()).toEqual(["foo", "bar"]);
    expect(meta.get(0).toArray()).toEqual([1]);
    expect(meta.get(1).toArray()).toEqual(["A","B","C"]);

    // Checking that the metadata bypasses work correctly.
    se = await jsp.readObject("artifacts/SummarizedExperiment-full", null, test_globals, { SummarizedExperiment_readMetadata: false });
    expect(se.metadata().length()).toEqual(0);
})

test("readSummarizedExperiment with an empty object", async () => {
    let se = await jsp.readObject("artifacts/SummarizedExperiment-empty", null, test_globals);

    expect(se.numberOfRows()).toBe(0);
    expect(se.numberOfColumns()).toBe(0);
    expect(se.assayNames()).toEqual([]);

    expect(se.rowData().columnNames()).toEqual([]);
    expect(se.columnData().columnNames()).toEqual([]);
})

test("readSummarizedExperiment with an unnamed object", async () => {
    let se = await jsp.readObject("artifacts/SummarizedExperiment-unnamed", null, test_globals);

    expect(se.numberOfRows()).toBe(100);
    expect(se.numberOfColumns()).toBe(10);
    expect(se.assayNames()).toEqual(["counts"]);

    expect(se.rowNames()).toBeNull();
    expect(se.columnNames()).toBeNull();
    expect(se.rowData().columnNames()).toEqual(["symbol"]);
    expect(se.columnData().columnNames()).toEqual(["label"]);
})

test("readSummarizedExperiment with assay overrides", async () => {
    let se = await jsp.readObject("artifacts/SummarizedExperiment-full", null, test_globals, { 
        SummarizedExperiment_readAssay: function(nr, nc, path, meta, globals, options) {
            let mat = new misc.TestDenseMatrix(nr, nc);
            mat.path = path;
            return mat;
        }
    });

    expect(se.numberOfRows()).toBe(100);
    expect(se.numberOfColumns()).toBe(10);
    expect(se.assay("counts").path).toEqual("artifacts/SummarizedExperiment-full/assays/0");
    expect(se.assay("logcounts").path).toEqual("artifacts/SummarizedExperiment-full/assays/1");
})
