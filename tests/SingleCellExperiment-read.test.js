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

    expect(sce.mainExperimentName()).toBe("RNA");
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

    expect(sce.mainExperimentName()).toBeNull();
})

test("readSingleCellExperiment with reduced dimension overrides", async () => {
    let sce = await jsp.readObject("artifacts/SingleCellExperiment-full", null, test_globals, { SingleCellExperiment_readReducedDimension: false });
    expect(sce.reducedDimensionNames()).toEqual([]);

    let sce2 = await jsp.readObject("artifacts/SingleCellExperiment-full", null, test_globals, {
        SingleCellExperiment_readReducedDimension: function(nc, path, meta, globals, options) {
            return new misc.TestDenseMatrix(nc, 0);
        }
    });
    expect(sce2.reducedDimensionNames()).toEqual(["TSNE", "UMAP"]);
    expect(sce2.reducedDimension(0).numberOfColumns()).toEqual(0);
    expect(sce2.reducedDimension(1).numberOfColumns()).toEqual(0);
})

test("readSingleCellExperiment with alternative experiment overrides", async () => {
    let sce = await jsp.readObject("artifacts/SingleCellExperiment-full", null, test_globals, { SingleCellExperiment_readAlternativeExperiment: false });
    expect(sce.alternativeExperimentNames()).toEqual([]);

    let sce2 = await jsp.readObject("artifacts/SingleCellExperiment-full", null, test_globals, {
        SingleCellExperiment_readAlternativeExperiment: function(nc, path, meta, globals, options) {
            return new bioc.SummarizedExperiment({}, { 
                columnData: new bioc.DataFrame({}, { numberOfRows: nc }),
                rowData: new bioc.DataFrame({}, { numberOfRows: 0 }),
            });
        }
    });
    expect(sce2.alternativeExperimentNames()).toEqual(["foo"]);
    expect(sce2.alternativeExperiment(0).numberOfRows()).toEqual(0);
})
