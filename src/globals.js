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
     * @return {Uint8Array|string|Promise<Uint8Array|string>} Path to the file on the local filesystem.
     * If ``asBuffer = true`` or if no local filesystem is avaiable, this will instead be a Uint8Array of the file contents.
     * A promise of a string or Uint8Array may also be returned.
     */
    get(path, options = {}) {
        throw new Error("'get()' is not implemented in this GlobalFsInterface subclass");
    }

    /**
     * @param {string} path - Path to the file.
     * This may be relative or absolute, depending on the application.
     * @return {boolean|Promise<boolean>} Whether the `path` exists.
     */
    exists(path) {
        throw new Error("'exists()' is not implemented in this GlobalFsInterface subclass");
    }

    /**
     * @param {string} path - Path to the file.
     * This may be relative or absolute, depending on the application.
     * @param {Uint8Array} contents - Contents of the file.
     *
     * @return {undefined|Promise<undefined>} `contents` should be stored at `path`.
     * The exact nature of this storage depends on the application.
     * If `path` already exists, it should be overwritten with `contents`.
     * No value is returned, though the method may be asynchronous.
     */
    write(path, contents) {
        throw new Error("'write()' is not implemented in this GlobalFsInterface subclass");
    }

    /**
     * @param {string} path - Path to the file, as used in {@linkcode GlobalFsInterface#get get}.
     * @return {undefined|Promise<undefined>} Any temporary file created by {@linkcode get} for `path` is removed.
     * No value is returned, though the method may be asynchronous.
     */ 
    clean(path) {
        throw new Error("'clean()' is not implemented in this GlobalFsInterface subclass");
    }

    /**
     * @param {string} path - Path to a directory.
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
class GlobalH5Interface {
    /**
     * @param {string|Uint8Array} contents - Path to a HDF5 file, or a Uint8Array containing the contents of such a file.
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
