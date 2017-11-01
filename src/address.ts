import {
    comparison,
    compareNumberArrays,
    addNumberArrays,
    substractNumberArrays,
} from './arrays';

import {
    AddressValueError,
} from './exceptions';

import {
    DECIMAL_DIGITS,
    IPV4_BYTES,
} from './constants';


export abstract class Address {
    private _octets: Uint8Array;
    private _ipString: string;

    public constructor(input: string);
    public constructor(input: ReadonlyArray<number>);
    public constructor(input: Uint8Array);
    public constructor(input: any) {
        if (input instanceof Uint8Array) {
            this._octets = input;
        } else if (input instanceof Array) {
            this._octets = this.getOctetsFromArray(input);
        } else if (typeof input === "string") {
            this._octets = this.getOctetsFromString(input);
        }
    }

    protected abstract getStringFromOctets(octets: Uint8Array) : string;
    protected abstract getOctetsFromArray(address: ReadonlyArray<number>) : Uint8Array;
    protected abstract getOctetsFromString(address: string) : Uint8Array;

    get ipString() {
        if (typeof this._ipString === "undefined") {
            this._ipString = this.getStringFromOctets(this.octets);
        }

        return this._ipString;
    }

    get octets() {
        return this._octets;
    }

    public toString() {
        return this.ipString;
    }

    public eq(other: this) {
        return compareNumberArrays(this.octets, other.octets) === comparison.Equal;
    }

    public ne(other: this) {
        return compareNumberArrays(this.octets, other.octets) !== comparison.Equal;
    }

    public gt(other: this) {
        return compareNumberArrays(this.octets, other.octets) === comparison.Greater;
    }

    public lt(other: this) {
        return compareNumberArrays(this.octets, other.octets) === comparison.Lesser;
    }

    public ge(other: this) {
        const result = compareNumberArrays(this.octets, other.octets);
        return result === comparison.Greater || result === comparison.Equal;
    }

    public le(other: this) {
        const result = compareNumberArrays(this.octets, other.octets);
        return result === comparison.Lesser || result === comparison.Equal;
    }

    public add(amount: ReadonlyArray<number>) {
        return new (<any> this.constructor)(addNumberArrays(this.octets, new Uint8Array(amount)));
    }

    public substract(amount: ReadonlyArray<number>) {
        return new (<any> this.constructor)(substractNumberArrays(this.octets, new Uint8Array(amount)));
    }
}


export class Address4 extends Address {
    private isValidOctet(octet: number) {
        return octet >= 0 && octet <= 255;
    }

    protected getStringFromOctets(octets: Uint8Array) {
        return octets.join(".");
    }

    protected getOctetsFromArray(address: ReadonlyArray<number>) {
        if (address.length > IPV4_BYTES) {
            throw new AddressValueError(address);
        }
        if (!address.every((octet) => this.isValidOctet(octet))) {
            throw new AddressValueError(address);
        }
        if (address.length < IPV4_BYTES) {
            address = Array(IPV4_BYTES - address.length).fill(0x00).concat(address);
        }
        return new Uint8Array(address);
    }

    protected getOctetsFromString(address: string) {
        const addressSplitted = address.split(".");
        if (addressSplitted.length !== IPV4_BYTES) {
            throw new AddressValueError(address);
        }

        const octets = new Uint8Array(addressSplitted.map(
            (octet) => {
                if (!Array.from(octet).every((ch) => DECIMAL_DIGITS.includes(ch))) {
                    throw new AddressValueError(address as string);
                }

                const numberOctet = parseInt(octet, 10);
                if (!this.isValidOctet(numberOctet)) {
                    throw new AddressValueError(address as string);
                }

                return numberOctet;
            },
        ));
        return octets;
    }
}
