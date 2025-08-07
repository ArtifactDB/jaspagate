import * as jsp from "../src/index.js";
import * as internal from "../src/utils.js";

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
    let contents = await globals.get(path + "/array.h5");
    try {
        const fhandle = await globals.h5open(contents, { readOnly: true });
        const handle_stack = [fhandle];
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
            globals.h5close(fhandle);
        }
    } finally {
        globals.clean(contents);
    }
};

jsp.saveObjectRegistry.push(
    [
        TestDenseMatrix,
        async function(x, path, globals, options) {
            await globals.mkdir(path); 
            await globals.write(path + "/OBJECT", internal.jsonBuffer({ "type": "dense_array", "dense_array": { "version": "1.0" } }));

            const h5path = path + "/array.h5";
            const fhandle = await globals.h5create(h5path);
            let handle_stack = [fhandle];
            let success = false;
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
                success = true;
            } finally {
                for (const handle of handle_stack.reverse()) {
                    handle.close();
                }
                await globals.h5finish(fhandle, !success);
            }
        }
    ] 
);
