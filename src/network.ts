import {
    ByteArray,
} from './arrays';

import {
    Address,
    Address4,
} from './address';

import {
    AddressValueError,
} from './exceptions';

import {
    NETMASK_OCTETS,
    DECIMAL_DIGITS,
    IPV4_BYTES,
    IPV4_LENGTH,
} from './constants';

export abstract class Network<AddressType extends Address> {
    private addressConstructor: {new(input: ByteArray): AddressType};
    private _address: AddressType;
    private _netmask: AddressType
    private _prefix: number;
    private _hostmask: AddressType;
    private _broadcast: AddressType;
    private _numAddresses: number;

    protected constructor (address: AddressType, netmask: AddressType, addressConstructor: {new(input: ByteArray): AddressType}) {
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
            this._hostmask = new this.addressConstructor(
                this.netmask.octets.map((octet) => ~octet & 0xff)
            );
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


export class Network4 extends Network<Address4>{
    public constructor(input: string) {
        const [subaddress, subnetmask, nothing] = input.split("/");
        if (typeof nothing !== "undefined") {
            throw new AddressValueError(input);
        }

        if (typeof subnetmask === "undefined") {
            throw new AddressValueError(input);
        }

        const address = new Address4(subaddress);
        if (Array.from(subnetmask).every((ch) => DECIMAL_DIGITS.includes(ch))) {
            const prefix = parseInt(subnetmask, 10);
            if (prefix < 0 || prefix > IPV4_LENGTH) {
                throw new AddressValueError(subnetmask);
            }
            const fullBytes = Math.floor(prefix / 8);
            const partialByte = prefix % 8;
            const bytes: number[] = Array(IPV4_BYTES);
            if (fullBytes > 0) {
                bytes.fill(0xff, 0, fullBytes);
            }
            if (partialByte > 0) {
                bytes[IPV4_BYTES - fullBytes] = NETMASK_OCTETS[partialByte];
            }
            var netmask = new Address4(bytes);
        } else {
            var netmask = new Address4(subnetmask);
            if (!netmask.octets.every((octet) => NETMASK_OCTETS.includes(octet))) {
                throw new AddressValueError(subnetmask);
            }
        }
        super(address, netmask, Address4);
    }
}
