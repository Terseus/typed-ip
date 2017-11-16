import * as assert from "assert";

import {
    Address,
    Address4,
    AddressValueError,
} from "../src";


interface AddressInfo {
    address: string;
    octets: number[];
    decimal: number;
}

/* tslint:disable:object-literal-sort-keys */
const IPV4_VALID: AddressInfo[] = [
    {
        address: "0.0.0.0",
        octets: [0, 0, 0, 0],
        decimal: 0,
    },
    {
        address: "127.0.0.1",
        octets: [127, 0, 0, 1],
        decimal: 2130706433,
    },
    {
        address: "192.168.0.1",
        octets: [192, 168, 0, 1],
        decimal: 3232235521,
    },
    {
        address: "255.255.255.0",
        octets: [255, 255, 255, 0],
        decimal: 4294967040,
    },
    {
        address: "255.255.255.255",
        octets: [255, 255, 255, 255],
        decimal: 4294967295,
    },
];


function describeTestAddress(describeSuffix: string, addressConstructor: (data: AddressInfo) => Address4) {
    describe(`public interface ${describeSuffix}`, function() {
        it("should have the correct type", function() {
            IPV4_VALID.forEach((data) => {
                const address = addressConstructor(data);
                assert(address instanceof Address);
            });
        });
        it("should match string address", function() {
            IPV4_VALID.forEach((data) => {
                const address = addressConstructor(data);
                assert.equal(address.getIpString(), data.address);
            });
        });
        it("should match decimal address", function() {
            IPV4_VALID.forEach((data) => {
                const address = addressConstructor(data);
                assert.equal(address.getIpString(), data.address);
            });
        });
        it("should match octets", function() {
            IPV4_VALID.forEach((data) => {
                const address = addressConstructor(data);
                assert.equal(address.getDecimal(), data.decimal);
            });
        });
    });
}


describe("Address4", function() {
    describe("constructor from string", function() {
        it("should accept valid strings values", function() {
            IPV4_VALID.forEach((data) => {
                const address = new Address4(data.address);
            });
        });
        it("should reject invalid string values", function() {
            assert.throws(() => new Address4("256.0.0.0"), AddressValueError);
            assert.throws(() => new Address4("192.0.-1.0"), AddressValueError);
            assert.throws(() => new Address4("192.168.0"), AddressValueError);
            assert.throws(() => new Address4("192.168.0.1.0"), AddressValueError);
            assert.throws(() => new Address4("192.a.0.1"), AddressValueError);
        });
    });
    describe("constructor from octets", function() {
        it("should accept valid octets values", function() {
            IPV4_VALID.forEach((data) => {
                const address = new Address4(data.octets);
            });
        });
        it("should reject invalid octets values", function() {
            assert.throws(() => new Address4([-1]), AddressValueError);
            assert.throws(() => new Address4([256, 0, 0, 0]), AddressValueError);
        });
    });
    describe("arithmetic", function() {
        it("should add", function() {
            assert.deepEqual(new Address4("127.0.0.1").add([2]).getOctets(), [127, 0, 0, 3]);
            assert.notDeepEqual(new Address4("127.0.0.1").add([1]).getOctets(), [127, 0, 0, 3]);
        });
        it("should substract", function() {
            assert.deepEqual(new Address4("127.0.0.1").substract([2]).getOctets(), [126, 255, 255, 255]);
            assert.notDeepEqual(new Address4("127.0.0.1").substract([1]).getOctets(), [126, 255, 255, 255]);
        });
    });
    describe("comparisons", function() {
        it("should compare equal", function() {
            assert(new Address4("127.0.0.1").eq(new Address4("127.0.0.1")));
            assert(!new Address4("127.0.0.1").eq(new Address4("192.168.0.1")));
        });
        it("should compare not equal", function() {
            assert(new Address4("127.0.0.1").ne(new Address4("192.168.0.1")));
            assert(!new Address4("127.0.0.1").ne(new Address4("127.0.0.1")));
        });
        it("should compare greater than", function() {
            assert(new Address4("127.0.0.1").gt(new Address4("127.0.0.0")));
            assert(!new Address4("127.0.0.1").gt(new Address4("127.0.0.1")));
            assert(!new Address4("127.0.0.1").gt(new Address4("127.0.0.2")));
        });
        it("should compare lesser than", function() {
            assert(new Address4("127.0.0.1").lt(new Address4("127.0.0.2")));
            assert(!new Address4("127.0.0.1").lt(new Address4("127.0.0.1")));
            assert(!new Address4("127.0.0.1").lt(new Address4("127.0.0.0")));
        });
        it("should compare greater or equal than", function() {
            assert(new Address4("127.0.0.1").ge(new Address4("127.0.0.0")));
            assert(new Address4("127.0.0.1").ge(new Address4("127.0.0.1")));
            assert(!new Address4("127.0.0.1").ge(new Address4("127.0.0.2")));
        });
        it("should compare lesser or equal than", function() {
            assert(new Address4("127.0.0.1").le(new Address4("127.0.0.2")));
            assert(new Address4("127.0.0.1").le(new Address4("127.0.0.1")));
            assert(!new Address4("127.0.0.1").le(new Address4("127.0.0.0")));
        });
    });
    describeTestAddress("from string", (data: AddressInfo) => new Address4(data.address));
    describeTestAddress("from octets", (data: AddressInfo) => new Address4(data.octets));
});
