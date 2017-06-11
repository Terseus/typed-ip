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
export const IPV4_MAX_VALUE = (2 ** IPV4_LENGTH) - 1;


export class AddressValueError extends Error {
    public constructor(address: string | number) {
        super("Invalid address: " + address);
    }
}


export class NetmaskValueError extends Error {
    public constructor(netmask: string | number) {
        super("Invalid netmask: " + netmask);
    }
}


export class IPv4Address {
    private _octets: Uint8Array;
    private _ipNumber: number;
    private _ipString: string;

    public constructor(address: string | number) {
        if (typeof address === "number") {
            if (address < 0 || address > IPV4_MAX_VALUE) {
                throw new AddressValueError(address);
            }

            this._octets = new Uint8Array([
                (address >> 24) & 0xff,
                (address >> 16) & 0xff,
                (address >> 8) & 0xff,
                address & 0xff,
            ]);
        } else if (typeof address === "string") {
            const addressSplitted = address.split(".");
            if (addressSplitted.length !== 4) {
                throw new AddressValueError(address);
            }

            this._octets = new Uint8Array(addressSplitted.map(
                (octet) => {
                    if (!Array.from(octet).every((ch) => DECIMAL_DIGITS.includes(ch))) {
                        throw new AddressValueError(address);
                    }

                    const numberOctet = parseInt(octet, 10);
                    if (numberOctet < 0 || numberOctet > 255) {
                        throw new AddressValueError(address);
                    }

                    return numberOctet;
                },
            ));
        }
    }

    get ipNumber() {
        if (typeof this._ipNumber === "undefined") {
            this._ipNumber = this._octets.reduce(
                (total, octet, index) => total + octet * (256 ** (this._octets.length - index - 1)),
                0,
            );
        }

        return this._ipNumber;
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
        return this.ipNumber === other.ipNumber;
    }

    public ne(other: IPv4Address) {
        return this.ipNumber !== other.ipNumber;
    }

    public gt(other: IPv4Address) {
        return this.ipNumber > other.ipNumber;
    }

    public lt(other: IPv4Address) {
        return this.ipNumber < other.ipNumber;
    }

    public ge(other: IPv4Address) {
        return this.ipNumber >= other.ipNumber;
    }

    public le(other: IPv4Address) {
        return this.ipNumber <= other.ipNumber;
    }

    public add(amount: number) {
        return new IPv4Address(this.ipNumber + amount);
    }

    public substract(amount: number) {
        return new IPv4Address(this.ipNumber - amount);
    }

    public toString() {
        return this.ipString;
    }

    public valueOf() {
        return this.ipNumber;
    }
}


export class IPv4Network {
    private _address: IPv4Address;
    private _netmask: IPv4Address;
    private _prefix: number;
    private _hostmask: IPv4Address;
    private _broadcast: IPv4Address;

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
            if (netmask < 0 || netmask > 32) {
                throw new NetmaskValueError(subnetmask);
            }
            this._netmask = new IPv4Address((2 ** 32) - (2 ** (32 - netmask)));
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
        return this.hostmask.ipNumber + 1;
    }

    public * hosts(start?: IPv4Address) {
        if (!start) {
            start = this.address;
        }

        let address = start;
        while (address.ipNumber < this.broadcast.ipNumber - 1) {
            address = new IPv4Address(address.ipNumber + 1);
            yield address;
        }
    }

    public contains(other: IPv4Address) {
        return (this.broadcast.ge(other) && this.address.le(other));
    }
}
