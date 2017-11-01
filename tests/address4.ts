import * as assert from "assert";
import {
    AddressValueError,
    Address,
    Network,
    Address4,
    Network4,
} from "../src";


interface AddressInfo {
    [address: string]: number[];
}

interface NetworkInfo {
    stringAddress: string;
    octetsAddress: number[];
    prefix: number;
    stringNetmask: string;
    octetsNetmask: number[];
    stringHostmask: string;
    octetsHostmask: number[];
    stringBroadcast: string;
    octetsBroadcast: number[];
    numAddresses: number;
    inputPrefix?: string;
    inputAddress?: string;
}


const IPV4_VALID: AddressInfo = {
    "0.0.0.0": [0, 0, 0, 0],
    "127.0.0.1": [127, 0, 0, 1],
    "192.168.0.1": [192, 168, 0, 1],
    "255.255.255.255": [255, 255, 255, 255],
};

const IPV4_NETWORKS_VALID: NetworkInfo[] = (() => {
    /* tslint:disable:object-literal-sort-keys */
    return [{
        stringAddress: "192.168.0.0",
        octetsAddress: [192, 168, 0, 0],
        prefix: 24,
        stringNetmask: "255.255.255.0",
        octetsNetmask: [255, 255, 255, 0],
        stringHostmask: "0.0.0.255",
        octetsHostmask: [0, 0, 0, 255],
        stringBroadcast: "192.168.0.255",
        octetsBroadcast: [192, 168, 0, 255],
        numAddresses: 256,
    }, {
        stringAddress: "10.0.0.0",
        octetsAddress: [10, 0, 0, 0],
        prefix: 8,
        stringNetmask: "255.0.0.0",
        octetsNetmask: [255, 0, 0, 0],
        stringHostmask: "0.255.255.255",
        octetsHostmask: [0, 255, 255, 255],
        stringBroadcast: "10.255.255.255",
        octetsBroadcast: [10, 255, 255, 255],
        numAddresses: 16777216,
    }, {
        stringAddress: "148.56.0.0",
        octetsAddress: [148, 56, 0, 0],
        prefix: 20,
        stringNetmask: "255.255.240.0",
        octetsNetmask: [255, 255, 240, 0],
        stringHostmask: "0.0.15.255",
        octetsHostmask: [0, 0, 15, 255],
        stringBroadcast: "148.56.15.255",
        octetsBroadcast: [148, 56, 15, 255],
        numAddresses: 4096,
    }].map((network: NetworkInfo) => {
        network.inputPrefix = `${network.stringAddress}/${network.prefix}`;
        network.inputAddress = `${network.stringAddress}/${network.stringNetmask}`;
        return network;
    });
})();


function compareArray<T>(array1: T[], array2: T[]) {
    if (array1.length !== array2.length) {
        return false;
    }

    for (let index = 0; index < array1.length; index++) {
        if (array1[index] !== array2[index]) {
            return false;
        }
    }

    return true;
}


function assertArrayEquals<T>(original: T[], expected: T[], message?: string) {
    if (!compareArray(original, expected)) {
        throw new Error(message || JSON.stringify(original) + " - " + JSON.stringify(expected));
    }
}


function assertNetworkCheck(net: Network4, data: NetworkInfo) {
    assert(net instanceof Network);
    assert(net.address instanceof Address4);
    assert.equal(net.address.ipString, data.stringAddress);
    assert.deepEqual(net.address.octets, data.octetsAddress);
    assert(net.netmask instanceof Address4);
    assert.equal(net.netmask.ipString, data.stringNetmask);
    assert.deepEqual(net.netmask.octets, data.octetsNetmask);
    assert.equal(net.prefix, data.prefix);
    assert(net.hostmask instanceof Address4);
    assert.equal(net.hostmask.ipString, data.stringHostmask);
    assert.deepEqual(net.hostmask.octets, data.octetsHostmask);
    assert(net.broadcast instanceof Address4);
    assert.equal(net.broadcast.ipString, data.stringBroadcast);
    assert.deepEqual(net.broadcast.octets, data.octetsBroadcast);
    assert.equal(net.numAddresses, data.numAddresses);
    assert.equal(net.hosts().next().value.ipString, new Address4(data.octetsAddress).add([1]).ipString);
    assert(
        net.hosts(new Address4(data.octetsBroadcast).substract([1])).next().done,
        "Last IP check failed: " + new Address4(data.octetsBroadcast).substract([1]).ipString,
    );
    assert(
        net.contains(new Address4(data.octetsAddress).add([1])),
        "First IP contains failed: " + new Address4(data.octetsAddress).add([1]).ipString,
    );
    assert(
        net.contains(new Address4(data.octetsBroadcast).substract([1])),
        "Last IP contains failed: " + new Address4(data.octetsBroadcast).substract([1]).ipString,
    );
    assert(
        !net.contains(new Address4(data.octetsAddress).substract([1])),
        "Before first IP contains failed: " + new Address4(data.octetsAddress).substract([1]).ipString,
    );
    assert(
        !net.contains(new Address4(data.octetsBroadcast).add([1])),
        "After last IP contains failed: " + new Address4(data.octetsBroadcast).add([1]).ipString,
    );
}


describe("Address4", function() {
    describe("constructor from string", function() {
        it("should accept valid strings values", function() {
            for (const ipString in IPV4_VALID) {
                const ip = new Address4(ipString);
                assert.deepEqual(ip.octets, IPV4_VALID[ipString]);
                assert.equal(ip.ipString, ipString);
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
                assert.equal(ip.ipString, ipString);
                assert.deepEqual(ip.octets, IPV4_VALID[ipString]);
            }
        });
        it("should reject invalid octets values", function() {
            assert.throws(() => new Address4([-1]), AddressValueError);
            assert.throws(() => new Address4([256, 0, 0, 0]), AddressValueError);
        });
        it("should be subclass of Address", function () {
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
            assertArrayEquals(Array.from(new Address4("127.0.0.1").octets), [127, 0, 0, 1]);
            assertArrayEquals(Array.from(new Address4("255.255.255.255").octets), [255, 255, 255, 255]);
        });
    });
});


describe("Network4", function() {
    describe("constructor with prefix netmask", function() {
        it("should accept valid values", function() {
            IPV4_NETWORKS_VALID.forEach(
                (data) => assertNetworkCheck(new Network4(data.inputPrefix as string), data),
            );
        });
    });
    describe("constructor with address netmask", function() {
        it("should accept valid values", function() {
            IPV4_NETWORKS_VALID.forEach(
                (data) => assertNetworkCheck(new Network4(data.inputAddress as string), data),
            );
        });
    });
});
