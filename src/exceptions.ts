export class AddressValueError extends Error {
    public constructor(address: string | ReadonlyArray<number>) {
        super("Invalid address: " + address);
        // Needed for Typescript 2.1 and following
        // See https://github.com/Microsoft/TypeScript-wiki/blob/77a2a18a6e7bf8599bbe693243b1b9eb3044bfda/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, AddressValueError.prototype);
    }
}