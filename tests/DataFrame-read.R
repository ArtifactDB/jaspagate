# library(testthat); source("tests/DataFrame-read.R")

library(alabaster.base)

test_that("saveDataFrame works with all types", {
    validateObject("artifacts2/DataFrame-all_types")
    df <- readObject("artifacts2/DataFrame-all_types")

    expect_identical(df$i8, 1:10)
    expect_identical(df$u8, 1:10)
    expect_identical(df$i16, 1:10)
    expect_identical(df$u16, 1:10)
    expect_identical(df$i32, 1:10)
    expect_identical(df$u32, as.numeric(1:10))
    expect_identical(df$i64, as.numeric(1:10))
    expect_identical(df$u64, as.numeric(1:10))
    expect_identical(df$f32, as.numeric(1:10))
    expect_identical(df$f64, as.numeric(1:10))
    expect_identical(df$number, (1:10)/2)
    expect_identical(df$string, paste0("foo_", letters[1:10]))
    expect_identical(df$boolean, rep(c(TRUE, FALSE), 5))
    expect_identical(rownames(df), paste0("sample_", 1:10))
})

test_that("saveDataFrame works with missing values", {
    validateObject("artifacts2/DataFrame-missing")
    df <- readObject("artifacts2/DataFrame-missing")

    expect_identical(df$number, c(0.5,NA,1.5,2,2.5,3,3.5,4,4.5,5))
    expect_identical(df$number_with_NaN, c(0.5,NA,NaN,2,2.5,3,3.5,4,4.5,5))
    expect_identical(df$number_with_every_special, c(Inf,NA,NaN,0,-Inf,.Machine$double.xmax,-.Machine$double.xmax,4,4.5,5))
    expect_identical(df$string, c("foo_a","foo_b","foo_c",NA,"foo_e","foo_f","foo_g","foo_h","foo_i","foo_j"))
    expect_identical(df$string_with_na, c("foo_a","foo_b","NA",NA,"foo_e","foo_f","foo_g","foo_h","foo_i","foo_j"))
    expect_identical(df$boolean, c(TRUE,FALSE,TRUE,FALSE,NA,FALSE,TRUE,FALSE,TRUE,FALSE))
    expect_null(rownames(df))
})

test_that("saveDataFrame works with nested objects", {
    validateObject("artifacts2/DataFrame-nested")
    df <- readObject("artifacts2/DataFrame-nested")

    expect_s4_class(df$X, "DataFrame")
    expect_identical(df$X$foo, 1:10)
    expect_identical(df$X$bar, letters[1:10])
    expect_identical(df$Y, LETTERS[1:10])
})

test_that("saveDataFrame works with metadata", {
    validateObject("artifacts2/DataFrame-metadata")
    df <- readObject("artifacts2/DataFrame-metadata")
    expect_identical(S4Vectors::metadata(df), list(foo=1, bar=LETTERS[1:3]))
})

test_that("saveDataFrame works with custom objects", {
    validateObject("artifacts2/DataFrame-custom")
    df <- readObject("artifacts2/DataFrame-custom")
    expect_identical(df$whee, logical(5))
    expect_s4_class(df$X, "DFrame")
    expect_identical(df$X$Y, c(1,2,3,4,5))
})
