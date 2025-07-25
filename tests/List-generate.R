library(alabaster.base)
library(S4Vectors)
dir.create("artifacts", showWarnings=FALSE)

##############################

all_types <- list(
    1:10,
    (1:10) * 0.5,
    paste0("foo_", letters[1:10]),
    factor(paste0("bar_", LETTERS[1:10])),
    rep(c(TRUE, FALSE), 5),
    NULL
)

path <- "artifacts/List-all_types"
unlink(path, recursive=TRUE)
saveObject(all_types, path)

##############################

named <- all_types
names(named) <- c("integer", "number", "string", "factor", "boolean", "nothing")
for (n in names(named)) {
    if (!is.null(named[[n]])) {
        names(named[[n]]) <- head(letters, length(named[[n]]))
    }
}
path <- "artifacts/List-named"
unlink(path, recursive=TRUE)
saveObject(named, path)

##############################

scalars <- list(1L, 1.5, "foo_bar", TRUE)
path <- "artifacts/List-scalars"
unlink(path, recursive=TRUE)
saveObject(scalars, path)

##############################

specials <- list(c(NaN, Inf, -Inf))
path <- "artifacts/List-specials"
unlink(path, recursive=TRUE)
saveObject(specials, path)

##############################

missingness <- list(c(1L, NA, 3L), c(1.5, NA, 2.5), c("foo", NA, "bar"), factor(c("whee", NA, "stuff")), c(TRUE, NA, FALSE))
path <- "artifacts/List-missing"
unlink(path, recursive=TRUE)
saveObject(missingness, path)

##############################

nested <- list(
    unnamed = list(1:5, list(6:8, 9:10)),
    named = list(foo=1:5, bar=list(whee="A", stuff="a"))
)
path <- "artifacts/List-nested"
unlink(path, recursive=TRUE)
saveObject(nested, path)

##############################

external <- list(
    DataFrame(A=1:5),
    1:5,
    list(LETTERS[1:3], DataFrame(B=1:5))
)
path <- "artifacts/List-external"
unlink(path, recursive=TRUE)
saveObject(external, path)
