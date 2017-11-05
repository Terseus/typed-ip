import * as assert from "assert";
import {
    Address4,
    Network,
    Network4,
} from "../src";

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


function assertNetworkCheck(net: Network4, data: NetworkInfo) {
    assert(net instanceof Network);
    assert(net.getAddress() instanceof Address4);
    assert.equal(net.getAddress().getIpString(), data.stringAddress);
    assert.deepEqual(net.getAddress().getOctets(), data.octetsAddress);
    assert(net.getNetmask() instanceof Address4);
    assert.equal(net.getNetmask().getIpString(), data.stringNetmask);
    assert.deepEqual(net.getNetmask().getOctets(), data.octetsNetmask);
    assert.equal(net.getPrefix(), data.prefix);
    assert(net.getHostmask() instanceof Address4);
    assert.equal(net.getHostmask().getIpString(), data.stringHostmask);
    assert.deepEqual(net.getHostmask().getOctets(), data.octetsHostmask);
    assert(net.getBroadcast() instanceof Address4);
    assert.equal(net.getBroadcast().getIpString(), data.stringBroadcast);
    assert.deepEqual(net.getBroadcast().getOctets(), data.octetsBroadcast);
    assert.equal(net.getNumAddresses(), data.numAddresses);
    assert.equal(net.hosts().next().value.getIpString(), new Address4(data.octetsAddress).add([1]).getIpString());
    assert(
        net.hosts(new Address4(data.octetsBroadcast).substract([1])).next().done,
        "Last IP check failed: " + new Address4(data.octetsBroadcast).substract([1]).getIpString(),
    );
    assert(
        net.contains(new Address4(data.octetsAddress).add([1])),
        "First IP contains failed: " + new Address4(data.octetsAddress).add([1]).getIpString(),
    );
    assert(
        net.contains(new Address4(data.octetsBroadcast).substract([1])),
        "Last IP contains failed: " + new Address4(data.octetsBroadcast).substract([1]).getIpString(),
    );
    assert(
        !net.contains(new Address4(data.octetsAddress).substract([1])),
        "Before first IP contains failed: " + new Address4(data.octetsAddress).substract([1]).getIpString(),
    );
    assert(
        !net.contains(new Address4(data.octetsBroadcast).add([1])),
        "After last IP contains failed: " + new Address4(data.octetsBroadcast).add([1]).getIpString(),
    );
}


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
