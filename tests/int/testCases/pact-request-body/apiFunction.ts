/**
 * @pact
 * @pact-method POST
 * @pact-path /api/first
 */
export function firstApiFunction(/** @pact-request-body */ body: BodyType) {}

/**
 * @pact
 * @pact-method POST
 * @pact-path /api/second
 */
export function secondApiFunction() {
    /** @pact-request-body */
    const body: BodyType = {numberField: 1000, stringField: 'bodyText'};
}

interface BodyType {
    stringField: string;
    numberField: number;
}
