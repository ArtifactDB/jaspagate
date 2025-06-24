import * as bioc from "bioconductor";
import * as df from "./DataFrame.js";

export const readObject_registry = {};

export async function readObject(path, metadata, globals, options = {}) {
    if (metadata == null) {
        let payload = await globals.navigator.get(path + "/OBJECT");
        let dec = new TextDecoder;
        metadata = JSON.parse(dec.decode(payload));
    }

    let objtype = metadata["type"];
    if (objtype in readObject_registry) {
        return readObject_registry[objtype](path, metadata, globals, options);

    } else if (objtype == "data_frame") { 
        return readDataFrame(path, metadata, globals, options);

    } else {
        throw new Error("type '" + objtype + "' is not supported");
    }
}

export const saveObject_registry = [];

export async function saveObject(x, path, globals, options = {}) {
    for (var i = saveObject_registry.length; i > 0; i--) {
        const [cls, meth] = saveObject_registry[i - 1];
        if (x instanceof cls) {
            meth(x, path, globals, options);
            return;
        }
    }

    if (x instanceof bioc.DataFrame) {
        saveDataFrame(x, path, globals, options);
        return;

    } else {
        throw new Error("type '" + objtype + "' is not supported");
    }
}
