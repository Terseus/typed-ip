import { assert } from "chai";

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

interface ArithmeticInfo {
    octets: number[];
    quantity: number[];
    result: number[];
}

interface ComparisonInfo {
    left: number[];
    right: number[];
}

/* tslint:disable:object-literal-sort-keys */
const IPV4_VALID: AddressInfo[] = [
    { address: "0.0.0.0", octets: [0, 0, 0, 0], decimal: 0 },
    { address: "127.0.0.1", octets: [127, 0, 0, 1], decimal: 2130706433 },
    { address: "192.168.0.1", octets: [192, 168, 0, 1], decimal: 3232235521 },
    { address: "255.255.255.0", octets: [255, 255, 255, 0], decimal: 4294967040 },
    { address: "255.255.255.255", octets: [255, 255, 255, 255], decimal: 4294967295 },
];

const INVALID_STRINGS = [
    "256.0.0.0",
    "192.0.-1.0",
    "192.168.0",
    "192.168.0.1.0",
    "192.a.0.1",
];

const INVALID_OCTETS = [
    [-1],
    [256, 0, 0, 0],
];

const ADD_VALID: ArithmeticInfo[] = [
    { octets: [127, 0, 0, 1], quantity: [1], result: [127, 0, 0, 2] },
    { octets: [127, 0, 10, 255], quantity: [1], result: [127, 0, 11, 0] },
    { octets: [127, 10, 255, 255], quantity: [2], result: [127, 11, 0, 1] },
    { octets: [0, 255, 255, 254], quantity: [3], result: [1, 0, 0, 1] },
    { octets: [0, 255, 255, 255], quantity: [1, 255], result: [1, 0, 1, 254] },
];

const SUBSTRACT_VALID: ArithmeticInfo[] = [
    { octets: [127, 0, 0, 1], quantity: [1], result: [127, 0, 0, 0] },
    { octets: [127, 0, 0, 1], quantity: [2], result: [126, 255, 255, 255] },
];

const EQUAL_VALID: ComparisonInfo[] = [
    { left: [127, 0, 0, 1], right: [127, 0, 0, 1] },
    { left: [192, 168, 0, 1], right: [192, 168, 0, 1] },
];

const NOT_EQUAL_VALID: ComparisonInfo[] = [
    { left: [127, 0, 0, 1], right: [127, 0, 0, 0] },
    { left: [127, 0, 0, 0], right: [126, 0, 0, 0] },
];

const GREATER_THAN_VALID: ComparisonInfo[] = [
    { left: [127, 0, 0, 1], right: [127, 0, 0, 0] },
    { left: [127, 0, 0, 0], right: [126, 255, 255, 255] },
];

const LESSER_THAN_VALID: ComparisonInfo[] = [
    { left: [127, 0, 0, 1], right: [127, 0, 0, 2] },
    { left: [126, 0, 255, 255], right: [126, 255, 0, 0] },
];


function describeTestAddress(describeSuffix: string, addressConstructor: (data: AddressInfo) => Address4) {
    describe(`public interface ${describeSuffix}`, function() {
        it("should have the correct type", function() {
            assert.instanceOf(addressConstructor(IPV4_VALID[0]), Address);
        });
        IPV4_VALID.forEach((input) => {
            it(`should match string address ${input.address}`, function() {
                assert.equal(addressConstructor(input).getIpString(), input.address);
            });
            it(`should match decimal address ${input.address}`, function() {
                assert.equal(addressConstructor(input).getDecimal(), input.decimal);
            });
            it(`should match octets ${input.address}`, function() {
                assert.deepEqual(addressConstructor(input).getOctets(), input.octets);
            });
        });
    });
}


describe("Address4", function() {
    describe("constructor from string", function() {
        IPV4_VALID.forEach((input) => {
            it(`should accept valid string value ${input.address}`, function() {
                assert.ok(new Address4(input.address));
            });
        });
        INVALID_STRINGS.forEach((input) => {
            it(`should reject invalid string value ${input}`, function() {
                assert.throws(() => new Address4(input), AddressValueError);
            });
        });
    });
    describe("constructor from octets", function() {
        IPV4_VALID.forEach((input) => {
            it(`should accept valid octets value ${input.octets}`, function() {
                assert.ok(new Address4(input.octets));
            });
        });
        INVALID_OCTETS.forEach((input) => {
            it(`should reject invalid octets value ${input}`, function() {
                assert.throws(() => new Address4(input), AddressValueError);
            });
        });
    });
    describe("arithmetic", function() {
        ADD_VALID.forEach((input) => {
            it(`should add ${input.quantity} to ${input.octets}`, function() {
                assert.deepEqual(
                    new Address4(input.octets).add(input.quantity).getOctets(),
                    input.result,
                );
            });
        });
        SUBSTRACT_VALID.forEach((input) => {
            it(`should substract ${input.quantity} to ${input.octets}`, function() {
                assert.deepEqual(
                    new Address4(input.octets).substract(input.quantity).getOctets(),
                    input.result,
                );
            });
        });
    });
    describe("comparisons", function() {
        NOT_EQUAL_VALID.forEach((input) => {
            it(`should not compare equal ${input.left} and ${input.right}`, function() {
                    assert.isFalse(new Address4(input.left).eq(new Address4(input.right)));
            });
            it(`should compare not equal ${input.left} and ${input.right}`, function() {
                    assert.isTrue(new Address4(input.left).ne(new Address4(input.right)));
            });
        });
        EQUAL_VALID.forEach((input) => {
            it(`should compare equal ${input.left} and ${input.right}`, function() {
                    assert.isTrue(new Address4(input.left).eq(new Address4(input.right)));
            });
            it(`should not compare not equal ${input.left} and ${input.right}`, function() {
                    assert.isFalse(new Address4(input.left).ne(new Address4(input.right)));
            });
            it(`should not compare greater ${input.left} than ${input.right}`, function() {
                assert.isFalse(new Address4(input.left).gt(new Address4(input.right)));
            });
            it(`should compare greater or equal ${input.left} than ${input.right}`, function() {
                assert.isTrue(new Address4(input.left).ge(new Address4(input.right)));
            });
            it(`should not compare lesser ${input.left} than ${input.right}`, function() {
                assert.isFalse(new Address4(input.left).lt(new Address4(input.right)));
            });
            it(`should compare lesser or equal ${input.left} than ${input.right}`, function() {
                assert.isTrue(new Address4(input.left).le(new Address4(input.right)));
            });
        });
        GREATER_THAN_VALID.forEach((input) => {
            it(`should not compare equal ${input.left} and ${input.right}`, function() {
                    assert.isFalse(new Address4(input.left).eq(new Address4(input.right)));
            });
            it(`should compare not equal ${input.left} and ${input.right}`, function() {
                    assert.isTrue(new Address4(input.left).ne(new Address4(input.right)));
            });
            it(`should compare greater ${input.left} than ${input.right}`, function() {
                assert.isTrue(new Address4(input.left).gt(new Address4(input.right)));
            });
            it(`should compare greater or equal ${input.left} than ${input.right}`, function() {
                assert.isTrue(new Address4(input.left).ge(new Address4(input.right)));
            });
            it(`should not compare lesser ${input.left} than ${input.right}`, function() {
                assert.isFalse(new Address4(input.left).lt(new Address4(input.right)));
            });
            it(`should not compare lesser or equal ${input.left} than ${input.right}`, function() {
                assert.isFalse(new Address4(input.left).le(new Address4(input.right)));
            });
        });
        LESSER_THAN_VALID.forEach((input) => {
            it(`should not compare equal ${input.left} and ${input.right}`, function() {
                    assert.isFalse(new Address4(input.left).eq(new Address4(input.right)));
            });
            it(`should compare not equal ${input.left} and ${input.right}`, function() {
                    assert.isTrue(new Address4(input.left).ne(new Address4(input.right)));
            });
            it(`should not compare greater ${input.left} than ${input.right}`, function() {
                assert.isFalse(new Address4(input.left).gt(new Address4(input.right)));
            });
            it(`should not compare greater or equal ${input.left} than ${input.right}`, function() {
                assert.isFalse(new Address4(input.left).ge(new Address4(input.right)));
            });
            it(`should compare lesser ${input.left} than ${input.right}`, function() {
                assert.isTrue(new Address4(input.left).lt(new Address4(input.right)));
            });
            it(`should compare lesser or equal ${input.left} than ${input.right}`, function() {
                assert.isTrue(new Address4(input.left).le(new Address4(input.right)));
            });
        });
    });
    describeTestAddress("from string", (data: AddressInfo) => new Address4(data.address));
    describeTestAddress("from octets", (data: AddressInfo) => new Address4(data.octets));
});
