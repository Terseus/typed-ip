import * as assert from "assert";
import {
    Address6,
    Network,
    Network6,
} from "../src";


interface NetworkInfo {
    input: string;
    prefix: number;
    stringAddress: string;
    octetsAddress: number[];
    stringNetmask: string;
    octetsNetmask: number[];
    stringWildcard: string;
    octetsWildcard: number[];
    stringBroadcast: string;
    octetsBroadcast: number[];
}


/* tslint:disable:object-literal-sort-keys */
const IPV6_NETWORKS_VALID: NetworkInfo[] = [{
    input: "0001:0:0:0:0:1:0:0/32",
    prefix: 32,
    stringAddress: "1::1:0:0",
    octetsAddress: [0, 1, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 1, 0, 0, 0, 0],
    stringNetmask: "ffff:ffff::",
    octetsNetmask: [255, 255, 255, 255, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0],
    stringWildcard: "::ffff:ffff:ffff:ffff:ffff:ffff",
    octetsWildcard: [0, 0, 0, 0, 255, 255, 255, 255,
                     255, 255, 255, 255, 255, 255, 255, 255],
    stringBroadcast: "1:0:ffff:ffff:ffff:ffff:ffff:ffff",
    octetsBroadcast: [0, 1, 0, 0, 255, 255, 255, 255,
                      255, 255, 255, 255, 255, 255, 255, 255],
}];


describe("Network6", function() {
    describe("constructor", function() {
        it("should accept valid values", function() {
            IPV6_NETWORKS_VALID.forEach((data) => {
                const net = new Network6(data.input);
            });
        });
    });
    it("should have the correct types", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert(net instanceof Network);
            assert(net.getAddress() instanceof Address6);
            assert(net.getNetmask() instanceof Address6);
            assert(net.getWildcard() instanceof Address6);
            assert(net.getBroadcast() instanceof Address6);
        });
    });
    it("should match network address", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert.equal(net.getAddress().getIpString(), data.stringAddress);
            assert.deepEqual(net.getAddress().getOctets(), data.octetsAddress);
        });
    });
    it("should match netmask address", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert.equal(net.getNetmask().getIpString(), data.stringNetmask);
            assert.deepEqual(net.getNetmask().getOctets(), data.octetsNetmask);
        });
    });
    it("should match prefix", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert.equal(net.getPrefix(), data.prefix);
        });
    });
    it("should match wildcard address", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert.equal(net.getWildcard().getIpString(), data.stringWildcard);
            assert.deepEqual(net.getWildcard().getOctets(), data.octetsWildcard);
        });
    });
    it("should match broadcast address", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert.equal(net.getBroadcast().getIpString(), data.stringBroadcast);
            assert.deepEqual(net.getBroadcast().getOctets(), data.octetsBroadcast);
        });
    });
    /*
    it("should match number of addresses", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert.equal(net.getNumAddresses(), 0);
        });
    });
    */
    it("hosts should start with the first address", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert.equal(
                net.hosts().next().value.getIpString(),
                new Address6(data.octetsAddress).add([1]).getIpString(),
            );
        });
    });
    it("hosts should end with the last address", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert(net.hosts(new Address6(data.octetsBroadcast).substract([1])).next().done);
        });
    });
    it("should contains the first address", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert(net.contains(new Address6(data.octetsAddress).add([1])));
        });
    });
    it("should contains the last address", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert(net.contains(new Address6(data.octetsBroadcast).substract([1])));
        });
    });
    it("should NOT contains before the first address", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert(!net.contains(new Address6(data.octetsAddress).substract([1])));
        });
    });
    it("should NOT contains after the last address", function() {
        IPV6_NETWORKS_VALID.forEach((data) => {
            const net = new Network6(data.input);
            assert(!net.contains(new Address6(data.octetsBroadcast).add([1])));
        });
    });
});
