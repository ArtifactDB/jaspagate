import * as jsp from "../src/index.js";
import * as hdf5 from "h5wasm/node";

function translateTypeTo(type, options) {
    const numeric_mapping = {
        "Int8": "<b",
        "Uint8": "<B",
        "Int16": "<h",
        "Uint16": "<H",
        "Int32": "<i",
        "Uint32": "<I",
        "Int64": "<q",
        "Uint64": "<Q",
        "Float32": "<f",
        "Float64": "<d"
    };
    if (type in numeric_mapping) {
        return numeric_mapping[type];
    }

    if (type == "String") {
        let max_len = 1;
        if ("maxStringLength" in options) {
            max_len = options.maxStringLength;
        } else if ("data" in options) {
            let enc = new TextEncoder;
            for (var i = 0; i < options.data.length; i++) {
                let encoded = enc.encode(options.data[i]);
                if (encoded.length > max_len) {
                    max_len = encoded.length;
                }
            }
        } else { 
            throw new Error("either 'maxStringLength' or 'data' should be provided"); 
        }
        return "S" + String(max_len);
    }

    throw new Error("unknown type '" + type + "'");
}

export class TestH5Group extends jsp.H5Group {
    #handle;

    constructor(handle) {
        super();
        this.#handle = handle;
    }

    attributes() {
        return Object.keys(this.#handle.attrs)
    }

    readAttribute(name) {
        let { value, shape } = this.#handle.attrs[name];
        if (shape.length == 0) {
            value = [value];
        }
        return { values: value, shape: shape }; // note the extra 's'.
    }

    writeAttribute(attr, type, shape, data, options = {}) {
        let dtype = translateTypeTo(type, { ...options, data: data });
        this.#handle.create_attribute(attr, data, shape, dtype);
    }

    children() {
        return this.#handle.keys();
    }

    open(name) {
        let child = this.#handle.get(name);
        if (child instanceof hdf5.Group) {
            return new TestH5Group(child);
        } else if (child instanceof hdf5.Dataset) {
            return new TestH5DataSet(child);
        } else {
            throw new Error("unknown object type");
        }
    }

    createGroup(name) {
        this.#handle.create_group(name);
        return new TestH5Group(this.#handle.get(name));
    }

    createDataSet(name, type, shape, options = {}) {
        let dtype = translateTypeTo(type, options);
        let params = { name: name, shape: shape, dtype: dtype };

        if ("data" in options) {
            let data = options.data;
            if (data instanceof BigInt64Array || data instanceof BigUint64Array) {
                if (type != "Uint64" && type != "Int64") {
                    let replacement = new Float64Array(data.length);
                    for (var i = 0; i < data.length; i++) {
                        replacement[i] = Number(data[i]);
                    }
                    data = replacement;
                }
            }
            params.data = data;
        }

        this.#handle.create_dataset(params);
        if (!("returnHandle" in options) || options.returnHandle) {
            return new TestH5DataSet(this.#handle.get(name));
        }
    }

    close() {
        if (this.#handle instanceof hdf5.File) {
            this.#handle.close();
        }
    }
}

export class TestH5DataSet extends jsp.H5DataSet {
    #handle;

    constructor(handle) {
        super();
        this.#handle = handle;
    }

    attributes() {
        return Object.keys(this.#handle.attrs)
    }

    readAttribute(name) {
        let { value, shape } = this.#handle.attrs[name];
        if (shape.length == 0) {
            value = [value];
        }
        return { values: value, shape: shape }; // note the extra 's'.
    }

    writeAttribute(attr, type, shape, data, options = {}) {
        let dtype = translateTypeTo(type, { ...options, data: data });
        this.#handle.create_attribute(attr, data, shape, dtype);
    }

    static #translateTypeFrom(meta) {
        if (meta.type == 0) { // i.e., integer.
            return (meta.signed ? "Int" : "Uint") + String(8 * meta.size);
        } else if (meta.type == 1) { // i.e., float.
            return "Float" + String(8 * meta.size);
        } else if (meta.type == 2) {
            return "String";
        } else if (meta.type == 6) {
            let compound_type = {};
            for (const part of meta.compound_type.members) {
                compound_type[part.name] = TestH5DataSet.#translateTypeFrom(part);
            }
        } else {
            throw new Error("unrecognized type for a HDF5 Dataset");
        }
    }

    type() {
        return TestH5DataSet.#translateTypeFrom(this.#handle.metadata);
    }

    shape() {
        const meta = this.#handle.metadata;
        return meta.shape;
    }

    values() {
        if (this.#handle.metadata.type == 6) {
            let names = [];
            for (const part of this.#handle.metadata.compound_type.members) {
                names.push(part.name);
            }
            let output = [];
            for (const vals of this.#handle.value) {
                let entry = {};
                for (var i = 0; i < names.length; i++) {
                    entry[names[i]] = vals[i];
                }
                output.push(entry);
            }
            return output;
        } else {
            return this.#handle.value;
        }
    }

    write(data) {
        let full = [];
        for (const d of this.#handle.shape) {
            full.push([0, d]);
        }
        this.#handle.write_slice(full, data);
    }

    close() {}
}
