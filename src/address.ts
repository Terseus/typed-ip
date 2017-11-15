import {
    ByteContainer,
    comparison,
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
    private byteContainer: ByteContainer;

    public constructor(byteContainer: ByteContainer) {
        this.byteContainer = byteContainer;
    }

    /**
     * Returns the string representation of the address.
     */
    public abstract getIpString(): string;

    /**
     * Returns the octets of the address as an array of bytes (number from 0 to
     * 255).
     *
     * The length of this array is determined by the address size.
     */
    public getOctets(): ReadonlyArray<number> {
        return this.byteContainer.bytes;
    }

    /**
     * Returns `getIpString()`.
     */
    public toString(): string {
        return this.getIpString();
    }

    /**
     * Returns if `this` is the same address as `other`.
     */
    public eq(other: this): boolean {
        return this.byteContainer.compareWith(other.getOctets()) === comparison.Equal;
    }

    /**
     * Returns if `this` is a different address than `other`.
     */
    public ne(other: this): boolean {
        return this.byteContainer.compareWith(other.getOctets()) !== comparison.Equal;
    }

    /**
     * Returns if `this` is greater than `other`.
     */
    public gt(other: this): boolean {
        return this.byteContainer.compareWith(other.getOctets()) === comparison.Greater;
    }

    /**
     * Returns if `this` is lesser than `other`.
     */
    public lt(other: this): boolean {
        return this.byteContainer.compareWith(other.getOctets()) === comparison.Lesser;
    }

    /**
     * Returns if `this` is greater or equal than `other`.
     */
    public ge(other: this): boolean {
        const result = this.byteContainer.compareWith(other.getOctets());
        return result === comparison.Greater || result === comparison.Equal;
    }

    /**
     * Returns if `this` is lesser or equal than `other`.
     */
    public le(other: this): boolean {
        const result = this.byteContainer.compareWith(other.getOctets());
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
        return new (this.constructor as any)(this.byteContainer.add(amount));
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
        return new (this.constructor as any)(this.byteContainer.subtract(amount));
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
     * - A [[ByteContainer]] - for internal use only.
     */
    public constructor(input: string | ReadonlyArray<number> | ByteContainer) {
        if (input instanceof ByteContainer) {
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
            super(new ByteContainer(input));
        } else if (typeof input === "string") {
            const addressSplitted = input.split(".");
            if (addressSplitted.length !== IPV4_BYTES) {
                throw new AddressValueError(input);
            }

            const octets = new ByteContainer(addressSplitted.map(
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

    public getIpString(): string {
        if (typeof this._ipString === "undefined") {
            this._ipString = this.getOctets().join(".");
        }
        return this._ipString;
    }

    private isValidOctet(octet: number): boolean {
        return octet >= 0 && octet <= 255;
    }
}
