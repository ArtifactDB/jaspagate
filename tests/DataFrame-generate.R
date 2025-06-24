library(alabaster.base)
library(S4Vectors)
dir.create("artifacts", showWarnings=FALSE)

##############################

all_types <- DataFrame(
    integer = 1:10,
    real = (1:10) * 0.5,
    string = paste0("foo_", letters[1:10]),
    factor = factor(paste0("bar_", LETTERS[1:10])),
    vls = c(strrep("WHEE", 100), character(9)),
    boolean = rep(c(TRUE, FALSE), 5),
    row.names = paste0("sample_", 1:10)
)

path <- "artifacts/DataFrame-all_types"
unlink(path, recursive=TRUE)
saveObject(all_types, path)

##############################

missingness <- all_types
rownames(missingness) <- NULL
for (col in seq_along(missingness)) {
    missingness[5,col] <- NA
}

path <- "artifacts/DataFrame-missing"
unlink(path, recursive=TRUE)
saveObject(missingness, path)

##############################

nested <- DataFrame(X=I(DataFrame(foo=1:10, bar=letters[1:10])), Y=LETTERS[1:10])
path <- "artifacts/DataFrame-nested"
unlink(path, recursive=TRUE)
saveObject(nested, path)
