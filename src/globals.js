/**
 * Interface for `globals.fs`.
 * Applications are expected to implement each of the documented methods.
 * @hideconstructor
 */
export class GlobalFsInterface {
    /**
     * @param {string} path - Path to the file.
     * This may be relative or absolute, depending on the application.
     * The path may refer to a file not on the local filesystem, e.g., on a remote server, inside an archive file.
     * @param {object} [options={}] - Further options.
     * @param {boolean} [options.asBuffer=false] - Whether to return the file contents as a Uint8Array.
     *
     * @return {Uint8Array|string|Promise<Uint8Array|string>}
     * Relative or absolute path to the file on the local filesystem.
     * Callers should pass this path to {@linkcode GlobalFsInterface#clean clean} once the file is no longer required.
     *
     * If `asBuffer = true` or if no local filesystem is available, a Uint8Array of the file contents is returned instead.
     * This does not need to be passed to `clean`.
     *
     * A promise of a string or Uint8Array may also be returned.
     */
    get(path, options = {}) {
        throw new Error("'get()' is not implemented in this GlobalFsInterface subclass");
    }

    /**
     * @param {string} path - Path to the file, see {@linkcode GlobalFsInterface#get get} for details.
     * @return {boolean|Promise<boolean>} Whether the `path` exists.
     */
    exists(path) {
        throw new Error("'exists()' is not implemented in this GlobalFsInterface subclass");
    }

    /**
     * @param {string} path - Path to the file, see {@linkcode GlobalFsInterface#get get} for details.
     * @param {Uint8Array} contents - Contents of the file.
     *
     * @return {undefined|Promise<undefined>} `contents` is stored at `path`.
     * The exact nature of this storage depends on the application -
     * it may involve saving a file to the local filesystem, or uploading a file to a server, etc.
     * If `path` already exists, it should be overwritten with `contents`.
     * No value is returned, though the method may be asynchronous.
     */
    write(path, contents) {
        throw new Error("'write()' is not implemented in this GlobalFsInterface subclass");
    }

    /**
     * @param {string} path - Path to a file on the local filesystem, as returned by {@linkcode GlobalFsInterface#get get}.
     * @return {undefined|Promise<undefined>} Any resources used by {@linkcode GlobalFsInterface#get get} to return `path` can be freed.
     * For example, if `path` refers to a temporary file, it can be removed.
     * No value is returned, though the method may be asynchronous.
     */ 
    clean(path) {
        throw new Error("'clean()' is not implemented in this GlobalFsInterface subclass");
    }

    /**
     * @param {string} path - Path to a directory.
     * This may be relative or absolute, depending on the application.
     * As with {@linkcode GlobalFsInterface#get get}, the path may refer to a directory not on the local filesystem, e.g., on a remote server, inside an archive file.
     * It is assumed that all parent directories have already been created.
     * @return {undefined|Promise<undefined>} A new directory is created at `path`.
     * (This may be a no-op if the application does not support creation of directories.)
     * No value is returned, though the method may be asynchronous.
     */ 
    mkdir(path) {
        throw new Error("'mkdir()' is not implemented in this GlobalFsInterface subclass");
    }
}

/**
 * Interface for `globals.h5`.
 * Applications are expected to implement each of the documented methods.
 * @hideconstructor
 */
export class GlobalH5Interface {
    /**
     * @param {string|Uint8Array} contents - Path to a HDF5 file on the local filesystem, or a Uint8Array containing the contents of such a file.
     * The latter may be provided if no filesystem is available.
     * @param {object} [options={}] - Further options.
     * @param {boolean} [options.readOnly=true] - Whether to open the file in read-only mode.
     * If `false` and the file does not already exist, a new file will be created. 
     *
     * @return {H5Group|Promise<H5Group>} A handle to the HDF5 file, or a promise thereof.
     */
    open(x, options = {}) {
        throw new Error("'open()' is not implemented in this GlobalH5Interface subclass");
    }

    /**
     * @param {H5Group} handle - Return value of {@linkcode GlobalH5Interface#open open}.
     * This will already have its {@linkcode H5Group#close close} method invoked.
     * @return {undefined|Promise<undefined>} This should execute clean-up operations when the file used in `open` is no longer needed.
     * No value is returned, possibly asynchronously.
     */
    close(handle) {
        throw new Error("'close()' is not implemented in this GlobalH5Interface subclass");
    }
}
