import * as assert from "assert";
import {
    Address4,
    Network,
    Network4,
} from "../src";


interface NetworkInfo {
    inputPrefix: string;
    inputAddress: string;
    stringAddress: string;
    octetsAddress: number[];
    prefix: number;
    stringNetmask: string;
    octetsNetmask: number[];
    stringWildcard: string;
    octetsWildcard: number[];
    stringBroadcast: string;
    octetsBroadcast: number[];
    numAddresses: number;
}

/* tslint:disable:object-literal-sort-keys */
const IPV4_NETWORKS_VALID: NetworkInfo[] = (() => [{
        inputAddress: "192.168.0.0/255.255.255.0",
        inputPrefix: "192.168.0.0/24",
        stringAddress: "192.168.0.0",
        octetsAddress: [192, 168, 0, 0],
        prefix: 24,
        stringNetmask: "255.255.255.0",
        octetsNetmask: [255, 255, 255, 0],
        stringWildcard: "0.0.0.255",
        octetsWildcard: [0, 0, 0, 255],
        stringBroadcast: "192.168.0.255",
        octetsBroadcast: [192, 168, 0, 255],
        numAddresses: 256,
    }, {
        inputAddress: "10.0.0.0/255.0.0.0",
        inputPrefix: "10.0.0.0/8",
        stringAddress: "10.0.0.0",
        octetsAddress: [10, 0, 0, 0],
        prefix: 8,
        stringNetmask: "255.0.0.0",
        octetsNetmask: [255, 0, 0, 0],
        stringWildcard: "0.255.255.255",
        octetsWildcard: [0, 255, 255, 255],
        stringBroadcast: "10.255.255.255",
        octetsBroadcast: [10, 255, 255, 255],
        numAddresses: 16777216,
    }, {
        inputAddress: "148.56.0.0/255.255.240.0",
        inputPrefix: "148.56.0.0/20",
        stringAddress: "148.56.0.0",
        octetsAddress: [148, 56, 0, 0],
        prefix: 20,
        stringNetmask: "255.255.240.0",
        octetsNetmask: [255, 255, 240, 0],
        stringWildcard: "0.0.15.255",
        octetsWildcard: [0, 0, 15, 255],
        stringBroadcast: "148.56.15.255",
        octetsBroadcast: [148, 56, 15, 255],
        numAddresses: 4096,
    }, {
        inputAddress: "192.168.0.40/255.255.248.0",
        inputPrefix: "192.168.0.40/21",
        stringAddress: "192.168.0.0",
        octetsAddress: [192, 168, 0, 0],
        prefix: 21,
        stringNetmask: "255.255.248.0",
        octetsNetmask: [255, 255, 248, 0],
        stringWildcard: "0.0.7.255",
        octetsWildcard: [0, 0, 7, 255],
        stringBroadcast: "192.168.7.255",
        octetsBroadcast: [192, 168, 7, 255],
        numAddresses: 2048,
    }]
)();


function describeTestNetwork(describeSuffix: string, inputAccessor: (data: NetworkInfo) => string) {
    describe(`public interface ${describeSuffix}`, function() {
        it("should have the correct types", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(net instanceof Network);
                assert(net.getAddress() instanceof Address4);
                assert(net.getNetmask() instanceof Address4);
                assert(net.getWildcard() instanceof Address4);
                assert(net.getBroadcast() instanceof Address4);
            });
        });
        it("should match network address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getAddress().getIpString(), data.stringAddress);
                assert.deepEqual(net.getAddress().getOctets(), data.octetsAddress);
            });
        });
        it("should match netmask address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getNetmask().getIpString(), data.stringNetmask);
                assert.deepEqual(net.getNetmask().getOctets(), data.octetsNetmask);
            });
        });
        it("should match prefix", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getPrefix(), data.prefix);
            });
        });
        it("should match wildcard address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getWildcard().getIpString(), data.stringWildcard);
                assert.deepEqual(net.getWildcard().getOctets(), data.octetsWildcard);
            });
        });
        it("should match broadcast address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getBroadcast().getIpString(), data.stringBroadcast);
                assert.deepEqual(net.getBroadcast().getOctets(), data.octetsBroadcast);
            });
        });
        it("should match number of addresses", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getNumAddresses(), data.numAddresses);
            });
        });
        it("hosts should start with the first address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(
                    net.hosts().next().value.getIpString(),
                    new Address4(data.octetsAddress).add([1]).getIpString(),
                );
            });
        });
        it("hosts should end with the last address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(net.hosts(new Address4(data.octetsBroadcast).substract([1])).next().done);
            });
        });
        it("should contains the first address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(net.contains(new Address4(data.octetsAddress).add([1])));
            });
        });
        it("should contains the last address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(net.contains(new Address4(data.octetsBroadcast).substract([1])));
            });
        });
        it("should NOT contains before the first address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(!net.contains(new Address4(data.octetsAddress).substract([1])));
            });
        });
        it("should NOT contains after the last address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(!net.contains(new Address4(data.octetsBroadcast).add([1])));
            });
        });
    });

}


describe("Network4", function() {
    describe("constructor with prefix netmask", function() {
        it("should accept valid values", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(data.inputPrefix);
            });
        });
    });
    describe("constructor with address netmask", function() {
        it("should accept valid values", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(data.inputAddress);
            });
        });
    });
    describeTestNetwork("from prefix", (data: NetworkInfo) => data.inputPrefix);
    describeTestNetwork("from address", (data: NetworkInfo) => data.inputAddress);
});
