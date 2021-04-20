/**
 * @pact
 * @pact-method GET
 * @pact-path /api
 */
export function apiFunction(): ResponseDto {
    return {} as ResponseDto;
}

interface SomeType {
    fieldA: string;
    fieldB: boolean;
}

enum SomeEnum {
    FIRST = 'FIRST',
    SECOND = 'SECOND',
    THIRD = 'THIRD',
    OTHER = 'OTHER',
}

enum NumberEnum {
    ZERO,
    ONE,
    TWO,
    THREE,
    SEVEN = 7,
    EIGHT,
}

type StringAlias = string;

type UnionType = 'OPTION_1' | 'OPTION_2' | 'OPTION_3';

interface ResponseDto {
    booleanField: boolean;
    stringField: string;
    numberField: number;
    someObject: {
        booleanField: boolean;
        numberField: number;
    };
    someType: SomeType;
    intersectionField: SomeType & {fieldC: number};
    enumType: SomeEnum;
    numberEnum: NumberEnum;
    someOtherObject: {
        someInnerObject: {
            someNextEnum: SomeEnum;
        };
    };
    someUnionType: 'AAA' | 'BBB' | 100;
    stringAliasType: StringAlias;
    constString: 'CONST';
    stringArray: string[];
    unionsArray: UnionType[];
    unknownType: unknown;
    unionWithDifferentTypes: string | number;
    arrayOfObjects: {someField: 'A' | 'B' | 'C'}[];
}
