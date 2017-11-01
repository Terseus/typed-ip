/**
 * A readonly `Uint8Array`.
 *
 * Used to have (and give) the guarantee that the passed in and out arrays
 * will not be modified.
 */
export interface ByteArray extends Uint8Array {
    readonly [index: number]: number;
}


/**
 * @hidden
 */
export const enum comparison {
    Greater, Lesser, Equal,
}


/**
 * @hidden
 */
export function compareByteArrays(
    left: ByteArray,
    right: ByteArray,
): comparison {
    if (left.length > right.length) {
        return comparison.Greater;
    }

    if (right.length > left.length) {
        return comparison.Lesser;
    }

    for (let index = 0; index < left.length; index++) {
        if (left[index] > right[index]) {
            return comparison.Greater;
        }

        if (left[index] < right[index]) {
            return comparison.Lesser;
        }
    }

    return comparison.Equal;
}


/**
 * @hidden
 */
export function addByteArrays(
    left: ByteArray,
    right: ByteArray,
): ByteArray {
    if (right.length > left.length) {
        throw new Error("Unsupported operation: right cannot have more elements than left");
    }
    if (right.length < left.length) {
        right = new Uint8Array(Array(left.length - right.length).fill(0x00).concat(right));
    }
    const copy = new Uint8Array(left);
    let carry = 0;
    for (let index = 0; index < right.length; index++) {
        const rightIndex = right.length - index - 1;
        if (right[rightIndex] + carry === 0) {
            continue;
        }

        const leftIndex = left.length - index - 1;
        const sum = left[leftIndex] + right[rightIndex] + carry;
        if (sum > 255) {
            copy[leftIndex] = sum - 256;
            carry = 1;
        } else {
            copy[leftIndex] = sum;
            carry = 0;
        }
    }

    if (carry > 0) {
        throw new Error("Overflow");
    }

    return copy;
}


/**
 * @hidden
 */
export function substractByteArrays(
    left: ByteArray,
    right: ByteArray,
): ByteArray {
    if (right.length > left.length) {
        throw new Error("Unsupported operation: right cannot have more elements than left");
    }
    if (right.length < left.length) {
        right = new Uint8Array(Array(left.length - right.length).fill(0x00).concat(right));
    }
    const copy = new Uint8Array(left);
    let carry = 0;
    for (let index = 0; index < right.length; index++) {
        const rightIndex = right.length - index - 1;
        if (right[rightIndex] + carry === 0) {
            continue;
        }

        const leftIndex = left.length - index - 1;
        const subs = left[leftIndex] - right[rightIndex] - carry;
        if (subs < 0) {
            copy[leftIndex] = subs + 256;
            carry = 1;
        } else {
            copy[leftIndex] = subs;
            carry = 0;
        }
    }

    if (carry > 0) {
        throw new Error("Underflow");
    }

    return copy;
}
