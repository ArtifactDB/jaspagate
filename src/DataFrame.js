import { DataFrame } from "bioconductor";
import { H5Group, H5DataSet } from "./h5.js";
import { readObject, saveObject } from "./general.js";

export async function readDataFrame(path, metadata, globals, options = {}) {
    let handle_stack = [];
    let contents = await globals.fs.get(path + "/basic_columns.h5");

    try {
        let fhandle = await globals.h5.open(contents, { readOnly: true });
        handle_stack.push(fhandle);
        let ghandle = fhandle.open("data_frame");
        handle_stack.push(ghandle);
        let dhandle = ghandle.open("data");
        handle_stack.push(dhandle);

        let cnhandle = ghandle.open("column_names");
        handle_stack.push(cnhandle);
        let colnames = cnhandle.values();
        cnhandle.close();
        handle_stack.pop();

        let collected = {};
        let kids = dhandle.children();
        for (const [i, k] of Object.entries(colnames)) {
            let iname = String(i)
            if (kids.indexOf(iname) < 0) {
                collected[k] = await readObject(path + "/other_columns/" + iname, null, globals, options);
                continue;
            }

            let child_handle = dhandle.open(iname);
            handle_stack.push(child_handle);

            if (child_handle instanceof H5DataSet) {
                let vals;
                let rawvals = child_handle.values();
                let type = child_handle.readAttribute("type").values[0];

                let child_attrs = child_handle.attributes();
                let has_missing = child_attrs.indexOf("missing-value-placeholder") >= 0;
                let missing_attr;
                if (has_missing) {
                    missing_attr = child_handle.readAttribute("missing-value-placeholder").values[0];
                }

                if (type == "number") {
                    if (has_missing) {
                        vals = Array.from(rawvals)
                        if (Number.isNaN(missing_attr)) {
                            for (let i = 0; i < vals.length; i++) {
                                if (Number.isNaN(vals[i])) {
                                    vals[i] = null;
                                }
                            }
                        } else {
                            for (let i = 0; i < vals.length; i++) {
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
                        for (let i = 0; i < rawvals.length; i++) {
                            if (rawvals[i] == missing_attr) {
                                vals[i] = null;
                            } else {
                                vals[i] = (rawvals[i] != 0);
                            }
                        }
                    } else {
                        for (let i = 0; i < rawvals.length; i++) {
                            vals[i] = (rawvals[i] != 0);
                        }
                    }

                } else if (type == "integer") {
                    if (has_missing) {
                        vals = Array.from(rawvals);
                        for (let i = 0; i < vals.length; i++) {
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
                        for (let i = 0; i < vals.length; i++) {
                            if (vals[i] == missing_attr) {
                                vals[i] = null;
                            }
                        }
                    }

                } else {
                    throw new Error("unknown type '" + type + "' in column '" + k + "' of a DataFrame at '" + path + "'");
                }

                collected[k] = vals;

            } else if (child_handle instanceof H5Group) {
                let type = child_handle.readAttribute("type").values[0];

                if (type == "factor") {
                    let lhandle = child_handle.open("levels");
                    handle_stack.push(lhandle);
                    let levels = lhandle.values();
                    lhandle.close();
                    handle_stack.pop();

                    let cohandle = child_handle.open("codes");
                    handle_stack.push(cohandle);
                    let codes = cohandle.values();
                    let code_attrs = cohandle.attributes();

                    // Just reading factors as string vectors here, as we don't have a separate
                    // representation in Javascript for a factor.
                    let vals = Array(codes.length);
                    if (code_attrs.indexOf("missing-value-placeholder") >= 0) {
                        let missing_attr = cohandle.readAttribute("missing-value-placeholder").values[0];
                        for (let i = 0; i < codes.length; i++) {
                            if (codes[i] == missing_attr) {
                                vals[i] = null;
                            } else {
                                vals[i] = levels[codes[i]];
                            }
                        }
                    } else {
                        for (let i = 0; i < codes.length; i++) {
                            vals[i] = levels[codes[i]];
                        }
                    }

                    collected[k] = vals;
                    cohandle.close();
                    handle_stack.pop();

                } else if (type == "vls") {
                    let hhandle = child_handle.open("heap");
                    handle_stack.push(hhandle);
                    let heap = hhandle.values();
                    hhandle.close();
                    handle_stack.pop();

                    let phandle = child_handle.open("pointers");
                    handle_stack.push(phandle);
                    let pointers = phandle.values();
                    let pointer_attrs = phandle.attributes();

                    let vals = new Array(pointers.length);
                    let dec = new TextDecoder;
                    for (let i = 0; i < pointers.length; i++) {
                        const { offset, length } = pointers[i];
                        let current = heap.slice(Number(offset), Number(offset + length));
                        let early = current.indexOf(0);
                        if (early >= 0) {
                            current = current.slice(0, early);
                        }
                        vals[i] = dec.decode(current);
                    }

                    if (pointer_attrs.indexOf("missing-value-placeholder") >= 0) {
                        let missing_attr = phandle.readAttribute("missing-value-placeholder").values[0];
                        for (let i = 0; i < vals.length; i++) {
                            if (vals[i] == missing_attr) {
                                vals[i] = null;
                            }
                        }
                    }

                    collected[k] = vals;
                    phandle.close();
                    handle_stack.pop();

                } else {
                    throw new Error("unknown type '" + type + "' in column '" + k + "' of a DataFrame at '" + path + "'");
                }

            } else {
                throw new Error("unknown type for column '" + k + "' at path '" + path + "'");
            }

            child_handle.close();
            handle_stack.pop();
        }

        let nrows = Number(ghandle.readAttribute("row-count").values[0]);
        let rownames = null;
        let gkids = ghandle.children();
        if (gkids.indexOf("row_names") >= 0) {
            let rnhandle = ghandle.open("row_names");
            handle_stack.push(rnhandle);
            rownames = rnhandle.values();
            rnhandle.close();
            handle_stack.pop();
        }

        return new DataFrame(collected, { columnOrder: colnames, numberOfRows: nrows, rowNames: rownames });

    } finally {
        for (const handle of handle_stack.reverse()) {
            handle.close();
        }
        globals.fs.clean(contents);
    }
}

export async function saveDataFrame(x, path, globals, options = {}) {
    await globals.fs.mkdir(path);
    try {
        await globals.fs.write(path + "/OBJECT", JSON.stringify({ type: "data_frame", data_frame: { version: "1.1" } }));

        let externals = {};
        let handle_stack = [];
        try {
            let fhandle = await globals.h5.open(path + "/basic_columns.h5", { readOnly: false });
            handle_stack.push(fhandle);

            let ghandle = fhandle.createGroup("data_frame");
            handle_stack.push(ghandle);
            ghandle.writeAttribute("row-count", "Uint64", [], [x.numberOfRows()]);
            ghandle.createDataSet("column_names", "String", [ x.numberOfColumns() ], { data: x.columnNames(), returnHandle: false });
            if (x.rowNames() != null) {
                ghandle.createDataSet("row_names", "String", [ x.numberOfRows() ], { data: x.rowNames(), returnHandle: false });
            }

            let dhandle = ghandle.createGroup("data");
            for (const [i, k] of Object.entries(x.columnNames())) {
                let iname = String(i);
                let col = x.column(k);

                if (col instanceof Uint8Array) {
                    let chandle = dhandle.createDataSet(iname, "Uint8", [ col.length ], { data: col });
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["integer"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Int8Array) {
                    let chandle = dhandle.createDataSet(iname, "Int8", [ col.length ], { data: col });
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["integer"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Uint16Array) {
                    let chandle = dhandle.createDataSet(iname, "Uint16", [ col.length ], { data: col });
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["integer"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Int16Array) {
                    let chandle = dhandle.createDataSet(iname, "Int16", [ col.length ], { data: col });
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["integer"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Uint32Array) {
                    let chandle = dhandle.createDataSet(iname, "Uint32", [ col.length ], { data: col });
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["number"]); // only up to int32 is supported by 'integer'.
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Int32Array) {
                    let chandle = dhandle.createDataSet(iname, "Int32", [ col.length ], { data: col });
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["integer"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof BigUint64Array) {
                    let chandle = dhandle.createDataSet(iname, "Float64", [ col.length ], { data: col });
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["number"]); // only up to int32 is supported by 'integer'.
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof BigInt64Array) {
                    let chandle = dhandle.createDataSet(iname, "Float64", [ col.length ], { data: col });
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["number"]); // only up to int32 is supported by 'integer'.
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Float32Array) {
                    let chandle = dhandle.createDataSet(iname, "Float32", [ col.length ], { data: col });
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["number"]);
                    chandle.close();
                    handle_stack.pop();

                } else if (col instanceof Float64Array) {
                    let chandle = dhandle.createDataSet(iname, "Float64", [ col.length ], { data: col });
                    handle_stack.push(chandle);
                    chandle.writeAttribute("type", "String", [], ["number"]);
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
                        let chandle = dhandle.createDataSet(iname, "Uint8", [ df.numberOfRows() ], { data: new Uint8Array(df.numberOfRows()) });
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

                            let chandle = dhandle.createDataSet(iname, "Float64", [ col.length ], { data: col });
                            handle_stack.push(chandle);
                            chandle.writeAttribute("type", "String", [], ["number"]);
                            if (has_missing) {
                                chandle.writeAttribute("type", "Float64", [], [ placeholder ]);
                            }
                            chandle.close();
                            handle_stack.pop();
                            okay = true;

                        } else if (types.has("boolean")) {
                            let vals = new Uint8Array(col.length);
                            for (let i = 0; i < col.length; i++) {
                                if (col[i] == null) {
                                    vals[i] = 2;
                                } else {
                                    vals[i] = col[i];
                                }
                            }

                            let chandle = dhandle.createDataSet(iname, "Uint8", [ col.length ], { data: new Uint8Array(col) });
                            handle_stack.push(chandle);
                            chandle.writeAttribute("type", "String", [], ["boolean"]);
                            if (has_missing) {
                                chandle.writeAttribute("type", "Uint8", [], [ 2 ]);
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

                            // Not saving as VLS for simplicity.
                            let chandle = dhandle.createDataSet(iname, "String", [ col.length ], { data: col });
                            handle_stack.push(chandle);
                            chandle.writeAttribute("type", "String", [], ["string"]);
                            if (has_missing) {
                                chandle.writeAttribute("type", "String", [], [ placeholder ]);
                            }
                            chandle.close();
                            handle_stack.pop();
                            okay = true;
                        }
                    }

                    if (!okay) {
                        externals[iname] = col;
                    }

                } else {
                    externals[iname] = col;
                }
            }

        } finally {
            for (const handle of handle_stack.reverse()) {
                handle.close();
            }
        }

        for (const [iname, col] of Object.entries(externals)) {
            saveObject(path + "/other_columns/" + iname, col, globals, options);
        }

    } catch(e) {
        globals.fs.delete(path);
        throw e;
    }
}
