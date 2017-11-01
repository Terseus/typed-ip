import {
    addByteArrays,
    ByteArray,
    compareByteArrays,
    comparison,
    substractByteArrays,
} from "./arrays";

import {
    AddressValueError,
} from "./exceptions";

import {
    DECIMAL_DIGITS,
    IPV4_BYTES,
} from "./constants";


/**
 * Base class for address implementations.
 *
 * This class is abstract and not meant to be used directly outside of the
 * library except for type declarations and checks.
 */
export abstract class Address {
    private _octets: ByteArray;

    public constructor(octets: ByteArray) {
        this._octets = octets;
    }

    /**
     * The string representation of the address.
     */
    abstract get ipString(): string;

    /**
     * The octets of the address as an array of bytes (number from 0 to 255).
     *
     * The length of this array is determined by the address size.
     */
    get octets(): ByteArray {
        return this._octets;
    }

    /**
     * Returns `ipString`.
     */
    public toString(): string {
        return this.ipString;
    }

    /**
     * Returns if `this` is the same address as `other`.
     */
    public eq(other: this): boolean {
        return compareByteArrays(this.octets, other.octets) === comparison.Equal;
    }

    /**
     * Returns if `this` is a different address than `other`.
     */
    public ne(other: this): boolean {
        return compareByteArrays(this.octets, other.octets) !== comparison.Equal;
    }

    /**
     * Returns if `this` is greater than `other`.
     */
    public gt(other: this): boolean {
        return compareByteArrays(this.octets, other.octets) === comparison.Greater;
    }

    /**
     * Returns if `this` is lesser than `other`.
     */
    public lt(other: this): boolean {
        return compareByteArrays(this.octets , other.octets ) === comparison.Lesser;
    }

    /**
     * Returns if `this` is greater or equal than `other`.
     */
    public ge(other: this): boolean {
        const result = compareByteArrays(this.octets , other.octets );
        return result === comparison.Greater || result === comparison.Equal;
    }

    /**
     * Returns if `this` is lesser or equal than `other`.
     */
    public le(other: this): boolean {
        const result = compareByteArrays(this.octets , other.octets );
        return result === comparison.Lesser || result === comparison.Equal;
    }

    /**
     * Adds a certain amount of octets to `this` octets.
     *
     * `amount` must have at most the same length as `this` octet.s
     *
     * If `amount` is shorter than `this`, the octets of `amount` will be
     * treated as the lowest values.
     */
    public add(amount: ReadonlyArray<number>): this {
        return new (this.constructor as any)(addByteArrays(this.octets , new Uint8Array(amount)));
    }

    /**
     * Substracts a certain amount of octets to `this` octets.
     *
     * `amount` must have at most the same length as `this` octets.
     *
     * If `amount` is shorter than `this`, the octets of `amount` will be
     * treated as the lowest values.
     */
    public substract(amount: ReadonlyArray<number>): this {
        return new (this.constructor as any)(substractByteArrays(this.octets , new Uint8Array(amount)));
    }
}


/**
 * IPv4 address.
 *
 * The objects of this class are meant to be immutable.
 */
export class Address4 extends Address {
    private _ipString: string;

    /**
     * Creates a new IPv4 address.
     *
     * Possible inputs are:
     * - A valid IPv4 as string.
     * - A number array with 4 octets.
     * - A [[ByteArray]] - for internal use only.
     */
    public constructor(input: string | ReadonlyArray<number> | ByteArray) {
        if (input instanceof Uint8Array) {
            super(input);
        } else if (input instanceof Array) {
            if (input.length > IPV4_BYTES) {
                throw new AddressValueError(input);
            }
            if (!input.every((octet) => this.isValidOctet(octet))) {
                throw new AddressValueError(input);
            }
            if (input.length < IPV4_BYTES) {
                input = Array(IPV4_BYTES - input.length).fill(0x00).concat(input);
            }
            super(new Uint8Array(input));
        } else if (typeof input === "string") {
            const addressSplitted = input.split(".");
            if (addressSplitted.length !== IPV4_BYTES) {
                throw new AddressValueError(input);
            }

            const octets = new Uint8Array(addressSplitted.map(
                (octet) => {
                    if (!Array.from(octet).every((ch) => DECIMAL_DIGITS.includes(ch))) {
                        throw new AddressValueError(input as string);
                    }

                    const numberOctet = parseInt(octet, 10);
                    if (!this.isValidOctet(numberOctet)) {
                        throw new AddressValueError(input as string);
                    }

                    return numberOctet;
                },
            ));
            super(octets);
        }
    }

    public get ipString(): string {
        if (typeof this._ipString === "undefined") {
            this._ipString = this.octets.join(".");
        }
        return this._ipString;
    }

    private isValidOctet(octet: number): boolean {
        return octet >= 0 && octet <= 255;
    }
}
