/**
 * Join paths while accounting for `.` inputs.
 *
 * @param {string} args - One or more strings containing path components.
 * These should not have leading or trailing `/` but may be equal to `.`
 *
 * @return The joined path.
 */
export function joinPath(...args) {
    let output = args[0];
    for (var i = 1; i < args.length; i++) {
        let current = args[i];
        if (output == ".") {
            output = current;
        } else if (current != ".") {
            output += "/" + current;
        }
    }
    return output;
}

export function exceedsInt32(x) {
    const upper = 2**31, lower = -upper;
    for (const v of x) {
        if (v !== null && (v < lower || v >= upper)) {
            return true;
        }
    }
    return false;
}

function substitutePlaceholder(x, placeholder, outclass) {
    let output = new outclass(x.length);
    x.forEach((y, i) => {
        output[i] = (y === null ? placeholder : y);
    });
    return output;
}

export function formatIntegerArrayForHdf5(x) {
    let has_missing = x.some(y => y == null);

    if (exceedsInt32(x)) {
        let placeholder = null;
        if (has_missing) {
            placeholder = Number.NaN;
            x = substitutePlaceholder(x, placeholder, Float64Array);
        }
        return { integer: false, data: x, placeholder: placeholder };
    }

    if (!has_missing) {
        return { integer: true, data: x, placeholder: null };
    }

    let output = { integer: true, data: null, placeholder: null };

    // Quickly searching some of the most obvious candidates.
    const upper = 2**31, lower = -upper;
    for (const candidate of [lower, upper - 1, 0]) {
        if (!x.some(y => y == candidate)) {
            output.placeholder = candidate;
            break;
        }
    }

    if (output.placeholder === null) {
        let everything = new Set(x);
        for (var i = lower + 1; i < upper - 1; i++) {
            if (!everything.has(i)) {
                output.placeholder = i;
                break;
            }
        }
    }

    if (output.placeholder === null) {
        output.integer = false;
        output.placeholder = Number.NaN;
    }

    output.data = substitutePlaceholder(x, output.placeholder, Int32Array);
    return output;
}

export function formatNumberArrayForHdf5(x) {
    if (!x.some(y => y == null)) {
        return { data: x, placeholder: null };
    }

    // Quickly searching some of the most obvious candidates.
    if (!x.some(Number.isNaN)) {
        return { data: substitutePlaceholder(x, Number.NaN, Float64Array), placeholder: Number.NaN };
    }

    for (const candidate of [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.MAX_VALUE, -Number.MAX_VALUE, 0]) {
        if (!x.some(y => y == candidate)) {
            return { data: substitutePlaceholder(x, candidate, Float64Array), placeholder: candidate };
        }
    }

    let previous = -Number.MAX_VALUE;
    let sorted = (new Float64Array(x.filter(Number.isFinite))).sort();
    let chosen;
    for (const y of sorted) {
        let candidate = previous + (y - previous) / 2;
        if (candidate != previous && candidate != y) {
            chosen = candidate;
            break;
        }
        previous = y;
    }

    return { data: substitutePlaceholder(x, chosen, Float64Array), placeholder: chosen };
}

export function formatStringArrayForHdf5(x) {
    if (!x.some(y => y == null)) {
        return { data: x, placeholder: null };
    }

    let placeholder = "NA";
    if (x.some(y => y == "NA")) { // Quickly searching the most obvious candidates.
        let everything = new Set(x);
        placeholder += "_";
        while (everything.has(placeholder)) {
            placeholder += "_";
        }
    }

    return { data: x.map(y => y == null ? placeholder : y), placeholder: placeholder };
}

export function formatBooleanArrayForHdf5(x) {
    return { 
        data: substitutePlaceholder(x, 2, Uint8Array),
        placeholder: (x.some(y => y == null) ? 2 : null)
    };
}

export function jsonBuffer(obj) {
    const str = JSON.stringify(obj);
    const enc = new TextEncoder;
    return enc.encode(str);
}
