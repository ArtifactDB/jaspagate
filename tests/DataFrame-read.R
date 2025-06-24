# library(testthat); source("DataFrame-read.R")

library(alabaster.base)

test_that("saveDataFrame works with all types", {
    validateObject("artifacts2/DataFrame-all_types")
    df <- readObject("artifacts2/DataFrame-all_types")

})
