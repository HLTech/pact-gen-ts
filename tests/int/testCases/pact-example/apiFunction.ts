/**
 * @pact
 * @pact-method GET
 * @pact-path /api
 */
export function apiFunction(): SomeType {
    return {};
}

interface SomeType {
    /** @pact-example "example" */
    field1?: string;
    /** @pact-example example */
    field2?: string;
    /** @pact-example 99 */
    field3?: number;
    /** @pact-example 99-400 */
    field4?: string;
}
