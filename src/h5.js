/**
 * Representation of a group inside a HDF5 file.
 * This is an abstract interface that should not be created directly.
 * @hideconstructor
 */
export class H5Group {
    /**
     * @member {Array}
     * @desc Array containing the names of all attributes of this object.
     */
    attributes() {
        throw new Error("'attributes()' is not implemented in this H5Group subclass");
    }

    /**
     * @param {string} attr - Name of the attribute.
     * @return {object} Object containing:
     * - `values`, an Array or TypedArray containing the attribute data.
     *   This should have length equal to the product of `shape` for non-scalar attributes.
     * - `shape`, an Array containing the dimensions of the attribute.
     *   This is empty for scalar attributes, in which case `values` will have length 1.
     */
    readAttribute(attr) {
        throw new Error("'readAttribute()' is not implemented in this H5Group subclass");
    }

    /**
     * @param {string} attr - Name of the attribute.
     * @param {string} type - Type of attribute to create.
     * This can be `"IntX"` or `"UintX"` for `X` of 8, 16, 32, or 64; or `"FloatX"` for `X` of 32 or 64; or `"String"`.
     * @param {?Array} shape - Array containing the dimensions of the attribute to create.
     * If set to an empty array, this will create a scalar dataset.
     * @param {TypedArray|Array} x - Values to be written to the new attribute.
     * This should be of length equal to the product of `shape` - unless `shape` is empty, in which case it should be of length 1.
     * @param {object} [options={}] - Optional parameters.
     * @param {?number} [options.maxStringLength=null] - Maximum length of the strings to be saved.
     * Only used when `type = "String"`.
     * If `null`, this is inferred from the maximum length of strings in `data`.
     */
    writeAttribute(attr, type, shape, data, options = { maxStringLength: null }) {
        throw new Error("'writeAttribute()' is not implemented in this H5Group subclass");
    }

    /**
     * @return {Array} Names of the children of this group.
     */
    children() {
        throw new Error("'children()' is not implemented in this H5Group subclass");
    }

    /**
     * @param {string} name - Name of the child element to open.
     * @return {H5Group|H5DataSet} Object representing the child element.
     */
    open(name) {
        throw new Error("'open()' is not implemented in this H5Group subclass");
    }

    /**
     * @param {string} name - Name of the group to create.
     *
     * @return {@H5Group} A group is created as an immediate child of the current group.
     * A {@linkplain H5Group} object is returned representing this new group.
     * If a group already exists at `name`, it is returned directly.
     */
    createGroup(name) {
        throw new Error("'createGroup()' is not implemented in this H5Group subclass");
    }

    /**
     * @param {string} name - Name of the dataset to create.
     * @param {string|object} type - Type of dataset to create.
     * This can be `"IntX"` or `"UintX"` for `X` of 8, 16, 32, or 64; or `"FloatX"` for `X` of 32 or 64; or `"String"`.
     * @param {Array} shape - Array containing the dimensions of the dataset to create.
     * This can be set to an empty array to create a scalar dataset.
     * @param {object} [options={}] - Optional parameters.
     * @param {number} [options.maxStringLength=null] - Maximum length of the strings to be saved.
     * Only used when `type = "String"`.
     * If `null`, this should be inferred from the maximum length of strings in `options.data`.
     * If `options.data` is `null`, this must be provided for `type = "String"`.
     * @param {?(Array|TypedArray)} [options.data=null] - Array to be written to the dataset.
     * This is equivalent to calling {@linkcode H5DataSet#write H5DataSet.write} immediately after the dataset is created.
     *
     * @return {H5DataSet} A dataset of the specified type and shape is created as an immediate child of the current group.
     * A {@linkplain H5DataSet} object is returned representing this new dataset.
     */
    createDataSet(name, type, shape, options = { maxStringLength: null, data: null }) {
        throw new Error("'createDataSet()' is not implemented in this H5Group subclass");
    }

    /**
     * @return Closes the group handle.
     * Any subsequent method invocations on this group or its children are considered invalid.
     */
    close() {
        throw new Error("'close()' is not implemented in this H5Group subclass");
    }
}

/**
 * Representation of a dataset inside a HDF5 file.
 * This is an abstract interface that should not be created directly.
 * @hideconstructor
 */
export class H5DataSet {
    /**
     * @member {Array}
     * @desc Array containing the names of all attributes of this object.
     */
    attributes() {
        throw new Error("'attributes()' is not implemented in this H5Group subclass");
    }

    /**
     * @param {string} attr - Name of the attribute.
     * @return {object} Object containing:
     * - `values`, an Array or TypedArray containing the attribute data.
     *   This should have length equal to the product of `shape` for non-scalar attributes.
     * - `shape`, an Array containing the dimensions of the attribute.
     *   This is empty for scalar attributes, in which case `values` will have length 1.
     */
    readAttribute(attr) {
        throw new Error("'readAttribute()' is not implemented in this H5Group subclass");
    }

    /**
     * @return {string|object} String containing the type of the dataset.
     * This may be `"IntX"` or `"UintX"` for `X` of 8, 16, 32, or 64; or `"FloatX"` for `X` of 32 or 64; or `"String"`.
     * Alternatively, this may be an object representing a compound dataype, where keys and values are the names and types of each component.
     */
    type() {
        throw new Error("'type()' is not implemented in this H5DataSet subclass");
    }

    /**
     * @return {Array} Array of integers containing the dimensions of the dataset.
     * If this is an empty array, the dataset is a scalar.
     */
    shape() {
        throw new Error("'shape()' is not implemented in this H5DataSet subclass");
    }

    /**
     * @return {Array|TypedArray} The contents of this dataset.
     * This has length equal to the product of {@linkcode H5DataSet#shape shape} - unless this dataset is scalar, in which case it has length 1.
     * For compound datatypes, each element of the output array is an object.
     */
    values() {
        throw new Error("'values()' is not implemented in this H5DataSet subclass");
    }

    /**
     * @param {Array|TypedArray} x - Values to write to the dataset.
     * This should be of length equal to the product of {@linkcode H5DataSet#shape shape} -  unless `shape` is empty, in which case it should be of length 1.
     * @param {object} [options={}] - Optional parameters.
     *
     * @return `x` is written to the dataset on file.
     * No return value is provided.
     */
    write(x, options = {}) {
        throw new Error("'write()' is not implemented in this H5DataSet subclass");
    }

    /**
     * @return Closes the dataset handle.
     * Any subsequent method invocations on this dataset need not be valid.
     */
    close() {
        throw new Error("'close()' is not implemented in this H5DataSet subclass");
    }
}
