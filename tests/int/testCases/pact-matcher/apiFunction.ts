/**
 * @pact
 * @pact-method GET
 * @pact-path /api
 */
export function apiFunction(): PactMatchersType {
    return {};
}

export interface PactMatchersType {
    /** @pact-matcher email */
    emailField?: string;
    /** @pact-matcher iso-date */
    isoDateField?: string;
    /** @pact-matcher iso-datetime */
    isoDatetimeField?: string;
    /** @pact-matcher iso-datetime-with-millis */
    isoDatetimeWithMillisField?: string;
    /** @pact-matcher iso-time */
    isoTimeField?: string;
    /** @pact-matcher timestamp */
    timestampField?: string;
    /** @pact-matcher uuid */
    uuidField?: string;
    /** @pact-matcher ipv4 */
    ipv4Field?: string;
    /** @pact-matcher ipv6 */
    ipv6Field?: string;
    /** @pact-matcher hex */
    hexField?: string;
    /**
     * @pact-matcher email
     * @pact-example "user@google.pl"
     */
    matcherWithExample1?: string;
    /** @pact-matcher hex */
    /** @pact-example "FFFFFF" */
    matcherWithExample2?: string;
}
