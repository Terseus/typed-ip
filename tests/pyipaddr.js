const assert = require('assert');
const ipaddr = require('../src/pyipaddr');

describe("IPv4Address", function () {
    describe("constructor from string", function () {
        it('should accept valid strings values', function () {
            assert.equal(new ipaddr.IPv4Address('192.168.0.1').ip_number, 3232235521);
            assert.equal(new ipaddr.IPv4Address('127.0.0.1').ip_number, 2130706433);
            assert.equal(new ipaddr.IPv4Address('0.0.0.0').ip_number, 0);
            assert.equal(new ipaddr.IPv4Address('255.255.255.255').ip_number, 4294967295);
        });
        it('should reject invalid string values', function () {
            assert.throws(() => new ipaddr.IPv4Address('256.0.0.0'), ipaddr.AddressValueError);
            assert.throws(() => new ipaddr.IPv4Address('192.0.-1.0'), ipaddr.addressValueError);
            assert.throws(() => new ipaddr.IPv4Address('192.168.0'), ipaddr.AddressValueError);
            assert.throws(() => new ipaddr.IPv4Address('192.168.0.1.0'), ipaddr.AddressValueError);
            assert.throws(() => new ipaddr.IPv4Address('192.a.0.1'), ipaddr.AddressValueError);
        });
    });
    describe("constructor from number", function () {
        it('should accept valid number values', function () {
            assert.equal(new ipaddr.IPv4Address(3232235521).ip_string, '192.168.0.1');
            assert.equal(new ipaddr.IPv4Address(2130706433).ip_string, '127.0.0.1');
            assert.equal(new ipaddr.IPv4Address(0).ip_string, '0.0.0.0');
            assert.equal(new ipaddr.IPv4Address(4294967295).ip_string, '255.255.255.255');
        });
        it('should reject invalid number values', function () {
            assert.throws(() => new ipaddr.IPv4Address(-1), ipaddr.AddressValueError);
            assert.throws(() => new ipaddr.IPv4Address(4294967296), ipaddr.AddressValueError);
        });
    });
});
