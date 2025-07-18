import * as jsp from "../src/index.js";

export class TestDenseMatrix {
    #rows;
    #columns;

    constructor(nr, nc) {
        this.#rows = nr;
        this.#columns = nc;
    }

    numberOfRows() {
        return this.#rows;
    }

    numberOfColumns() {
        return this.#columns;
    }

    _bioconductor_NUMBER_OF_ROWS() {
        return this.numberOfRows();
    }

    _bioconductor_NUMBER_OF_COLUMNS() {
        return this.numberOfColumns();
    }
}

jsp.readObjectRegistry["dense_array"] = async function(path, metadata, globals, options) {
    let contents = await globals.fs.get(path + "/array.h5");
    const handle_stack = [];

    const fhandle = await globals.h5.open(contents, { readOnly: true });
    handle_stack.push(fhandle);
    try {
        let ghandle = fhandle.open("dense_array");
        handle_stack.push(ghandle);
        let dhandle = ghandle.open("data");
        handle_stack.push(dhandle);

        let shape = dhandle.shape();
        if (ghandle.attributes().indexOf("transposed") >= 0 && ghandle.readAttribute("transposed").values[0] != 0) {
            return new TestDenseMatrix(shape[1], shape[0]);
        } else {
            return new TestDenseMatrix(shape[0], shape[1]);
        }
    } finally {
        for (const handle of handle_stack.reverse()) {
            handle.close();
        }
        globals.fs.clean(contents);
    }
};

jsp.saveObjectRegistry.push(
    [
        TestDenseMatrix,
        async function(x, path, globals, options) {
            await globals.fs.mkdir(path); 
            await globals.fs.write(path + "/OBJECT", JSON.stringify({ "type": "dense_array", "dense_array": { "version": "1.0" } }));

            const handle_stack = [];
            const fhandle = await globals.h5.open(path + "/array.h5", { readOnly: false });
            handle_stack.push(fhandle);
            try {
                let ghandle = fhandle.createGroup("dense_array");
                handle_stack.push(ghandle);
                ghandle.writeAttribute("type", "String", [], ["integer"]);
                let dhandle = ghandle.createDataSet(
                    "data",
                    "Int32",
                    [x.numberOfRows(), x.numberOfColumns()],
                    { data: new Int32Array(x.numberOfRows() * x.numberOfColumns()) }
                );
                handle_stack.push(dhandle);
            } finally {
                for (const handle of handle_stack.reverse()) {
                    handle.close();
                }
            }
        }
    ] 
);
