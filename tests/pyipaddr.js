const assert = require('assert');
const ipaddr = require('../src/pyipaddr');
const IPv4 = ipaddr.IPv4Address;

const IPV4_VALID = {
    '127.0.0.1': 2130706433,
    '192.168.0.1': 3232235521,
    '0.0.0.0': 0,
    '255.255.255.255': ipaddr.IPV4_MAX_VALUE,
};

describe("IPv4Address", function () {
    describe("constructor from string", function () {
        it('should accept valid strings values', function () {
            for (let ipString in IPV4_VALID) {
                let ip = new IPv4(ipString);
                assert.equal(ip.ip_number, IPV4_VALID[ipString]);
                assert.equal(ip.ip_string, ipString);
            }
        });
        it('should reject invalid string values', function () {
            assert.throws(() => new IPv4('256.0.0.0'), ipaddr.AddressValueError);
            assert.throws(() => new IPv4('192.0.-1.0'), ipaddr.addressValueError);
            assert.throws(() => new IPv4('192.168.0'), ipaddr.AddressValueError);
            assert.throws(() => new IPv4('192.168.0.1.0'), ipaddr.AddressValueError);
            assert.throws(() => new IPv4('192.a.0.1'), ipaddr.AddressValueError);
        });
    });
    describe("constructor from number", function () {
        it('should accept valid number values', function () {
            for (let ipString in IPV4_VALID) {
                let ip = new IPv4(ipString);
                assert.equal(ip.ip_string, ipString);
                assert.equal(ip.ip_number, IPV4_VALID[ipString]);
            }
        });
        it('should reject invalid number values', function () {
            assert.throws(() => new IPv4(-1), ipaddr.AddressValueError);
            assert.throws(() => new IPv4(ipaddr.IPV4_MAX_VALUE + 1), ipaddr.AddressValueError);
        });
    });
    describe("arithmetic", function () {
        it('should add', function () {
            assert(new IPv4('127.0.0.1').add(2).eq(new IPv4('127.0.0.3')));
            assert(!new IPv4('127.0.0.1').add(1).eq(new IPv4('127.0.0.3')));
        });
        it('should substract', function () {
            assert(new IPv4('127.0.0.1').substract(2).eq(new IPv4('126.255.255.255')));
            assert(!new IPv4('127.0.0.1').substract(1).eq(new IPv4('126.255.255.255')));
        });
    });
    describe("comparisons", function () {
        it('should compare equal', function () {
            assert(new IPv4('127.0.0.1').eq(new IPv4('127.0.0.1')));
            assert(!new IPv4('127.0.0.1').eq(new IPv4('192.168.0.1')));
        });
        it('should compare not equal', function () {
            assert(new IPv4('127.0.0.1').ne(new IPv4('192.168.0.1')));
            assert(!new IPv4('127.0.0.1').ne(new IPv4('127.0.0.1')));
        });
        it('should compare greater than', function () {
            assert(new IPv4('127.0.0.1').gt(new IPv4('127.0.0.0')));
            assert(!new IPv4('127.0.0.1').gt(new IPv4('127.0.0.1')));
            assert(!new IPv4('127.0.0.1').gt(new IPv4('127.0.0.2')));
        });
        it('should compare lesser than', function () {
            assert(new IPv4('127.0.0.1').lt(new IPv4('127.0.0.2')));
            assert(!new IPv4('127.0.0.1').lt(new IPv4('127.0.0.1')));
            assert(!new IPv4('127.0.0.1').lt(new IPv4('127.0.0.0')));
        });
        it('should compare greater or equal than', function () {
            assert(new IPv4('127.0.0.1').ge(new IPv4('127.0.0.0')));
            assert(new IPv4('127.0.0.1').ge(new IPv4('127.0.0.1')));
            assert(!new IPv4('127.0.0.1').ge(new IPv4('127.0.0.2')));
        });
        it('should compare lesser or equal than', function () {
            assert(new IPv4('127.0.0.1').le(new IPv4('127.0.0.2')));
            assert(new IPv4('127.0.0.1').le(new IPv4('127.0.0.1')));
            assert(!new IPv4('127.0.0.1').le(new IPv4('127.0.0.0')));
        });
    });
});
