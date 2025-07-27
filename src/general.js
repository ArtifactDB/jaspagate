import * as bioc from "bioconductor";
import * as list from "./List.js";
import * as df from "./DataFrame.js";
import * as se from "./SummarizedExperiment.js";
import * as rse from "./RangedSummarizedExperiment.js";
import * as sce from "./SingleCellExperiment.js";
import { joinPath } from "./utils.js";

/**
 * @param {string} path - Path to the takane-formatted object directory containing the {@link DataFrame}.
 * @param {object} globals - Object satisfying the {@link GlobalsInterface}. 
 * @return {object} Object metadata.
 * @async
 */
export async function readObjectFile(path, globals) {
    let payload = await globals.get(joinPath(path, "OBJECT"), { asBuffer: true });
    let dec = new TextDecoder;
    return JSON.parse(dec.decode(payload));
}

/**
 * @type {object}
 * @desc Registry of reader functions.
 * Each key is a takane object type, and each value is a function that accepts the same arguments as {@linkcode readObject}.
 */
export const readObjectRegistry = {};

/**
 * This function will inspect {@linkcode readObjectRegistry} to check if any reader function is supplied for the takane object type at `path`.
 * If found, it will use that function, otherwise it will fall back to the default functions:
 * 
 * - {@linkcode readDataFrame}, to read {@link external:DataFrame DataFrame} objects.
 * - {@linkcode readSummarizedExperiment}, to read {@link external:SummarizedExperiment SummarizedExperiment} objects.
 * - {@linkcode readRangedSummarizedExperiment}, to read {@link external:RangedSummarizedExperiment RangedSummarizedExperiment} objects.
 * - {@linkcode readSingleCellExperiment}, to read {@link external:SingleCellExperiment SingleCellExperiment} objects.
 *
 * @param {string} path - Path to a takane-formatted object directory. 
 * @param {?object} metadata - Object metadata.
 * If `null`, this is automatically loaded by calling {@linkcode readObjectFile} on `path`.
 * @param {object} globals - Object satisfying the {@link GlobalsInterface}.
 * @param {object} [options={}] - Further options, to be passed to the reader functions for individual takane object types.
 *
 * @return Some in-memory representation of the takane object at `path`.
 * @async
 */
export async function readObject(path, metadata, globals, options = {}) {
    if (metadata == null) {
        metadata = await readObjectFile(path, globals);
    }

    let objtype = metadata["type"];
    if (objtype in readObjectRegistry) {
        return readObjectRegistry[objtype](path, metadata, globals, options);

    } else {
        const defaults = {
            "simple_list": list.readList,
            "data_frame": df.readDataFrame,
            "summarized_experiment": se.readSummarizedExperiment,
            "ranged_summarized_experiment": rse.readRangedSummarizedExperiment,
            "single_cell_experiment": sce.readSingleCellExperiment
        };

        if (objtype in defaults) {
            return defaults[objtype](path, metadata, globals, options);
        }

        throw new Error("type '" + objtype + "' is not supported");
    }
}

/**
 * @type {Array}
 * @desc Registry of saving functions.
 * Each entry should be an array of length 2, containing a Javascript class and its saving function.
 * Each saving function should accept the same arguments as {@linkcode saveObject}.
 * Subclasses should be placed after their parents in this array.
 */
export const saveObjectRegistry = [];

/**
 * This function will inspect {@linkcode saveObjectRegistry} to check if any saving function is supplied for `x`.
 * If found, it will use that function, otherwise it will fall back to the default functions:
 * 
 * - {@linkcode saveDataFrame}, to save {@link external:DataFrame DataFrame} objects.
 * - {@linkcode saveSummarizedExperiment}, to save {@link external:SummarizedExperiment SummarizedExperiment} objects.
 * - {@linkcode saveRangedSummarizedExperiment}, to save {@link external:RangedSummarizedExperiment RangedSummarizedExperiment} objects.
 * - {@linkcode saveSingleCellExperiment}, to save {@link external:SingleCellExperiment SingleCellExperiment} objects.
 *
 * @param {Any} x - The takane-compatible object to be saved.
 * @param {string} path - Path to the directory in which to save `x`.
 * @param {object} globals - Object satisfying the {@link GlobalsInterface}.
 * @param {object} [options={}] - Further options.
 *
 * @return `x` is stored at `path`.
 * @async
 */
export async function saveObject(x, path, globals, options = {}) {
    for (var i = saveObjectRegistry.length; i > 0; i--) {
        const [cls, meth] = saveObjectRegistry[i - 1];
        if (x instanceof cls) {
            meth(x, path, globals, options);
            return;
        }
    }

    const defaults = [
        [bioc.SingleCellExperiment, sce.saveSingleCellExperiment],
        [bioc.RangedSummarizedExperiment, rse.saveRangedSummarizedExperiment],
        [bioc.SummarizedExperiment, se.saveSummarizedExperiment],
        [bioc.DataFrame, df.saveDataFrame],
        [bioc.List, list.saveList]
    ];

    for (const [cls, fun] of defaults) {
        if (x instanceof cls) {
            fun(x, path, globals, options);
            return;
        }
    }

    throw new Error("object of type '" + x.constructor.name + "' is not supported");
}
