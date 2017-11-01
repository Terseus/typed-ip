import {
    NETMASK_OCTETS,
} from './constants';

import {
    comparison,
    compareNumberArrays,
    addNumberArrays,
    substractNumberArrays,
} from './arrays';

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


export abstract class Network<AddressType extends Address> {
    private addressConstructor: {new(input: Uint8Array): AddressType};
    private _address: AddressType;
    private _netmask: AddressType
    private _prefix: number;
    private _hostmask: AddressType;
    private _broadcast: AddressType;
    private _numAddresses: number;

    public constructor (address: AddressType, netmask: AddressType, addressConstructor: {new(input: Uint8Array): AddressType}) {
        this.addressConstructor = addressConstructor;
        this._address = address;
        this._netmask = netmask;
    }

    get address() {
        return this._address;
    }

    get netmask() {
        return this._netmask;
    }

    get prefix() {
        if (typeof this._prefix === "undefined") {
            this._prefix = this.netmask.octets.reduce(
                (prefix, octet) => prefix + NETMASK_OCTETS.indexOf(octet),
                0,
            );
        }
        return this._prefix;
    }

    get hostmask() {
        if (typeof this._hostmask === "undefined") {
            this._hostmask = new this.addressConstructor(this.netmask.octets.map((octet) => ~octet & 0xff));
        }
        return this._hostmask;
    }

    get broadcast() {
        if (typeof this._broadcast === "undefined") {
            this._broadcast = new this.addressConstructor(Uint8Array.from(
                this.address.octets.keys()
            ).map(
                (key) => this.address.octets[key] | this.hostmask.octets[key]
            ));
        }
        return this._broadcast;
    }

    get numAddresses() {
        if (typeof this._numAddresses === "undefined") {
            this._numAddresses = this.hostmask.octets.reduce(
                (total, octet, index) => total + octet * (256 ** (this.hostmask.octets.length - index - 1)),
                1,
            );
        }
        return this._numAddresses;
    }

    public * hosts(start?: AddressType) {
        if (typeof start === "undefined") {
            start = this.address;
        }

        let address = start;
        const maxAddress = this.broadcast.substract([1]);
        while (address.lt(maxAddress)) {
            address = address.add([1]);
            yield address;
        }
    }

    public contains(other: AddressType) {
        return (this.broadcast.ge(other) && this.address.le(other));
    }
}
