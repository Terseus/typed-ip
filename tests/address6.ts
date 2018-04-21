import { assert } from "chai";

import {
    Address,
    Address6,
    AddressValueError,
} from "../src";

interface AddressInfo {
    address: string;
    octets: number[];
    addressFull: string;
    addressRfc5952: string;
}


/* tslint:disable:object-literal-sort-keys */
const IPV6_VALID: AddressInfo[] = [
    {
        address: "::127.0.0.1",
        octets: [0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 127, 0, 0, 1],
        addressFull: "0000:0000:0000:0000:0000:0000:7f00:0001",
        addressRfc5952: "::7f00:1",
    },
    {
        address: "::7f00:1",
        octets: [0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 127, 0, 0, 1],
        addressFull: "0000:0000:0000:0000:0000:0000:7f00:0001",
        addressRfc5952: "::7f00:1",
    },
    {
        address: "2001:db8:0:0:1:0:0:1",
        octets: [32, 1, 13, 184, 0, 0, 0, 0,
                 0, 1, 0, 0, 0, 0, 0, 1],
        addressFull: "2001:0db8:0000:0000:0001:0000:0000:0001",
        addressRfc5952: "2001:db8::1:0:0:1",
    },
    {
        address: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
        octets: [255, 255, 255, 255, 255, 255, 255, 255,
                 255, 255, 255, 255, 255, 255, 255, 255],
        addressFull: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
        addressRfc5952: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
    },
    {
        address: "1:0:ffff:ffff:ffff:ffff:ffff:ffff",
        octets: [0, 1, 0, 0, 255, 255, 255, 255,
                 255, 255, 255, 255, 255, 255, 255, 255],
        addressFull: "0001:0000:ffff:ffff:ffff:ffff:ffff:ffff",
        addressRfc5952: "1:0:ffff:ffff:ffff:ffff:ffff:ffff",
    },
    {
        address: "::ffff:ffff:ffff:ffff:ffff:ffff",
        octets: [0, 0, 0, 0, 255, 255, 255, 255,
                 255, 255, 255, 255, 255, 255, 255, 255],
        addressFull: "0000:0000:ffff:ffff:ffff:ffff:ffff:ffff",
        addressRfc5952: "::ffff:ffff:ffff:ffff:ffff:ffff",
    },
    {
        address: "ffff:ffff:ffff:ffff:ffff:ffff::",
        octets: [255, 255, 255, 255, 255, 255, 255, 255,
                 255, 255, 255, 255, 0, 0, 0, 0],
        addressFull: "ffff:ffff:ffff:ffff:ffff:ffff:0000:0000",
        addressRfc5952: "ffff:ffff:ffff:ffff:ffff:ffff::",
    },
];


function describeTestAddress(describeSuffix: string, addressConstructor: (data: AddressInfo) => Address6) {
    describe(`public interface ${describeSuffix}`, function() {
        it("should have the correct type", function() {
            assert.instanceOf(addressConstructor(IPV6_VALID[0]), Address);
        });
        IPV6_VALID.forEach((input) => {
            it(`${input.address} should match octets ${input.octets}`, function() {
                assert.deepEqual(addressConstructor(input).getOctets(), input.octets);
            });
            it(`${input.address} should match full string address ${input.addressFull}`, function() {
                assert.deepEqual(addressConstructor(input).getFullString(), input.addressFull);
            });
            it(`${input.address} should match RFC 5952 string address ${input.addressRfc5952}`, function() {
                assert.deepEqual(addressConstructor(input).getRfc5952(), input.addressRfc5952);
            });
        });
    });
}


describe("Address6", function() {
    describeTestAddress("from string", (data: AddressInfo) => new Address6(data.address));
    describeTestAddress("from octets", (data: AddressInfo) => new Address6(data.octets));
    describeTestAddress("from full address", (data: AddressInfo) => new Address6(data.addressFull));
    describeTestAddress("from RFC 5952 address", (data: AddressInfo) => new Address6(data.addressRfc5952));
});
