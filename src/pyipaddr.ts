const DECIMAL_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const NETMASK_OCTETS = [
    0,
    128,
    192,
    224,
    240,
    248,
    252,
    254,
    255,
];


export const IPV4_LENGTH = 32;
export const IPV4_BYTES = 4;


export class AddressValueError extends Error {
    public constructor(address: string | ReadonlyArray<number>) {
        super("Invalid address: " + address);
        // Needed for Typescript 2.1 and following
        // See https://github.com/Microsoft/TypeScript-wiki/blob/77a2a18a6e7bf8599bbe693243b1b9eb3044bfda/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, AddressValueError.prototype);
    }
}


export class NetmaskValueError extends Error {
    public constructor(netmask: string | ReadonlyArray<number>) {
        super("Invalid netmask: " + netmask);
        // Needed for Typescript 2.1 and following
        // See https://github.com/Microsoft/TypeScript-wiki/blob/77a2a18a6e7bf8599bbe693243b1b9eb3044bfda/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, NetmaskValueError.prototype);
    }
}


const enum comparison {
    Greater, Lesser, Equal,
}


type comparator<T> = (left: T, right: T) => comparison;


function compareArrays<T>(
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


function compareNumbers(left: number, right: number) {
    if (left > right) {
        return comparison.Greater;
    }

    if (right > left) {
        return comparison.Lesser;
    }

    return comparison.Equal;
}


function compareByteArrays(left: Uint8Array, right: Uint8Array) {
    return compareArrays(left, right, compareNumbers);
}


function addByteArrays(left: Uint8Array, right: Uint8Array) {
    if (right.length > left.length) {
        throw new Error("Unsupported operation: right cannot have more elements than left");
    }
    if (right.length < left.length) {
        right = new Uint8Array(Array(left.length - right.length).fill(0x00).concat(right));
    }
    const copy = new Uint8Array(left);
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


function substractByteArrays(left: Uint8Array, right: Uint8Array) {
    if (right.length > left.length) {
        throw new Error("Unsupported operation: right cannot have more elements than left");
    }
    if (right.length < left.length) {
        right = new Uint8Array(Array(left.length - right.length).fill(0x00).concat(right));
    }
    const copy = new Uint8Array(left);
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


export class IPv4Address {
    private _octets: Uint8Array;
    private _ipString: string;

    public constructor(address: string | ReadonlyArray<number> | Uint8Array) {
        if (address instanceof Uint8Array) {
            this._octets = new Uint8Array(address);
        } else if (address instanceof Array) {
            if (address.length > IPV4_BYTES) {
                throw new AddressValueError(address);
            }
            if (!address.every((byte) => byte > -1 && byte < 256)) {
                throw new AddressValueError(address);
            }
            if (address.length < IPV4_BYTES) {
                address = Array(IPV4_BYTES - address.length).fill(0x00).concat(address);
            }
            this._octets = new Uint8Array(address);
        } else if (typeof address === "string") {
            const addressSplitted = address.split(".");
            if (addressSplitted.length !== IPV4_BYTES) {
                throw new AddressValueError(address);
            }

            this._octets = new Uint8Array(addressSplitted.map(
                (octet) => {
                    if (!Array.from(octet).every((ch) => DECIMAL_DIGITS.includes(ch))) {
                        throw new AddressValueError(address as string);
                    }

                    const numberOctet = parseInt(octet, 10);
                    if (numberOctet < 0 || numberOctet > 255) {
                        throw new AddressValueError(address as string);
                    }

                    return numberOctet;
                },
            ));
        }
    }

    get ipString() {
        if (typeof this._ipString === "undefined") {
            this._ipString = this._octets.join(".");
        }

        return this._ipString;
    }

    get octets() {
        return this._octets;
    }

    public eq(other: IPv4Address) {
        return compareByteArrays(this.octets, other.octets) === comparison.Equal;
    }

    public ne(other: IPv4Address) {
        return compareByteArrays(this.octets, other.octets) !== comparison.Equal;
    }

    public gt(other: IPv4Address) {
        return compareByteArrays(this.octets, other.octets) === comparison.Greater;
    }

    public lt(other: IPv4Address) {
        return compareByteArrays(this.octets, other.octets) === comparison.Lesser;
    }

    public ge(other: IPv4Address) {
        const result = compareByteArrays(this.octets, other.octets);
        return result === comparison.Greater || result === comparison.Equal;
    }

    public le(other: IPv4Address) {
        const result = compareByteArrays(this.octets, other.octets);
        return result === comparison.Lesser || result === comparison.Equal;
    }

    public add(amount: ReadonlyArray<number>) {
        return new IPv4Address(addByteArrays(this.octets, new Uint8Array(amount)));
    }

    public substract(amount: ReadonlyArray<number>) {
        return new IPv4Address(substractByteArrays(this.octets, new Uint8Array(amount)));
    }

    public toString() {
        return this.ipString;
    }
}


export class IPv4Network {
    private _address: IPv4Address;
    private _netmask: IPv4Address;
    private _prefix: number;
    private _hostmask: IPv4Address;
    private _broadcast: IPv4Address;
    private _numAddresses: number;

    public constructor(address: string) {
        const [subaddress, subnetmask, nothing] = address.split("/");
        if (typeof nothing !== "undefined") {
            throw new AddressValueError(address);
        }

        if (typeof subnetmask === "undefined") {
            throw new NetmaskValueError(address);
        }

        this._address = new IPv4Address(subaddress);
        if (Array.from(subnetmask).every((ch) => DECIMAL_DIGITS.includes(ch))) {
            const netmask = parseInt(subnetmask, 10);
            if (netmask < 0 || netmask > IPV4_LENGTH) {
                throw new NetmaskValueError(subnetmask);
            }
            const fullBytes = Math.floor(netmask / 8);
            const partialByte = netmask % 8;
            const bytes: number[] = Array(IPV4_BYTES);
            if (fullBytes > 0) {
                bytes.fill(0xff, 0, fullBytes);
            }
            if (partialByte > 0) {
                bytes[IPV4_BYTES - fullBytes] = NETMASK_OCTETS[partialByte];
            }
            this._netmask = new IPv4Address(bytes);
        } else {
            this._netmask = new IPv4Address(subnetmask);
            if (!this._netmask.octets.every((octet) => NETMASK_OCTETS.includes(octet))) {
                throw new NetmaskValueError(subnetmask);
            }
        }
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
            this._hostmask = new IPv4Address(this.netmask.octets.map((octet) => ~octet & 0xff).join("."));
        }

        return this._hostmask;
    }

    get broadcast() {
        if (typeof this._broadcast === "undefined") {
            this._broadcast = new IPv4Address([
                this.address.octets[0] | this.hostmask.octets[0],
                this.address.octets[1] | this.hostmask.octets[1],
                this.address.octets[2] | this.hostmask.octets[2],
                this.address.octets[3] | this.hostmask.octets[3],
            ].join("."));
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

    public * hosts(start?: IPv4Address) {
        if (!start) {
            start = this.address;
        }

        let address = start;
        const maxAddress = this.broadcast.substract([1]);
        while (address.lt(maxAddress)) {
            address = address.add([1]);
            yield address;
        }
    }

    public contains(other: IPv4Address) {
        return (this.broadcast.ge(other) && this.address.le(other));
    }
}
