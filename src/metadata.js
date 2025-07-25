import { readObject, saveObject, readObjectFile } from "./general.js";

export async function readAnnotatedMetadata(path, globals, options, optname) {
    if (!(await globals.fs.exists(path))) {
        return {};
    }

    if (optname in options) {
        let optional = options[optname];
        if (optional === false) {
            return {};
        } else if (optional !== true) {
            let meta = await readObjectFile(path, globals);
            return optional(path, meta, globals, options);
        }
    }

    return readObject(path, null, globals, options);
}

export async function saveAnnotatedMetadata(x, path, globals, options) {
    if (x.length() === 0) {
        return;
    }
    saveObject(x, path, globals, options);
}
