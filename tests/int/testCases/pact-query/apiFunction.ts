/**
 * @pact
 * @pact-method GET
 * @pact-path /api/first
 */
export function firstApiFunction(/** @pact-query */ query: QueryType) {}

/**
 * @pact
 * @pact-method GET
 * @pact-path /api/second
 */
export function secondApiFunction() {
    /** @pact-query */
    const query: QueryType = {} as QueryType;
}

enum SomeEnum {
    FIRST = 'FIRST',
    SECOND = 'SECOND',
    THIRD = 'THIRD',
    OTHER = 'OTHER',
}

interface QueryType {
    stringField: string;
    numberField: number;
    booleanField: boolean;
    someObject: {
        booleanField: boolean;
        numberField: number;
    };
    someUnionType: 'AAA' | 'BBB' | 100;
    enumType: SomeEnum;
    stringArray: string[];
    /** @pact-matcher iso-date */
    isoDateField: string;
    /** @pact-matcher iso-datetime-with-millis */
    isoDatetimeWithMillisField?: string;
}
