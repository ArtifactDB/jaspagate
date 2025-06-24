import * as fs from "fs";
import * as hdf5 from "h5wasm/node";
import { TestH5Group } from "./h5.js";

export const test_globals = {
    fs: {
        get: (path, { asBuffer = false } = {}) => {
            if (!asBuffer) {
                return path;
            } else {
                return new Uint8Array(fs.readFileSync(path, null));
            }
        },
        clean: () => {}, // no-op
        mkdir: path => {
            fs.mkdirSync(path);
        },
        delete: path => {
            fs.rmSync(path, { recursive: true, force: true });
        }
    },
    h5: {
        open: async function(path, { readOnly }) {
            await hdf5.ready;
            let handle = new hdf5.File(path, readOnly ? "r" : "w");
            return new TestH5Group(handle);
        }
    }
};
