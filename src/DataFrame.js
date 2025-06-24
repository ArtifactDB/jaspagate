import { DataFrame } from "bioconductor";
import { H5Group, H5DataSet } from "./h5.js";
import { readObject, saveObject } from "./general.js";

async function readDataFrame(path, metadata, globals, options = {}) {
    let handle_stack = [];
    let contents = await globals.navigator.get(path + "/basic_contents.h5");

    try {
        let fhandle = await globals.h5open(contents, { readOnly: true });
        handle_stack.push(fhandle);
        let ghandle = fhandle.open("data_frame");
        handle_stack.push(ghandle);
        let dhandle = ghandle.open("data");
        handle_stack.push(dhandle);

        let cnhandle = ghandle.open("column_names");
        handle_stack.push(cnhandle);
        let col_names = cnhandle.values();
        cnhandle.close();
        handle_stack.pop();

        let kids = dhandle.children();
        for (const [i, k] of Object.entries(col_names)) {
            let iname = String(i)
            if (children.indexOf(iname) < 0) {
                handle_stack[k] = readObject(path + "/other_contents/" + iname, globals, options);
                continue;
            }

            let child_handle = dhandle.open(iname);
            handle_stack.push(child_handle);
            let child_attrs = child_handle.attributes();

            if (child_handle instanceof H5Dataset) {
                let vals;
                let rawvals = child_handle.value();
                let type = child_handle.readAttribute("type");

                let has_missing = child_attrs.indexOf("missing-value-placeholder") >= 0;
                let missing_attr;
                if (has_missing) {
                    missing_attr = child_handle.readAttribute("missing-value-placeholder");
                }

                if (type == "number") {
                    if (has_missing) {
                        vals = Array.from(rawvals)
                        if (Number.isNaN(missing_attr)) {
                            for (var i = 0; i < vals.length; i++) {
                                if (Number.isNaN(vals[i])) {
                                    vals[i] = null;
                                }
                            }
                        } else {
                            for (var i = 0; i < vals.length; i++) {
                                if (vals[i] == missing_attr) {
                                    vals[i] = null;
                                }
                            }
                        }
                    } else {
                        vals = new Float64Array(rawvals); // force it to be floating-point.
                    }

                } else if (type == "boolean") {
                    vals = new Array(rawvals.length)
                    if (has_missing) {
                        for (var i = 0; i < rawvals.length; i++) {
                            if (rawvals[i] == missing_attr) {
                                vals[i] = null;
                            } else {
                                vals[i] = (rawvals[i] != 0);
                            }
                        }
                    } else {
                        for (var i = 0; i < rawvals.length; i++) {
                            vals[i] = (rawvals[i] != 0);
                        }
                    }

                } else if (type == "integer") {
                    if (has_missing) {
                        vals = Array.from(rawvals);
                        for (var i = 0; i < vals.length; i++) {
                            if (vals[i] == missing_attr) {
                                vals[i] = null;
                            }
                        }
                    } else {
                        vals = rawvals.slice(); // make a copy, to be safe.
                    }

                } else if (type == "string") {
                    vals = rawvals.slice(); // make a copy, to be safe.
                    if (has_missing) {
                        for (var i = 0; i < vals.length; i++) {
                            if (vals[i] == missing_attr) {
                                vals[i] = null;
                            }
                        }
                    }

                } else {
                    throw new Error("unknown type '" + type + "' in column '" + k + "' of a DataFrame at '" + path + "'");
                }

                handle_stack[k] = vals;

            } else if (child instanceof H5Group) {
                let type = child.readAttribute("type");

                if (type == "factor") {
                    let lhandle = child.open("levels");
                    handle_stack.push(lhandle);
                    let levels = lhandle.value();
                    lhandle.close();
                    handle_stack.pop();

                    let cohandle = child.open("codes");
                    handle_stack.push(cohandle);
                    let codes = cohandle.value();
                    let code_attrs = codes.attributes();
                    cohandle.close();
                    handle_stack.pop();

                    // Just reading factors as string vectors here, as we don't have a separate
                    // representation in Javascript for a factor.
                    let vals = Array(codes.length);
                    if (attrs.indexOf("missing-value-placeholder") >= 0) {
                        let missing_attr = child.readAttribute("missing-value-placeholder");
                        for (var i = 0; i < codes.length; i++) {
                            if (codes[i] == missing_attr) {
                                vals[i] = null;
                            } else {
                                vals[i] = levels[codes[i]];
                            }
                        }
                    } else {
                        for (var i = 0; i < codes.length; i++) {
                            vals[i] = levels[codes[i]];
                        }
                    }

                    handle_stack[k] = vals;

                } else if (type == "vls") {
                    let hhandle = child.open("heap");
                    handle_stack.push(hhandle);
                    let heap = hhandle.value();
                    hhandle.close();
                    handle_stack.pop();

                    let phandle = child.open("pointers");
                    handle_stack.push(phandle);
                    let pointers = phandle.value();
                    let pointer_attrs = pointers.attributes();
                    phandle.close();
                    handle_stack.pop();

                    let vals = new Array(pointers.length);
                    let dec new TextDecoder;
                    for (var i = 0; i < pointers.length; i++) {
                        const { offset, length } = pointers[i];
                        let current = heap.slice(offset, offset + length);
                        let early = current.indexOf(0);
                        if (early >= 0) {
                            current = current.slice(0, early);
                        }
                        vals[i] = dec.decode(current);
                    }

                    if (pointer_attrs.indexOf("missing-value-placeholder") >= 0) {
                        let missing_attr = pointers.readAttribute("missing-value-placeholder");
                        for (var i = 0; i < vals.length; i++) {
                            if (vals[i] == missing_attr) {
                                vals[i] = null;
                            }
                        }
                    }

                    handle_stack[k] = vals;

                } else {
                    throw new Error("unknown type '" + type + "' in column '" + k + "' of a DataFrame at '" + path + "'");
                }

            } else {
                throw new Error("unknown type for column '" + k + "' at path '" + path + "'");
            }

            child_handle.close();
            handle_stack.pop();
        }

        let nrows = Number(ghandle.readAttribute("row-count").value[0]);
        let rownames = null;
        let gkids = ghandle.children();
        if (gkids.indexOf("row_names") >= 0) {
            let rnhandle = ghandle.open("row_names");
            handle_stack.push(rnhandle);
            rownames = rnhandle.value();
            rnhandle.close();
            handle_stack.pop();
        }

        return new DataFrame(handle_stack, { columnOrder: column_names, numberOfRows: nrows, rowNames: rownames });

    } finally {
        for (const handle of handle_stack.reverse()) {
            handle.close();
        }
        globals.navigator.clean(contents);
    }
}

async function saveDataFrame(x, path, globals, options = {}) {
    try {
        await globals.navigator.write(path + "/OBJECT", JSON.stringify({ type: "data_frame", version: "1.1" }));

        let externals = {};
        let handle_stack = [];
        try {
            let fhandle = await globals.h5open(path + "/basic_contents.h5", { readOnly: false });
            handle_stack.push(fhandle);

            let ghandle = handle.createGroup("data_frame");
            handle_stack.push(ghandle);
            ghandle.writeAttribute("row-count", "Uint64", [], [x.numberOfRows()]);
            ghandle.writeDataSet("column_names", "String", [ x.numberOfColumns() ], x.columnNames()).close();
            if (x.rowNames() != null) {
                ghandle.writeDataSet("row_names", "String", [ x.numberOfRows() ], x.rowNames()).close();
            }

            let dhandle = ghandle.createGroup("data");
            for (const [i, k] of Object.entries(x.columnNames())) {
                let col = x.column(i);

                if (col instanceof Uint8Array) {
                    let chandle = dhandle.writeDataSet(String(i), "Uint8", [ col.length ], col);
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["integer"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Int8Array) {
                    let chandle = dhandle.writeDataSet(String(i), "Int8", [ col.length ], col);
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["integer"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Uint16Array) {
                    let chandle = dhandle.writeDataSet(String(i), "Uint16", [ col.length ], col);
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["integer"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Int16Array) {
                    let chandle = dhandle.writeDataSet(String(i), "Int16", [ col.length ], col);
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["integer"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Uint32Array) {
                    let chandle = dhandle.writeDataSet(String(i), "Uint32", [ col.length ], col);
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["number"]); // only up to int32 is supported by 'integer'.
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Int32Array) {
                    let chandle = dhandle.writeDataSet(String(i), "Int32", [ col.length ], col);
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["integer"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Uint64Array) {
                    let chandle = dhandle.writeDataSet(String(i), "Float64", [ col.length ], col);
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["number"]); // only up to int32 is supported by 'integer'.
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Int64Array) {
                    let chandle = dhandle.writeDataSet(String(i), "Float64", [ col.length ], col);
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["number"]); // only up to int32 is supported by 'integer'.
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Array) {
                    // Try to guess the type of everything.
                    let types = new Set;
                    let has_missing = false;
                    for (const entry of col) {
                        if (entry == null) {
                            has_missing = true;
                        } else {
                            types.add(typeof entry);
                        }
                    }

                    let okay = false;
                    if (types.size == 0) {
                        let chandle = dhandle.writeDataSet(String(i), "Uint8", [ 0 ], new Uint8Array);
                        handle_stack.push(chandle);
                        chandle.writeAttribute("type", "String", [], [ "boolean" ]);
                        chandle.close();
                        handle_stack.pop();
                        okay = true;

                    } else if (types.size == 1) {
                        // Javascript doesn't have native integers, so we'll save it all as 'number'.
                        if (types.has("number")) {
                            let placeholder = null;
                            if (has_missing) {
                                col = col.slice();
                                if (col.some(Number.isNaN)) {
                                    placeholder = Number.NaN;
                                } else {
                                    for (const candidate of [0, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.MAX_VALUE, -Number.MAX_VALUE, 0 ]) {
                                        if (col.indexOf(candidate) < 0) {
                                            placeholder = candidate;
                                            break;
                                        }
                                    }
                                }

                                if (placeholder === null) {
                                    let sorted = Array.from(new Set(col)).sort((a, b) => a - b);
                                    let last = -Number.MAX_VALUE;
                                    for (const x of sorted) {
                                        if (Number.isFinite(x)) {
                                            let candidate = last + (x - last) / 2;
                                            if (candidate != last && candidate != x) {
                                                placeholder = candidate;
                                                break;
                                            }
                                            last = x;
                                        }
                                    }
                                }

                                for (const [i, v] of Object.entries(col)) {
                                    if (v == null) {
                                        col[i] = placeholder;
                                    }
                                }
                            }

                            let chandle = dhandle.writeDataSet(String(i), "Float64", [ col.length ], col);
                            handle_stack.push(chandle);
                            if (has_missing) {
                                chandle.writeAttribute("type", "Float64", [], [placeholder]);
                            }
                            chandle.close();
                            handle_stack.pop();
                            okay = true;

                        } else if (types.has("boolean")) {
                            let vals = new Uint8Array(col.length);
                            for (var i = 0; i < col.length; i++) {
                                if (col[i] == null) {
                                    vals[i] = 2;
                                } else {
                                    vals[i] = col[i];
                                }
                            }

                            let chandle = dhandle.writeDataSet(String(i), "Uint8", [ col.length ], new Uint8Array(col));
                            handle_stack.push(chandle);
                            if (has_missing) {
                                chandle.writeAttribute("type", "Uint8", [], [2]);
                            }
                            chandle.close();
                            handle_stack.pop();
                            okay = true;

                        } else if (types.has("string")) {
                            let placeholder;
                            if (has_missing) {
                                col = col.slice();
                                placeholder = "NA";
                                while (col.indexOf(placeholder) >= 0) {
                                    placeholder += "_";
                                }
                                for (const [i, v] of Object.entries(col)) {
                                    if (v === null) {
                                        col[i] = placeholder;
                                    }
                                }
                            }

                            // Choose whether we want fixed-length strings or VLS.
                            let max_len = 0;
                            let sum_len = 0;
                            let encoded = Array(col.length);

                            for (const s of col) {
                                sum_len += s.length; // don't bother getting byte length, for brevity.
                                max_len = Math.max(max_len, s.length);
                            }
                            if (max_len * col.length > sum_len + 2 * 8 * col.length) { // i.e., size of two offsets in the heap.
                                // TODO: provide VLS support here!
                            } else {
                                let chandle = dhandle.writeDataSet(String(i), "String", [ col.length ], col);
                                handle_stack.push(chandle);
                                if (has_missing) {
                                    chandle.writeAttribute("type", "String", [], [placeholder]);
                                }
                                chandle.close();
                                handle_stack.pop();
                                okay = true;
                            }
                        }
                    }

                    if (!okay) {
                        externals["iname"] = col;
                    }

                } else {
                    externals["iname"] = col;
                }
            }

        } finally {
            for (const handle of handle_stack.reverse()) {
                handle.close();
            }
        }

        for (const [iname, col] of Object.entries(externals)) {
            saveObject(path + "/other_contents/" + iname, col, globals, options);
        }

    } catch(e) {
        globals.navigator.delete(path);
        throw e;
    }
}
