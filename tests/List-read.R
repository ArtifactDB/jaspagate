# library(testthat); source("tests/List-read.R")

library(alabaster.base)

test_that("saveList works with all types", {
    validateObject("artifacts2/List-all_types")
    ll <- readObject("artifacts2/List-all_types")

    expect_identical(length(ll), 11L)
    expect_identical(ll[[1]], 1:5 * 1.0)
    expect_identical(ll[[2]], 1:5)
    expect_identical(ll[[3]], 1:5 * 1.0)
    expect_identical(ll[[4]], 1:5 * 1.0)
    expect_identical(ll[[5]], c("foo", "bar"))
    expect_identical(ll[[6]], c(TRUE, FALSE))
    expect_identical(ll[[7]], 1:5)
    expect_identical(ll[[8]], 1:5 * 1.0)
    expect_identical(ll[[9]], c("foo", "bar"))
    expect_identical(ll[[10]], c(TRUE, FALSE))
    expect_null(ll[[11]])
})

test_that("saveList works with names", {
    validateObject("artifacts2/List-named")
    ll <- readObject("artifacts2/List-named")

    expect_identical(length(ll), 6L)
    expect_identical(names(ll), c("base", "integer", "number", "string", "bool", "nothing"))

    expect_identical(names(ll[[2]]), letters[1:5])
    expect_identical(names(ll[[3]]), LETTERS[1:5])
    expect_identical(names(ll[[4]]), c("akari", "alicia"))
    expect_identical(names(ll[[5]]), c("aika", "alice"))
})

test_that("saveList works with scalars", {
    validateObject("artifacts2/List-scalars")
    ll <- readObject("artifacts2/List-scalars")
    expect_identical(ll[[1]], 1)
    expect_identical(ll[[2]], "foo_bar")
    expect_identical(ll[[3]], TRUE) 

    expect_identical(ll[[4]], 1L)
    expect_identical(ll[[5]], 1)
    expect_identical(ll[[6]], "alpha")
    expect_identical(ll[[7]], FALSE)

    expect_identical(ll[[8]], I(1L)) 
    expect_identical(ll[[9]], I(1))
    expect_identical(ll[[10]], I("alpha"))
    expect_identical(ll[[11]], I(FALSE))
})

test_that("saveList works with specials", {
    validateObject("artifacts2/List-specials")
    ll <- readObject("artifacts2/List-specials")
    expect_identical(ll[[1]], c(NaN, Inf, -Inf))
})

test_that("saveList works with out-of-range values", {
    validateObject("artifacts2/List-outofrange")
    ll <- readObject("artifacts2/List-outofrange")
    expect_identical(ll[[1]], c(2^31, -(2^31 + 1)))
})

test_that("saveList works with missingness", {
    validateObject("artifacts2/List-missing")
    ll <- readObject("artifacts2/List-missing")

    expect_identical(ll[[1]], c(1, NA, 3))
    expect_identical(ll[[2]], c(1L, NA, 3L))
    expect_identical(ll[[3]], c("foo", NA, "bar"))
    expect_identical(ll[[4]], c(TRUE, NA, FALSE))
})

test_that("saveList works with nested", {
    validateObject("artifacts2/List-nested")
    ll <- readObject("artifacts2/List-nested")

    expect_identical(names(ll), c("unnamed", "named"))
    expect_identical(ll[[1]], list(1:5*1.0, list(6:8*1.0, 9:10*1.0)))
    expect_identical(ll[[2]], list(foo=1:5*1.0, bar=list(whee="A", stuff="a")))
})

test_that("saveList works with external", {
    validateObject("artifacts2/List-external")
    ll <- readObject("artifacts2/List-external")

    expect_identical(ll[[1]], S4Vectors::DataFrame(A=1:5*1.0))
    expect_identical(ll[[2]], 1:5*1.0)
    expect_identical(ll[[3]], list(LETTERS[1:3], S4Vectors::DataFrame(B=1:5*1.0)))
})
