# library(testthat); source("tests/SummarizedExperiment-read.R")

library(alabaster.se)

test_that("saveSummarizedExperiment works with a full object", {
    validateObject("artifacts2/SummarizedExperiment-full")
    se <- readObject("artifacts2/SummarizedExperiment-full")

    expect_identical(nrow(se), 10L)
    expect_identical(ncol(se), 5L)
    expect_identical(assayNames(se), c("counts", "logcounts"))

    expect_identical(rownames(se), sprintf("gene_%s", seq_len(nrow(se))))
    expect_identical(colnames(se), sprintf("sample_%s", seq_len(ncol(se))))
    expect_identical(rowData(se)$symbol, letters[1:10])
    expect_identical(colData(se)$label, paste0("foo_", letters[1:5]))
})

test_that("saveSummarizedExperiment works with empty objects", {
    validateObject("artifacts2/SummarizedExperiment-empty")
    se <- readObject("artifacts2/SummarizedExperiment-empty")

    expect_identical(nrow(se), 0L)
    expect_identical(ncol(se), 0L)
    expect_identical(length(assayNames(se)), 0L)

    expect_null(rownames(se))
    expect_null(colnames(se))
    expect_identical(ncol(colData(se)), 0L)
    expect_identical(ncol(rowData(se)), 0L)
})

test_that("saveSummarizedExperiment works with unnamed objects", {
    validateObject("artifacts2/SummarizedExperiment-unnamed")
    se <- readObject("artifacts2/SummarizedExperiment-unnamed")

    expect_identical(nrow(se), 10L)
    expect_identical(ncol(se), 5L)
    expect_identical(assayNames(se), c("counts", "logcounts"))

    expect_null(rownames(se))
    expect_null(colnames(se))
    expect_identical(rowData(se)$symbol, letters[1:10])
    expect_identical(colData(se)$label, paste0("foo_", letters[1:5]))
})
