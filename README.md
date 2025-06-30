# Read and save takane objects in Javascript

[![Unit tests](https://github.com/ArtifactDB/jaspilite/actions/workflows/run-tests.yaml/badge.svg)](https://github.com/ArtifactDB/jaspilite/actions/workflows/run-tests.yaml)
[![Build docs](https://github.com/ArtifactDB/jaspilite/actions/workflows/build-docs.yaml/badge.svg)](https://github.com/ArtifactDB/jaspilite/actions/workflows/build-docs.yaml)

## Overview

The **jaspilite** package provides methods for reading and saving [**takane**](https://github.com/ArtifactDB/takane)-formatted objects in Javascript.
This enables web applications to interoperate with R and Python workflows involving complex data structures like the [`SummarizedExperiment`](https://bioconductor.org/packages/SummarizedExperiment).
For example, [**kana**](https://github.com/kanaverse/kana) can use **jaspilite** to pull datasets managed by the [**scRNAseq** R package](https://github.com/LTLA/scRNAseq);
conversely, analysis results can be downloaded for further inspection in Python via the [**dolomite**](https://github.com/ArtifactDB/dolomite-base) framework.

## Getting started

First, we have to tell **jaspilite** how to read and write a HDF5 file.
This requires application-specific implementations of the [`H5Group`](https://artifactdb.github.io/jaspilite/H5Group.html) and [`H5DataSet`](https://artifactdb.github.io/jaspilite/H5DataSet.html) interfaces.
For example, we could use the [**h5wasm**](https://github.com/usnistgov/h5wasm) package (as shown in [`tests/h5.js`](tests/h5.js)) or the HDF5-reading utilities in [**scran.js**](https://github.com/kana/scran.js).
The exact implementation is left to the application developer to ensure that only one copy of the HDF5-parsing library (typically a WebAssembly binary) is bundled into the application.

We then define a `globals` object that specifies how to open a "file" in our Javascript-based application.
This should implement the [`GlobalFsInterface`](https://artifactdb.github.io/jaspilite/GlobalFsInterface.html) and [`GlobalH5Interface`](https://artifactdb.github.io/jaspilite/GlobalH5Interface.html) interfaces. 
In a backend environment like Node.js, setting up this object is pretty easy as described in [`tests/globals.js`](tests/globals.js).
For the browser, the process of acquiring a file path is more involved as direct access to the filesystem is not typically allowed;
instead, we need to either return the contents of the file as a `Uint8Array` or write to a virtual filesystem.

Phew.
Once we've done all that, we can finally read our objects.

```js
import * as jsp from "jaspilite";
let obj = await jsp.readObject(path, /* metadata = */ null, globals);
await jsp.saveObject(obj, "new/copy/of/object", globals);
```

Check out the [reference documentation](https://artifactdb.github.io/jaspilite) for more details.

## Supported objects

Currently, we only support a small number of **takane** formats.

- `data_frame` objects are loaded as [`DataFrame`](https://ltla.github.io/bioconductor.js/DataFrame.html) instances, with the following caveats:
  - Annotations on the columns are not loaded.
  - Metadata is not loaded or saved.
- `summarized_experiment` objects are loaded as [`SummarizedExperiment`](https://ltla.github.io/bioconductor.js/SummarizedExperiment.html) instances, with the following caveats:
  - To read or save assays, each application should define and register their own functions
    in [`readObjectRegistry`](https://artifactdb.github.io/jaspilite/readObjectRegistry) and [`saveObjectRegistry`](https://artifactdb.github.io/jaspilite/saveObjectRegistry).
    This ensures that large datasets are directly converted to application-specific representations for optimal efficiency.
  - Metadata is not loaded or saved.
- `ranged_summarized_experiment` objects are loaded as [`RangedSummarizedExperiment`](https://ltla.github.io/bioconductor.js/RangedSummarizedExperiment.html) instances, with the following caveats:
  - Everything mentioned for `summarized_experiment`.
  - Non-empty row ranges are not loaded or saved.
- `single_cell_experiment` objects are loaded as [`SingleCellExperiment`](https://ltla.github.io/bioconductor.js/SingleCellExperiment.html) instances, with the following caveats:
  - Everything mentioned for `ranged_summarized_experiment`.
  - The main experiment name is not loaded or saved.

If you need something for your application, make an [issue](https://github.com/jaspilite/issues) and we'll see what we can do.

## Links

The [**takane**](https://github.com/ArtifactDB/takane) specifications, which describe the file representation of each object.

The [**alabaster.base**](https://github.com/ArtifactDB/alabaster.base) R package, to read and write **takane**-formatted objects in R.

The [**dolomite-base**](https://github.com/ArtifactDB/dolomite-base) Python package, to read and write **takane**-formatted objects in Python.
