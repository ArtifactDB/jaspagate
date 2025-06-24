import * as bioc from "bioconductor";
import * as df from "./DataFrame.js";

export async function readObjectFile(path, globals) {
    let payload = await globals.fs.get(path + "/OBJECT", { asBuffer: true });
    let dec = new TextDecoder;
    return JSON.parse(dec.decode(payload));
}

export const readObject_registry = {};

export async function readObject(path, metadata, globals, options = {}) {
    if (metadata == null) {
        metadata = await readObjectFile(path, globals);
    }

    let objtype = metadata["type"];
    if (objtype in readObject_registry) {
        return readObject_registry[objtype](path, metadata, globals, options);

    } else if (objtype == "data_frame") { 
        return df.readDataFrame(path, metadata, globals, options);

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
        df.saveDataFrame(x, path, globals, options);
        return;

    } else {
        throw new Error("object of type '" + x.constructor.name + "' is not supported");
    }
}
