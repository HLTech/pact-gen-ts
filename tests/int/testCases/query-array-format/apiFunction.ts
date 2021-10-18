/**
 * @pact
 * @pact-method GET
 * @pact-path /api/first
 */
export function firstApiFunction(/** @pact-query */ query: QueryType) {}

interface QueryType {
    stringArray: string[];
}
