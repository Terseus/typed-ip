import {
    addByteArrays,
    ByteArray,
    compareNumberArrays,
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


export abstract class Address {
    private _octets: ByteArray;

    public constructor(octets: ByteArray) {
        this._octets = octets;
    }

    abstract get ipString(): string;

    get octets() {
        return this._octets;
    }

    public toString() {
        return this.ipString;
    }

    public eq(other: this) {
        return compareNumberArrays(this.octets as any, other.octets as any) === comparison.Equal;
    }

    public ne(other: this) {
        return compareNumberArrays(this.octets as any, other.octets as any) !== comparison.Equal;
    }

    public gt(other: this) {
        return compareNumberArrays(this.octets as any, other.octets as any) === comparison.Greater;
    }

    public lt(other: this) {
        return compareNumberArrays(this.octets as any, other.octets as any) === comparison.Lesser;
    }

    public ge(other: this) {
        const result = compareNumberArrays(this.octets as any, other.octets as any);
        return result === comparison.Greater || result === comparison.Equal;
    }

    public le(other: this) {
        const result = compareNumberArrays(this.octets as any, other.octets as any);
        return result === comparison.Lesser || result === comparison.Equal;
    }

    public add(amount: ReadonlyArray<number>): this {
        return new (this.constructor as any)(addByteArrays(this.octets as any, amount));
    }

    public substract(amount: ReadonlyArray<number>): this {
        return new (this.constructor as any)(substractByteArrays(this.octets as any, amount));
    }
}


export class Address4 extends Address {
    private _ipString: string;

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

    public get ipString() {
        if (typeof this._ipString === "undefined") {
            this._ipString = this.octets.join(".");
        }
        return this._ipString;
    }

    private isValidOctet(octet: number) {
        return octet >= 0 && octet <= 255;
    }
}
