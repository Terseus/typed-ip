import {
    ByteContainer,
    isDecimalString,
} from "./arrays";

import {
    Address,
    Address4,
    Address6,
} from "./address";

import {
    AddressValueError,
} from "./exceptions";

import {
    IPV4_BYTES,
    IPV4_LENGTH,
    IPV6_BYTES,
    IPV6_LENGTH,
    NETMASK_OCTETS,
} from "./constants";


/**
 * Base class for network implementations.
 *
 * This class is abstract and not meant to be used directly outside of the
 * library except for type declarations and checks.
 */
export abstract class Network<AddressType extends Address> {
    private addressConstructor: {new(input: ByteContainer): AddressType};
    private _address: AddressType;
    private _netmask: AddressType;
    private _prefix: number|undefined;
    private _wildcard: AddressType|undefined;
    private _broadcast: AddressType|undefined;
    private _numAddresses: number|undefined;

    protected constructor(
        address: AddressType,
        netmask: AddressType,
        addressConstructor: {new(input: ByteContainer): AddressType},
    ) {
        this.addressConstructor = addressConstructor;
        this._address = address;
        this._netmask = netmask;
    }

    /**
     * Returns the network address.
     */
    public getAddress(): AddressType {
        return this._address;
    }

    /**
     * Returns the network mask.
     */
    public getNetmask(): AddressType {
        return this._netmask;
    }

    /**
     * Returns the network prefix.
     */
    public getPrefix(): number {
        if (typeof this._prefix === "undefined") {
            this._prefix = this.getNetmask().getOctets().reduce(
                (prefix, octet) => prefix + NETMASK_OCTETS.indexOf(octet),
                0,
            );
        }
        return this._prefix;
    }

    /**
     * Returns the network wildcard (the netmask inverted).
     */
    public getWildcard(): AddressType {
        if (typeof this._wildcard === "undefined") {
            this._wildcard = new this.addressConstructor(
                new ByteContainer(this.getNetmask().getOctets().map((octet) => ~octet & 0xff)),
            );
        }
        return this._wildcard;
    }

    /**
     * Returns the network broadcast address.
     */
    public getBroadcast(): AddressType {
        if (typeof this._broadcast === "undefined") {
            this._broadcast = new this.addressConstructor(new ByteContainer(
                this.getAddress().getOctets().map(
                    (value, index) => value | this.getWildcard().getOctets()[index],
                ),
            ));
        }
        return this._broadcast;
    }

    /**
     * Returns the number of addresses in this network.
     *
     * WARNING!
     * Due to Javascript limitations (and because I don't want to depend on a
     * bignum library) this function may returns inaccurate results if the
     * network can hold more than 2^53 addresses.
     */
    public getNumAddresses(): number {
        if (typeof this._numAddresses === "undefined") {
            this._numAddresses = this.getWildcard().getOctets().reduce(
                (total, octet, index) => total + octet * (256 ** (this.getWildcard().getOctets().length - index - 1)),
                1,
            );
        }
        return this._numAddresses;
    }

    /**
     * Returns an iterator with all the addresses of the network starting from
     * `start` address.
     *
     * If `start` address is not supplied, network `address` property will be
     * used instead.
     */
    public * hosts(start?: AddressType): IterableIterator<AddressType> {
        if (typeof start === "undefined") {
            start = this.getAddress();
        }

        let address = start;
        const maxAddress = this.getBroadcast().substract([1]);
        while (address.lt(maxAddress)) {
            address = address.add([1]);
            yield address;
        }
    }

    /**
     * Returns if the network holds the given address.
     */
    public contains(other: AddressType): boolean {
        return (this.getBroadcast().ge(other) && this.getAddress().le(other));
    }
}


/**
 * An IPv4 network.
 *
 * The objects of this class are meant to be immutable.
 */
export class Network4 extends Network<Address4> {
    /**
     * Constructs a new network instance.
     *
     * The input can be a string representing the network address in the form
     * of "address/prefix" or "address/netmask".
     */
    public constructor(input: string) {
        const [subaddress, subnetmask, nothing] = input.split("/");
        if (typeof nothing !== "undefined") {
            throw new AddressValueError(input);
        }

        if (typeof subnetmask === "undefined") {
            throw new AddressValueError(input);
        }

        const inputAddress = new Address4(subaddress);
        let netmask: Address4;
        if (isDecimalString(subnetmask)) {
            const prefix = parseInt(subnetmask, 10);
            if (prefix < 0 || prefix > IPV4_LENGTH) {
                throw new AddressValueError(subnetmask);
            }
            const fullBytes = Math.floor(prefix / 8);
            const partialByte = prefix % 8;
            const bytes: number[] = new Array(IPV4_BYTES).fill(0);
            if (fullBytes > 0) {
                bytes.fill(0xff, 0, fullBytes);
            }
            if (partialByte > 0) {
                bytes[IPV4_BYTES - fullBytes] = NETMASK_OCTETS[partialByte];
            }
            netmask = new Address4(bytes);
        } else {
            netmask = new Address4(subnetmask);
            if (!netmask.getOctets().every((octet) => NETMASK_OCTETS.includes(octet))) {
                throw new AddressValueError(subnetmask);
            }
        }
        const address = new Address4(inputAddress.getOctets().map(
            (value, index) => value & netmask.getOctets()[index],
        ));
        super(address, netmask, Address4);
    }
}


export class Network6 extends Network<Address6> {
    /**
     * Constructs a new network instance.
     *
     * The input should be a string representing the network address in the
     * form of "address/prefix".
     */
    public constructor(input: string) {
        const [subaddress, subprefix, nothing] = input.split("/");
        if (typeof nothing !== "undefined") {
            throw new AddressValueError(input);
        }
        if (typeof subprefix === "undefined") {
            throw new AddressValueError(input);
        }

        const address = new Address6(subaddress);
        const prefix = parseInt(subprefix, 10);
        if (prefix < 0 || prefix > IPV6_LENGTH) {
            throw new AddressValueError(input);
        }
        const fullBytes = Math.floor(prefix / 8);
        const partialByte = prefix % 8;
        const bytes: number[] = new Array(IPV6_BYTES).fill(0);
        if (fullBytes > 0) {
            bytes.fill(0xff, 0, fullBytes);
        }
        if (partialByte > 0) {
            bytes[IPV6_BYTES - fullBytes] = NETMASK_OCTETS[partialByte];
        }
        const netmask = new Address6(bytes);
        super(address, netmask, Address6);
    }
}
