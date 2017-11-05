import * as assert from "assert";
import {
    AddressValueError,
} from "../src";


const TEST_ADDRESS = "127.0.0.1";


describe("AddressValueError", function() {
    it("should be subclass of Error", function() {
        try {
            throw new AddressValueError(TEST_ADDRESS);
        } catch (exception) {
            assert(exception instanceof Error);
        }
    });
    it("should have stack trace", function() {
        try {
            throw new AddressValueError(TEST_ADDRESS);
        } catch (exception) {
            assert("stack" in exception);
        }
    });
});
