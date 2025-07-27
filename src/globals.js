/**
 * Interface for methods to interact with the filesystem and HDF5 files.
 * Applications are expected to implement each of the documented methods.
 * @hideconstructor
 */
export class GlobalsInterface {
    /**
     * @param {string} path - Path to the file.
     * This may be relative or absolute, depending on the application.
     * The path may refer to a file not on the local filesystem, e.g., on a remote server, inside an archive file.
     * @param {object} [options={}] - Further options.
     * @param {boolean} [options.asBuffer=false] - Whether to return the file contents as a Uint8Array.
     *
     * @return {Uint8Array|string|Promise<Uint8Array|string>}
     * Relative or absolute path to the file on the local filesystem.
     * Callers should pass this path to {@linkcode GlobalsInterface#clean clean} once the file is no longer required.
     *
     * If `asBuffer = true` or if no local filesystem is available, a Uint8Array of the file contents is returned instead.
     * This does not need to be passed to `clean`.
     *
     * A promise of a string or Uint8Array may also be returned.
     */
    get(path, options = {}) {
        throw new Error("'get()' is not implemented in this GlobalsInterface subclass");
    }

    /**
     * @param {string} path - Path to the file, see {@linkcode GlobalsInterface#get get} for details.
     * @return {boolean|Promise<boolean>} Whether the `path` exists.
     */
    exists(path) {
        throw new Error("'exists()' is not implemented in this GlobalsInterface subclass");
    }

    /**
     * @param {string} path - Path to the file, see {@linkcode GlobalsInterface#get get} for details.
     * @param {Uint8Array} contents - Contents of the file.
     *
     * @return {undefined|Promise<undefined>} `contents` is stored at `path`.
     * The exact nature of this storage depends on the application -
     * it may involve saving a file to the local filesystem, or uploading a file to a server, etc.
     * If `path` already exists, it should be overwritten with `contents`.
     * No value is returned, though the method may be asynchronous.
     */
    write(path, contents) {
        throw new Error("'write()' is not implemented in this GlobalsInterface subclass");
    }

    /**
     * @param {string} x - Return value of {@linkcode GlobalsInterface#get get}.
     * @return {undefined|Promise<undefined>} Any resources used by {@linkcode GlobalsInterface#get get} to return `x` can be freed.
     * For example, if `x` is a path referring to a temporary file, it can be removed.
     * No value is returned, though the method may be asynchronous.
     */ 
    clean(path) {
        throw new Error("'clean()' is not implemented in this GlobalsInterface subclass");
    }

    /**
     * @param {string} path - Path to a directory.
     * This may be relative or absolute, depending on the application.
     * As with {@linkcode GlobalsInterface#get get}, the path may refer to a directory not on the local filesystem, e.g., on a remote server, inside an archive file.
     * It is assumed that all parent directories have already been created.
     * @return {undefined|Promise<undefined>} A new directory is created at `path`.
     * (This may be a no-op if the application does not support creation of directories.)
     * No value is returned, though the method may be asynchronous.
     */ 
    mkdir(path) {
        throw new Error("'mkdir()' is not implemented in this GlobalsInterface subclass");
    }

    /**
     * @param {string} path - Path to a HDF5 file.
     * This may be relative or absolute, depending on the application.
     * The path may refer to a file not on the local filesystem, e.g., on a remote server, inside an archive file.
     *
     * @return {H5Group|Promise<H5Group>} A read-only handle to the HDF5 file, or a promise thereof.
     */
    h5open(contents) {
        throw new Error("'h5open()' is not implemented in this GlobalsInterface subclass");
    }

    /**
     * @param {H5Group} handle - Return value of {@linkcode GlobalsInterface#h5open h5open}.
     * This will already have its {@linkcode H5Group#close close} method invoked.
     * @return {undefined|Promise<undefined>} This should execute clean-up operations when the file used in `h5open` is no longer needed.
     * No value is returned, possibly asynchronously.
     */
    h5close(handle) {
        throw new Error("'h5close()' is not implemented in this GlobalsInterface subclass");
    }

    /**
     * @param {string} path - Path to a HDF5 file to be created.
     * This may be relative or absolute, depending on the application.
     * The path may refer to a location not on the local filesystem, e.g., on a remote server, inside an archive file.
     *
     * @return {H5Group|Promise<H5Group>} A read-write handle to a new HDF5 file, or a promise thereof.
     * This may refer to, e.g.,  a temporary file in a virtual filesystem, if no local filesystem exists.
     */
    h5create(path) {
        throw new Error("'h5create()' is not implemented in this GlobalsInterface subclass");
    }

    /**
     * @param {H5Group} handle - Return value of {@linkcode GlobalsInterface#h5create h5create}.
     * This will already have its {@linkcode H5Group#close close} method invoked.
     * @param {boolean} failed - Whether an error occurred when writing to the HDF5 file. 
     *
     * @return {?Uint8Array|Promise<?Uint8Array>} This should execute clean-up operations when no more write operations are to be performed on the file returned by `h5create`.
     * If `failed = true`, any existing resources associated with the file may be deleted, and `null` should be returned, possibly asynchronously.
     */
    h5finish(handle, failed) {
        throw new Error("'h5finish()' is not implemented in this GlobalsInterface subclass");
    }
}
