/**
 * @pact
 * @pact-method GET
 * @pact-path /api
 */
export function apiFunction() {
    /** @pact-response-body */
    const body: BodyType = {numberField: 1000, stringField: 'bodyText'};
}

interface BodyType {
    stringField: string;
    numberField: number;
}
