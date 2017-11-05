import * as assert from "assert";

import {
    Address,
    Address4,
    AddressValueError,
} from "../src";


interface AddressInfo {
    [address: string]: number[];
}


const IPV4_VALID: AddressInfo = {
    "0.0.0.0": [0, 0, 0, 0],
    "127.0.0.1": [127, 0, 0, 1],
    "192.168.0.1": [192, 168, 0, 1],
    "255.255.255.255": [255, 255, 255, 255],
};


describe("Address4", function() {
    describe("constructor from string", function() {
        it("should accept valid strings values", function() {
            for (const ipString in IPV4_VALID) {
                const ip = new Address4(ipString);
                assert.deepEqual(ip.getOctets(), IPV4_VALID[ipString]);
                assert.equal(ip.getIpString(), ipString);
            }
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
            for (const ipString in IPV4_VALID) {
                const ip = new Address4(IPV4_VALID[ipString]);
                assert.equal(ip.getIpString(), ipString);
                assert.deepEqual(ip.getOctets(), IPV4_VALID[ipString]);
            }
        });
        it("should reject invalid octets values", function() {
            assert.throws(() => new Address4([-1]), AddressValueError);
            assert.throws(() => new Address4([256, 0, 0, 0]), AddressValueError);
        });
        it("should be subclass of Address", function() {
            assert(new Address4(IPV4_VALID[0]) instanceof Address);
        });
    });
    describe("arithmetic", function() {
        it("should add", function() {
            assert(new Address4("127.0.0.1").add([2]).eq(new Address4("127.0.0.3")));
            assert(!new Address4("127.0.0.1").add([1]).eq(new Address4("127.0.0.3")));
        });
        it("should substract", function() {
            assert(new Address4("127.0.0.1").substract([2]).eq(new Address4("126.255.255.255")));
            assert(!new Address4("127.0.0.1").substract([1]).eq(new Address4("126.255.255.255")));
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
    describe("octets", function() {
        it("should return correct octets", function() {
            assert.deepEqual(Array.from(new Address4("127.0.0.1").getOctets()), [127, 0, 0, 1]);
            assert.deepEqual(Array.from(new Address4("255.255.255.255").getOctets()), [255, 255, 255, 255]);
        });
    });
});
