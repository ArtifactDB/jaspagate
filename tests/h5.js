import * as jsp from "../src/index.js";
import * as hdf5 from "h5wasm/node";

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

    static #translate_type(meta) {
        if (meta.type == 0) { // i.e., integer.
            return (meta.signed ? "Int" : "Uint") + String(8 * meta.size);
        } else if (meta.type == 1) { // i.e., float.
            return "Float" + String(8 * meta.size);
        } else if (meta.type == 2) {
            return "String";
        } else if (meta.type == 6) {
            let compound_type = {};
            for (const part of meta.compound_type.members) {
                compound_type[part.name] = TestH5DataSet.#translate_type(part);
            }
        } else {
            throw new Error("unrecognized type for a HDF5 Dataset");
        }
    }

    type() {
        return TestH5DataSet.#translate_type(this.#handle.metadata);
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

    close() {}
}
