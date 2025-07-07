# library(testthat); source("tests/SingleCellExperiment-read.R")

library(alabaster.sce)

test_that("saveSingleCellExperiment works with a full object", {
    validateObject("artifacts2/SingleCellExperiment-full")
    sce <- readObject("artifacts2/SingleCellExperiment-full")

    expect_identical(nrow(sce), 10L)
    expect_identical(ncol(sce), 5L)
    expect_identical(assayNames(sce), c("counts", "logcounts"))

    expect_identical(rownames(sce), sprintf("gene_%s", seq_len(nrow(sce))))
    expect_identical(colnames(sce), sprintf("sample_%s", seq_len(ncol(sce))))
    expect_identical(rowData(sce)$symbol, letters[1:10])
    expect_identical(colData(sce)$label, paste0("foo_", letters[1:5]))

    expect_identical(reducedDimNames(sce), c("TSNE", "UMAP"))
    expect_identical(ncol(reducedDim(sce, 1)), 2L)
    expect_identical(ncol(reducedDim(sce, 2)), 5L)

    expect_identical(altExpNames(sce), "foo")
    expect_identical(nrow(altExp(sce, 1)), 20L)

    expect_identical(mainExpName(sce), "RNA")
})

test_that("saveSingleCellExperiment works with empty objects", {
    validateObject("artifacts2/SingleCellExperiment-empty")
    sce <- readObject("artifacts2/SingleCellExperiment-empty")

    expect_identical(nrow(sce), 0L)
    expect_identical(ncol(sce), 0L)
    expect_identical(length(assayNames(sce)), 0L)

    expect_null(rownames(sce))
    expect_null(colnames(sce))
    expect_identical(ncol(colData(sce)), 0L)
    expect_identical(ncol(rowData(sce)), 0L)

    expect_identical(length(reducedDimNames(sce)), 0L)
    expect_identical(length(altExpNames(sce)), 0L)

    expect_null(mainExpName(sce))
})
