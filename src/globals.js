/**
 * Interface for `globals.fs`.
 * Applications are expected to implement each of the documented methods.
 * @hideconstructor
 */
export class GlobalFsInterface {
    /**
     * @param {string} path - Path to the file.
     * This may be relative or absolute, depending on the application.
     * @param {object} [options={}] - Further options.
     * @param {boolean} [options.asBuffer=false] - Whether to return the file contents as a Uint8Array.
     *
     * @return {Uint8Array|string} Path to the file on the local filesystem.
     * If ``asBuffer = true`` or if no local filesystem exists, this will instead be a Uint8Array of the file contents.
     */
    get(path, options = {}) {
        throw new Error("'get()' is not implemented in this GlobalFs subclass");
    }

    /**
     * @param {string} path - Path to the file.
     * This may be relative or absolute, depending on the application.
     * @return {boolean} Whether the `path` exists.
     */
    exists(path) {
        throw new Error("'exists()' is not implemented in this GlobalFs subclass");
    }

    /**
     * @param {string} path - Path to the file.
     * This may be relative or absolute, depending on the application.
     * @param {Uint8Array} contents - Contents of the file.
     *
     * @return `contents` should be stored at `path`.
     * The exact nature of this storage depends on the application.
     * No value is returned.
     */
    write(path, contents) {
        throw new Error("'write()' is not implemented in this GlobalFs subclass");
    }

    /**
     * @param {string} path - Path to the file, as used in {@linkcode GlobalFsInterface#get get}.
     * @return Any temporary file created by {@linkcode get} for `path` is removed.
     * No value is returned.
     */ 
    clean(path) {
        throw new Error("'clean()' is not implemented in this GlobalFs subclass");
    }

    /**
     * @param {string} path - Path to a directory.
     * It is assumed that all parent directories have already been created.
     * @return A new directory is created at `path`.
     * (This may be a no-op if the application does not support creation of directories.)
     * No value is returned.
     */ 
    mkdir(path) {
        throw new Error("'mkdir()' is not implemented in this GlobalFs subclass");
    }
}

/**
 * Interface for `globals.h5`.
 * Applications are expected to implement each of the documented methods.
 * @hideconstructor
 */
class GlobalH5Interface {
    /**
     * @param {string|Uint8Array} contents - Path to a HDF5 file, or a Uint8Array containing the contents of such a file.
     * The latter may be provided if no filesystem is available.
     * @param {object} [options={}] - Further options.
     * @param {boolean} [options.readOnly=true] - Whether to open the file in read-only mode.
     * If `false` and the file does not already exist, a new file will be created. 
     *
     * @return {H5Group} A handle to the HDF5 file.
     */
    open(x, options = {}) {
        throw new Error("'open()' is not implemented in this GlobalH5 subclass");
    }
}
