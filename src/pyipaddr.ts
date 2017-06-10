const DECIMAL_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];


export const IPV4_LENGTH = 32;
export const IPV4_MAX_VALUE = (2 ** IPV4_LENGTH) - 1;


export class AddressValueError extends Error {
    constructor(address: string | number) {
        super("Invalid address: " + address);
    }
}


export function ipv4_string_to_number(address: string) {
        const octets = address.split(".");
        if (octets.length !== 4) {
            throw new AddressValueError(address);
        }

        if (!octets.every(
            (octet) => Array.from(octet).every(
                (digit) => DECIMAL_DIGITS.includes(digit),
            ),
        )) {
            throw new AddressValueError(address);
        }

        const numberOctets = octets.map((octet) => parseInt(octet, 10));
        if (!numberOctets.every((octet) => octet >= 0 && octet <= 255)) {
            throw new AddressValueError(address);
        }

        return (numberOctets[0] * (256 ** 3) +
                numberOctets[1] * (256 ** 2) +
                numberOctets[2] * (256 ** 1) +
                numberOctets[3]);
}


export function ipv4_number_to_string(address: number) {
    if (address < 0 || address > IPV4_MAX_VALUE) {
        throw new AddressValueError(address);
    }

    return [
        "" + ((address >> 24) & 0xff),
        "" + ((address >> 16) & 0xff),
        "" + ((address >> 8) & 0xff),
        "" + (address & 0xff),
    ].join(".");
}


export class IPv4Address {
    private _ipNumber: number;
    private _ipString: string;

    public constructor(address: string | number) {
        if (typeof address === "number") {
            this._constructor_from_number(address);
        } else if (typeof address === "string") {
            this._constructor_from_string(address);
        }
    }

    get ipNumber() {
        return this._ipNumber;
    }

    get ipString() {
        return this._ipString;
    }

    public eq(other: IPv4Address) {
        return this._ipNumber === other._ipNumber;
    }

    public ne(other: IPv4Address) {
        return this._ipNumber !== other._ipNumber;
    }

    public gt(other: IPv4Address) {
        return this._ipNumber > other._ipNumber;
    }

    public lt(other: IPv4Address) {
        return this._ipNumber < other._ipNumber;
    }

    public ge(other: IPv4Address) {
        return this._ipNumber >= other._ipNumber;
    }

    public le(other: IPv4Address) {
        return this._ipNumber <= other._ipNumber;
    }

    public add(amount: number) {
        return new IPv4Address(this._ipNumber + amount);
    }

    public substract(amount: number) {
        return new IPv4Address(this._ipNumber - amount);
    }

    public toString() {
        return this._ipString;
    }

    public valueOf() {
        return this._ipNumber;
    }

    private _constructor_from_number(address: number) {
        this._ipString = ipv4_number_to_string(address);
        this._ipNumber = address;
    }

    private _constructor_from_string(address: string) {
        this._ipNumber = ipv4_string_to_number(address);
        this._ipString = address;
    }
}
