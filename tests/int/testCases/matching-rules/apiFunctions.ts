import {PactMatchersType} from '../pact-matcher/apiFunction';

/**
 * @pact
 * @pact-method GET
 * @pact-path /api/one
 */
export function apiWithStringEnumResponseFunction() {
    return 'ONE' as SomeEnum;
}

/**
 * @pact
 * @pact-method GET
 * @pact-path /api/two
 */
export function apiWithAllMatchingRules() {
    return {} as MatchingRulesType;
}

enum SomeEnum {
    ONE = 'ONE',
    TWO = 'TWO',
    THREE = 'THREE',
}

interface MatchingRulesType extends PactMatchersType {
    literalOptions: 'AAA' | 'BBB' | 'CCC';
    enumField: SomeEnum;
    nestedObject: {
        enumField: SomeEnum;
        arrayOfEnums: SomeEnum[];
    };
    arrayOfEnums: SomeEnum[];
}
