library(alabaster.se)
library(SummarizedExperiment)
dir.create("artifacts", showWarnings=FALSE)

##############################

se <- SummarizedExperiment(
    list(
        counts = matrix(rpois(1000, 2), ncol=10),
        logcounts = matrix(rnorm(1000), ncol=10)
    ),
    rowData = DataFrame(row.names=sprintf("GENE_%s", seq_len(100)), symbol=sprintf("SYM_%s", seq_len(100))),
    colData = DataFrame(row.names=letters[1:10], label=LETTERS[1:10])
)

path <- "artifacts/SummarizedExperiment-full"
unlink(path, recursive=TRUE)
saveObject(se, path)

##############################

se <- SummarizedExperiment()
path <- "artifacts/SummarizedExperiment-empty"
unlink(path, recursive=TRUE)
saveObject(se, path)

##############################

se <- SummarizedExperiment(
    list(counts = matrix(rpois(1000, 2), ncol=10)),
    rowData = DataFrame(symbol=sprintf("SYM_%s", seq_len(100))),
    colData = DataFrame(label=LETTERS[1:10])
)

path <- "artifacts/SummarizedExperiment-unnamed"
unlink(path, recursive=TRUE)
saveObject(se, path)
