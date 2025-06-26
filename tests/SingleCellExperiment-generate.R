library(alabaster.se)
library(SingleCellExperiment)
dir.create("artifacts", showWarnings=FALSE)

##############################

sce <- SingleCellExperiment(
    list(
        counts = matrix(rpois(1000, 2), ncol=10),
        logcounts = matrix(rnorm(1000), ncol=10)
    ),
    rowData = DataFrame(row.names=sprintf("GENE_%s", seq_len(100)), symbol=sprintf("SYM_%s", seq_len(100))),
    colData = DataFrame(row.names=letters[1:10], label=LETTERS[1:10]),
    reducedDims = list(TSNE=matrix(runif(20), ncol=2), UMAP=matrix(runif(50), ncol=5))
)

altExp(sce, "foo", withDimnames=FALSE) <- SummarizedExperiment(list(whee=matrix(runif(200), ncol=10)))

path <- "artifacts/SingleCellExperiment-full"
unlink(path, recursive=TRUE)
saveObject(sce, path)

##############################

sce <- SingleCellExperiment()
path <- "artifacts/SingleCellExperiment-empty"
unlink(path, recursive=TRUE)
saveObject(sce, path)
