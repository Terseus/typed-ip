import {
    AddressValueError,
} from './exceptions';

import {
    DECIMAL_DIGITS,
    NETMASK_OCTETS,
    IPV4_LENGTH,
    IPV4_BYTES,
} from './constants';

import {
    Address,
    Network,
} from './address';



export class IPv4Address extends Address {
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


export class IPv4Network extends Network<IPv4Address>{
    public constructor(input: string) {
        const [subaddress, subnetmask, nothing] = input.split("/");
        if (typeof nothing !== "undefined") {
            throw new AddressValueError(input);
        }

        if (typeof subnetmask === "undefined") {
            throw new AddressValueError(input);
        }

        const address = new IPv4Address(subaddress);
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
            var netmask = new IPv4Address(bytes);
        } else {
            var netmask = new IPv4Address(subnetmask);
            if (!netmask.octets.every((octet) => NETMASK_OCTETS.includes(octet))) {
                throw new AddressValueError(subnetmask);
            }
        }
        super(address, netmask, IPv4Address);
    }
}
