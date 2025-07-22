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
