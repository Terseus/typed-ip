import { assert } from "chai";
import {
    Address4,
    Network,
    Network4,
} from "../src";


interface NetworkInfo {
    inputPrefix: string;
    inputAddress: string;
    address: number[];
    prefix: number;
    netmask: number[];
    wildcard: number[];
    broadcast: number[];
    numAddresses: number;
    firstAddress: number[];
    lastAddress: number[];
    beforeFirstAddress: number[];
    afterLastAddress: number[];
}

/* tslint:disable:object-literal-sort-keys */
const IPV4_NETWORKS_VALID: NetworkInfo[] = [{
    inputAddress: "192.168.0.0/255.255.255.0",
    inputPrefix: "192.168.0.0/24",
    address: [192, 168, 0, 0],
    prefix: 24,
    netmask: [255, 255, 255, 0],
    wildcard: [0, 0, 0, 255],
    broadcast: [192, 168, 0, 255],
    numAddresses: 256,
    firstAddress: [192, 168, 0, 1],
    lastAddress: [192, 168, 0, 254],
    beforeFirstAddress: [192, 167, 255, 255],
    afterLastAddress: [192, 168, 1, 0],
}, {
    inputAddress: "10.0.0.0/255.0.0.0",
    inputPrefix: "10.0.0.0/8",
    address: [10, 0, 0, 0],
    prefix: 8,
    netmask: [255, 0, 0, 0],
    wildcard: [0, 255, 255, 255],
    broadcast: [10, 255, 255, 255],
    numAddresses: 16777216,
    firstAddress: [10, 0, 0, 1],
    lastAddress: [10, 255, 255, 254],
    beforeFirstAddress: [9, 255, 255, 255],
    afterLastAddress: [11, 0, 0, 0],
}, {
    inputAddress: "148.56.0.0/255.255.240.0",
    inputPrefix: "148.56.0.0/20",
    address: [148, 56, 0, 0],
    prefix: 20,
    netmask: [255, 255, 240, 0],
    wildcard: [0, 0, 15, 255],
    broadcast: [148, 56, 15, 255],
    numAddresses: 4096,
    firstAddress: [148, 56, 0, 1],
    lastAddress: [148, 56, 15, 254],
    beforeFirstAddress: [148, 55, 0, 0],
    afterLastAddress: [148, 56, 16, 0],
}, {
    inputAddress: "192.168.0.40/255.255.248.0",
    inputPrefix: "192.168.0.40/21",
    address: [192, 168, 0, 0],
    prefix: 21,
    netmask: [255, 255, 248, 0],
    wildcard: [0, 0, 7, 255],
    broadcast: [192, 168, 7, 255],
    numAddresses: 2048,
    firstAddress: [192, 168, 0, 1],
    lastAddress: [192, 168, 7, 254],
    beforeFirstAddress: [192, 167, 255, 255],
    afterLastAddress: [192, 168, 8, 0],
}];


function describeTestNetwork(describeSuffix: string, inputAccessor: (data: NetworkInfo) => string) {
    describe(`public interface ${describeSuffix}`, function() {
        it("should have the Network type", function() {
            assert.instanceOf(new Network4(inputAccessor(IPV4_NETWORKS_VALID[0])), Network);
        });
        it("address should have the Address4 type", function() {
            assert.instanceOf(new Network4(inputAccessor(IPV4_NETWORKS_VALID[0])).getAddress(), Address4);
        });
        it("netmask should have the Address4 type", function() {
            assert.instanceOf(new Network4(inputAccessor(IPV4_NETWORKS_VALID[0])).getNetmask(), Address4);
        });
        it("wildcard should have the Address4 type", function() {
            assert.instanceOf(new Network4(inputAccessor(IPV4_NETWORKS_VALID[0])).getWildcard(), Address4);
        });
        it("broadcast should have the Address4 type", function() {
            assert.instanceOf(new Network4(inputAccessor(IPV4_NETWORKS_VALID[0])).getBroadcast(), Address4);
        });
        IPV4_NETWORKS_VALID.forEach((input) => {
            const inputString = inputAccessor(input);
            it(`${inputString} should match network address ${input.address}`, function() {
                assert.deepEqual(new Network4(inputString).getAddress().getOctets(), input.address);
            });
            it(`${inputString} should match netmask address ${input.netmask}`, function() {
                assert.deepEqual(new Network4(inputString).getNetmask().getOctets(), input.netmask);
            });
            it(`${inputString} should match wildcard address ${input.wildcard}`, function() {
                assert.deepEqual(new Network4(inputString).getWildcard().getOctets(), input.wildcard);
            });
            it(`${inputString} should match broadcast address ${input.broadcast}`, function() {
                assert.deepEqual(new Network4(inputString).getBroadcast().getOctets(), input.broadcast);
            });
            it(`${inputString} should match prefix ${input.prefix}`, function() {
                assert.equal(new Network4(inputString).getPrefix(), input.prefix);
            });
            it(`${inputString} should match number of addresses ${input.numAddresses}`, function() {
                assert.equal(new Network4(inputString).getNumAddresses(), input.numAddresses);
            });
            it(`${inputString} should start with the first address ${input.firstAddress}`, function() {
                assert.deepEqual(new Network4(inputString).hosts().next().value.getOctets(), input.firstAddress);
            });
            it(`${inputString} should end with the last address ${input.lastAddress}`, function() {
                assert.isTrue(new Network4(inputString).hosts(new Address4(input.lastAddress)).next().done);
            });
            it(`${inputString} should contains the first address ${input.firstAddress}`, function() {
                assert.isTrue(new Network4(inputString).contains(new Address4(input.firstAddress)));
            });
            it(`${inputString} should contains the last address ${input.lastAddress}`, function() {
                assert.isTrue(new Network4(inputString).contains(new Address4(input.lastAddress)));
            });
            it(`${inputString} should not contains before the first address ${input.beforeFirstAddress}`, function() {
                assert.isFalse(new Network4(inputString).contains(new Address4(input.beforeFirstAddress)));
            });
            it(`${inputString} should not contains after the last address ${input.afterLastAddress}`, function() {
                assert.isFalse(new Network4(inputString).contains(new Address4(input.afterLastAddress)));
            });
        });
    });

}


describe("Network4", function() {
    describe("constructor", function() {
        IPV4_NETWORKS_VALID.forEach((input) => {
            it(`should accept valid prefix value ${input.inputPrefix}`, function() {
                assert.isOk(new Network4(input.inputPrefix));
            });
            it(`should accept valid netmask value ${input.inputAddress}`, function() {
                assert.isOk(new Network4(input.inputAddress));
            });
        });
    });
    describeTestNetwork("from prefix", (data: NetworkInfo) => data.inputPrefix);
    describeTestNetwork("from address", (data: NetworkInfo) => data.inputAddress);
});
