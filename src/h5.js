/**
 * Representation of a group inside a HDF5 file.
 * This is an abstract interface that should not be created directly.
 */
export class H5Group {
    constructor() {
        if (this.constructor == H5Group) {
            throw new Error("cannot instantiate the abstract jaspilite.H5Group class");
        }
    }

    /**
     * @member {Array}
     * @desc Array containing the names of all attributes of this object.
     */
    attributes() {
        throw new Error("'attributes()' is not implemented in this H5Group subclass");
    }

    /**
     * @param {string} attr - Name of the attribute.
     * @return {object} Object containing the attribute `values` and the `shape` of the attribute.
     * For HDF5 enums, an additional `level` property is present, containing the levels indexed by the integer `values`.
     */
    readAttribute(attr) {
        throw new Error("'readAttribute()' is not implemented in this H5Group subclass");
    }

    /**
     * Write an attribute for the object.
     *
     * @param {string} attr - Name of the attribute.
     * @param {string} type - Type of dataset to create.
     * This can be `"IntX"` or `"UintX"` for `X` of 8, 16, 32, or 64;
     * or `"FloatX"` for `X` of 32 or 64;
     * or `"String"`.
     * @param {?Array} shape - Array containing the dimensions of the dataset to create.
     * If set to an empty array, this will create a scalar dataset.
     * If set to `null`, this is determined from `x`.
     * @param {(TypedArray|Array|string|number)} x - Values to be written to the new dataset, see {@linkcode H5DataSet#write write}.
     * This should be of length equal to the product of `shape` - unless `shape` is empty, in which case it should be of length 1.
     * @param {object} [options={}] - Optional parameters.
     * @param {?number} [options.maxStringLength=null] - Maximum length of the strings to be saved.
     * Only used when `type = "String"`.
     * If `null`, this is inferred from the maximum length of strings in `x`.
     */
    writeAttribute(attr, type, shape, x, options = {}) {
        throw new Error("'writeAttribute()' is not implemented in this H5Group subclass");
    }

    /**
     * @desc An object where the keys are the names of the immediate children and the values are strings specifying the object type of each child.
     * Each string can be one of `"Group"`, `"DataSet"` or `"Other"`.
     */
    children() {
        throw new Error("'children()' is not implemented in this H5Group subclass");
    }

    /**
     * @param {string} name - Name of the child element to open.
     * @param {object} [options={}] - Further options to pass to the {@linkplain H5Group} or {@linkplain H5DataSet} constructors.
     *
     * @return {H5Group|H5DataSet} Object representing the child element.
     */
    open(name, options = {}) {
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
     * @param {string} type - Type of dataset to create.
     * This can be `"IntX"` or `"UintX"` for `X` of 8, 16, 32, or 64;
     * or `"FloatX"` for `X` of 32 or 64;
     * or `"String"`.
     * @param {Array} shape - Array containing the dimensions of the dataset to create.
     * This can be set to an empty array to create a scalar dataset.
     * @param {object} [options={}] - Optional parameters.
     * @param {number} [options.maxStringLength=10] - Maximum length of the strings to be saved.
     * Only used when `type = "String"`.
     * @param {number} [options.compression=6] - Deflate compression level.
     * @param {?Array} [options.chunks=null] - Array containing the chunk dimensions.
     * This should have length equal to `shape`, with each value being no greater than the corresponding value of `shape`.
     * If `null`, it defaults to `shape`.
     *
     * @return {H5DataSet} A dataset of the specified type and shape is created as an immediate child of the current group.
     * A {@linkplain H5DataSet} object is returned representing this new dataset.
     */
    createDataSet(name, type, shape, options = {}) {
        throw new Error("'createDataSet()' is not implemented in this H5Group subclass");
    }
}

/**
 * Representation of a dataset inside a HDF5 file.
 * This is an abstract interface that should not be created directly.
 */
export class H5DataSet extends H5Base {
    /**
     * @member {object}
     * @desc String containing the type of the dataset.
     * This may be `"IntX"` or `"UintX"` for `X` of 8, 16, 32, or 64;
     * or `"FloatX"` for `X` of 32 or 64;
     * or `"String"`.
     */
    type() {
        throw new Error("'type()' is not implemented in this H5DataSet subclass");
    }

    /**
     * @member {Array}
     * @desc Array of integers containing the dimensions of the dataset.
     * If this is an empty array, the dataset is a scalar.
     */
    shape() {
        throw new Error("'shape()' is not implemented in this H5DataSet subclass");
    }

    /**
     * @member {(Array|TypedArray)}
     * @desc The contents of this dataset.
     * This has length equal to the product of {@linkcode H5DataSet#shape shape};
     * unless this dataset is scalar, in which case it has length 1.
     */
    values() {
        throw new Error("'values()' is not implemented in this H5DataSet subclass");
    }

    /**
     * @member {?Array}
     * @desc Levels of a HDF5 enum, to be indexed by the integer `values`.
     * For non-enum data, this is set to `null`.
     */
    levels() {
        throw new Error("'levels()' is not implemented in this H5DataSet subclass");
    }

    /**
     * @param {Array|TypedArray|number|string} x - Values to write to the dataset.
     * This should be of length equal to the product of {@linkcode H5DataSet#shape shape} -  unless `shape` is empty, in which case it should be of length 1.
     * @param {object} [options={}] - Optional parameters.
     * @param {boolean} [options.cache=false] - Whether to cache the written values in this {@linkplain H5DataSet} object.
     *
     * @return `x` is written to the dataset on file.
     * No return value is provided.
     */
    write(x, options = {}) {
        throw new Error("'write()' is not implemented in this H5DataSet subclass");
    }
}
