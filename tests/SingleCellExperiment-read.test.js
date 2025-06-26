import * as bioc from "bioconductor";
import { test_globals } from "./globals.js";
import * as misc from "./matrix.js";
import * as jsp from "../src/index.js";

test("readSingleCellExperiment with full contents", async () => {
    let sce = await jsp.readObject("artifacts/SingleCellExperiment-full", null, test_globals);

    expect(sce.numberOfRows()).toBe(100);
    expect(sce.numberOfColumns()).toBe(10);
    expect(sce.assayNames()).toEqual(["counts", "logcounts"]);

    expect(sce.rowNames()[0]).toBe("GENE_1");
    expect(sce.rowNames()[99]).toBe("GENE_100");
    expect(sce.columnNames()[0]).toBe("a");
    expect(sce.columnNames()[9]).toBe("j");

    expect(sce.rowData().columnNames()).toEqual(["symbol"]);
    expect(sce.columnData().columnNames()).toEqual(["label"]);

    expect(sce.reducedDimensionNames()).toEqual(["TSNE", "UMAP"]);
    expect(sce.reducedDimension("TSNE").numberOfColumns()).toEqual(2);
    expect(sce.reducedDimension("UMAP").numberOfColumns()).toEqual(5);

    expect(sce.alternativeExperimentNames()).toEqual(["foo"]);
    expect(sce.alternativeExperiment(0).numberOfRows()).toEqual(20);
})

test("readSingleCellExperiment with an empty object", async () => {
    let sce = await jsp.readObject("artifacts/SingleCellExperiment-empty", null, test_globals);

    expect(sce.numberOfRows()).toBe(0);
    expect(sce.numberOfColumns()).toBe(0);
    expect(sce.assayNames()).toEqual([]);

    expect(sce.rowData().columnNames()).toEqual([]);
    expect(sce.columnData().columnNames()).toEqual([]);

    expect(sce.reducedDimensionNames()).toEqual([]);
    expect(sce.alternativeExperimentNames()).toEqual([]);
})
