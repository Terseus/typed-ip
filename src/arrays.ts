export const enum comparison {
    Greater, Lesser, Equal,
}


export type comparator<T> = (left: T, right: T) => comparison;


export function compareArrays<T>(
    left: ArrayLike<T>,
    right: ArrayLike<T>,
    func: comparator<T>,
): comparison {
    if (left.length > right.length) {
        return comparison.Greater;
    }

    if (right.length > left.length) {
        return comparison.Lesser;
    }

    for (let index = 0; index < left.length; index++) {
        const result = func(left[index], right[index]);
        if (result !== comparison.Equal) {
            return result;
        }
    }

    return comparison.Equal;
}


export function compareNumbers(left: number, right: number) {
    if (left > right) {
        return comparison.Greater;
    }

    if (right > left) {
        return comparison.Lesser;
    }

    return comparison.Equal;
}


export function compareNumberArrays(left: ArrayLike<number>, right: ArrayLike<number>) {
    return compareArrays(left, right, compareNumbers);
}


export function addNumberArrays(left: ArrayLike<number>, right: ArrayLike<number>) {
    if (right.length > left.length) {
        throw new Error("Unsupported operation: right cannot have more elements than left");
    }
    if (right.length < left.length) {
        right = new (<any> right.constructor)(Array(left.length - right.length).fill(0x00).concat(right));
    }
    const copy = new (<any> left.constructor)(left);
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


export function substractNumberArrays(left: ArrayLike<number>, right: ArrayLike<number>) {
    if (right.length > left.length) {
        throw new Error("Unsupported operation: right cannot have more elements than left");
    }
    if (right.length < left.length) {
        right = new (<any> right.constructor)(Array(left.length - right.length).fill(0x00).concat(right));
    }
    const copy = new (<any> left.constructor)(left);
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
