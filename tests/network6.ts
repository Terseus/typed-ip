import { assert } from "chai";
import {
    Address6,
    Network,
    Network6,
} from "../src";


interface NetworkInfo {
    input: string;
    prefix: number;
    address: number[];
    netmask: number[];
    wildcard: number[];
    broadcast: number[];
}


/* tslint:disable:object-literal-sort-keys */
const IPV6_NETWORKS_VALID: NetworkInfo[] = [{
    input: "0001:0:0:0:0:1:0:0/32",
    prefix: 32,
    address: [0, 1, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 1, 0, 0, 0, 0],
    netmask: [255, 255, 255, 255, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0],
    wildcard: [0, 0, 0, 0, 255, 255, 255, 255,
               255, 255, 255, 255, 255, 255, 255, 255],
    broadcast: [0, 1, 0, 0, 255, 255, 255, 255,
                255, 255, 255, 255, 255, 255, 255, 255],
}];


describe("Network6", function() {
    describe("constructor", function() {
        it("should accept valid values", function() {
            assert.isOk(new Network6(IPV6_NETWORKS_VALID[0].input));
        });
    });
    it("should have the Network type", function() {
        assert.instanceOf(new Network6(IPV6_NETWORKS_VALID[0].input), Network);
    });
    it("address should have the Address6 type", function() {
        assert.instanceOf(new Network6(IPV6_NETWORKS_VALID[0].input).getAddress(), Address6);
    });
    it("netmask should have the Address6 type", function() {
        assert.instanceOf(new Network6(IPV6_NETWORKS_VALID[0].input).getNetmask(), Address6);
    });
    it("wildcard should have the Address6 type", function() {
        assert.instanceOf(new Network6(IPV6_NETWORKS_VALID[0].input).getWildcard(), Address6);
    });
    it("broadcast should have the Address6 type", function() {
        assert.instanceOf(new Network6(IPV6_NETWORKS_VALID[0].input).getBroadcast(), Address6);
    });
    IPV6_NETWORKS_VALID.forEach((data) => {
        it(`${data.input} should match network address ${data.address}`, function() {
            assert.deepEqual(new Network6(data.input).getAddress().getOctets(), data.address);
        });
        it(`${data.input} should match netmask address ${data.netmask}`, function() {
            assert.deepEqual(new Network6(data.input).getNetmask().getOctets(), data.netmask);
        });
        it(`${data.input} should match wildcard address ${data.wildcard}`, function() {
            assert.deepEqual(new Network6(data.input).getWildcard().getOctets(), data.wildcard);
        });
        it(`${data.input} should match broadcast address ${data.broadcast}`, function() {
            assert.deepEqual(new Network6(data.input).getBroadcast().getOctets(), data.broadcast);
        });
        it(`${data.input} should match prefix ${data.prefix}`, function() {
            assert.equal(new Network6(data.input).getPrefix(), data.prefix);
        });
    });
});
