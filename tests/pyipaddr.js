const assert = require('assert');
const ipaddr = require('../src/pyipaddr');
const IPv4 = ipaddr.IPv4Address;
const Netv4 = ipaddr.IPv4Network;


const IPV4_VALID = {
    '127.0.0.1': 2130706433,
    '192.168.0.1': 3232235521,
    '0.0.0.0': 0,
    '255.255.255.255': ipaddr.IPV4_MAX_VALUE,
};

const IPV4_NETWORKS_VALID = (function () {
    return [{
        stringAddress: '192.168.0.0',
        numberAddress: 3232235520,
        prefix: 24,
        stringNetmask: '255.255.255.0',
        numberNetmask: 4294967040,
    }, {
        stringAddress: '10.0.0.0',
        numberAddress: 167772160,
        prefix: 8,
        stringNetmask: '255.0.0.0',
        numberNetmask: 4278190080,
    }, {
        stringAddress: '148.56.0.0',
        numberAddress: 2486697984,
        prefix: 20,
        stringNetmask: '255.255.240.0',
        numberNetmask: 4294963200,
    }].map((network) => {
        network.inputPrefix = `${network.stringAddress}/${network.prefix}`;
        network.inputAddress = `${network.stringAddress}/${network.stringNetmask}`;
        return network;
    });
}());


function compareArray(array1, array2) {
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


function assertArrayEquals(original, expected, message) {
    if (!compareArray(original, expected)) {
        throw new Error(message || JSON.stringify(original) + " - " + JSON.stringify(expected));
    }
}


function assertNetworkCheck(net, data) {
    assert.equal(net.address.ipNumber, data.numberAddress);
    assert.equal(net.address.ipString, data.stringAddress);
    assert.equal(net.netmask.ipNumber, data.numberNetmask);
    assert.equal(net.netmask.ipString, data.stringNetmask);
    assert.equal(net.prefix, data.prefix);
}


describe("IPv4Address", function () {
    describe("constructor from string", function () {
        it('should accept valid strings values', function () {
            for (let ipString in IPV4_VALID) {
                let ip = new IPv4(ipString);
                assert.equal(ip.ipNumber, IPV4_VALID[ipString]);
                assert.equal(ip.ipString, ipString);
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
                assert.equal(ip.ipString, ipString);
                assert.equal(ip.ipNumber, IPV4_VALID[ipString]);
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
    describe("octets", function () {
        it('should return correct octets', function () {
            assertArrayEquals(new IPv4('127.0.0.1').octets, [127, 0, 0, 1]);
            assertArrayEquals(new IPv4('255.255.255.255').octets, [255, 255, 255, 255]);
        })
    })
});


describe('IPv4Network', function () {
    describe('constructor with prefix netmask', function () {
        it('should accept valid values', function () {
            IPV4_NETWORKS_VALID.forEach(
                (data) => assertNetworkCheck(new Netv4(data.inputPrefix), data),
            );
        });
    });
    describe('constructor with address netmask', function () {
        it('should accept valid values', function () {
            IPV4_NETWORKS_VALID.forEach(
                (data) => assertNetworkCheck(new Netv4(data.inputAddress), data),
            );
        });
    });
});
