export interface PactMatchersInlineNestedType {
    objectInline: {
        /** @pact-matcher hex */
        matcher?: string;
        nestedObject?: {
            /** @pact-matcher hex */
            innerMatcher?: string;
        };
        nestedArray?: Array<{
            /** @pact-matcher hex */
            innerMatcher?: string;
        }>;
    };
    arrayInline: Array<{
        /** @pact-matcher hex */
        matcher?: string;
        nestedObject?: {
            /** @pact-matcher hex */
            innerMatcher?: string;
        };
        nestedArray?: Array<{
            /** @pact-matcher hex */
            innerMatcher?: string;
        }>;
    }>;
}

/**
 * @pact
 * @pact-method GET
 * @pact-path /api
 */
export function apiFunctionNestedInline(): PactMatchersInlineNestedType {
    return {
        objectInline: {},
        arrayInline: [],
    };
}

interface PactMatchersType {
    /** @pact-matcher email */
    emailField?: string;
}

export interface PactMatchersNestedType {
    objectNested: {
        nestedObject?: PactMatchersType;
        nestedArray?: PactMatchersType[];
    };
    arrayNested: Array<{
        nestedObject?: PactMatchersType;
        nestedArray?: PactMatchersType[];
    }>;
    object: PactMatchersType;
    array: PactMatchersType[];
}

/**
 * @pact
 * @pact-method GET
 * @pact-path /api
 */
export function apiFunctionNested(): PactMatchersNestedType {
    return {
        object: {},
        array: [],
        objectNested: {},
        arrayNested: [],
    };
}
