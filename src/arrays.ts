const DECIMAL_REGEXP = /^\d+$/;
const HEXADECIMAL_REGEXP = /^[\dabcdef]+$/i;


/**
 * @hidden
 */
export const enum comparison {
    Greater, Lesser, Equal,
}


/**
 * @hidden
 */
export function isValidByte(input: number) {
    return (input >= 0 && input <= 255);
}


/**
 * @hidden
 */
export function isValidByteArray(input: ReadonlyArray<number>): boolean {
    return input.every(isValidByte);
}


export function isDecimalString(input: string): boolean {
    return DECIMAL_REGEXP.test(input);
}


export function isHexadecimalString(input: string): boolean {
    return HEXADECIMAL_REGEXP.test(input);
}


/**
 * An immutable container of bytes.
 *
 * For internal use only.
 *
 * @hidden
 */
export class ByteContainer {
    public readonly length: number;
    public readonly bytes: ReadonlyArray<number>;

    public constructor(input: ReadonlyArray<number>) {
        this.bytes = input;
        this.length = this.bytes.length;
    }

    public compareWith(other: ReadonlyArray<number>): comparison {
        for (let index = 0; index < this.length; index++) {
            const byteValue = other[index] || 0;
            if (this.bytes[index] > byteValue) {
                return comparison.Greater;
            }
            if (byteValue > this.bytes[index]) {
                return comparison.Lesser;
            }
        }
        return comparison.Equal;
    }

    public add(input: ReadonlyArray<number>): ByteContainer {
        if (input.length > this.length) {
            throw new Error("Unsupported operation: input cannot have more elements than this");
        }
        if (!isValidByteArray(input)) {
            throw new Error("Invalid bytes array: digits should be between 0 and 255");
        }
        if (this.length > input.length) {
            input = new Array(this.length - input.length).fill(0x00).concat(input);
        }
        const copy = this.bytes.slice();
        let carry = 0;
        for (let index = 0; index < input.length; index++) {
            const inputIndex = input.length - index - 1;
            if (input[inputIndex] + carry === 0) {
                continue;
            }

            const thisIndex = this.length - index - 1;
            const sum = this.bytes[thisIndex] + input[inputIndex] + carry;
            if (sum > 255) {
                copy[thisIndex] = sum - 256;
                carry = 1;
            } else {
                copy[thisIndex] = sum;
                carry = 0;
            }
        }

        if (carry > 0) {
            throw new Error("Overflow");
        }

        return new ByteContainer(copy);
    }

    public subtract(input: ReadonlyArray<number>): ByteContainer {
        if (input.length > this.length) {
            throw new Error("Unsupported operation: input cannot have more elements than this");
        }
        if (!isValidByteArray(input)) {
            throw new Error("Invalid bytes array: digits should be between 0 and 255");
        }
        if (this.length > input.length) {
            input = new Array(this.length - input.length).fill(0x00).concat(input);
        }
        const copy = this.bytes.slice();
        let carry = 0;
        for (let index = 0; index < input.length; index++) {
            const inputIndex = input.length - index - 1;
            if (input[inputIndex] + carry === 0) {
                continue;
            }

            const thisIndex = this.length - index - 1;
            const subs = this.bytes[thisIndex] - input[inputIndex] - carry;
            if (subs < 0) {
                copy[thisIndex] = subs + 256;
                carry = 1;
            } else {
                copy[thisIndex] = subs;
                carry = 0;
            }
        }

        if (carry > 0) {
            throw new Error("Underflow");
        }

        return new ByteContainer(copy);
    }
}
