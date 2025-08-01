import * as fs from "fs";
import * as hdf5 from "h5wasm/node";
import { TestH5Group } from "./h5.js";

export const test_globals = {
    get: (path, { asBuffer = false } = {}) => {
        if (!asBuffer) {
            return path;
        } else {
            return new Uint8Array(fs.readFileSync(path, null));
        }
    },
    exists: path => fs.existsSync(path),
    write: (path, contents) => fs.writeFileSync(path, contents),
    clean: (path) => {}, // no-op
    mkdir: path => fs.mkdirSync(path),
    h5open: async function(path) {
        await hdf5.ready;
        let handle = new hdf5.File(path, "r");
        return new TestH5Group(handle);
    },
    h5close: (handle) => {}, // no-op.
    h5create: async function(path) {
        await hdf5.ready;
        let handle = new hdf5.File(path, "w");
        return new TestH5Group(handle);
    },
    h5finish: (handle, failed) => null // no-op.
};
