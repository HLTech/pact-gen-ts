import {firstProviderAxios} from '../axios';

const axios = firstProviderAxios;
const endpoint = (clientId: string) => `/clients/${clientId}`;

export const clientDetailsApi = {
    /**
     * @pact
     * @pact-method GET
     * @pact-path /api/clients/10
     */
    getClientDetails: async function (clientId: string) {
        const url = endpoint(clientId);
        const {data} = await axios.get<ApplicationDetailsDto>(url);
        return data;
    },
};

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

interface ApplicationDetailsDto {
    booleanField: boolean;
    stringField: string;
    numberField: number;
    someObject: {
        booleanField: boolean;
        numberField: number;
    };
    intersectionField: SomeType & {fieldC: number};
    enumType: SomeType;
    numberEnum: NumberEnum;
    someOtherObject: {
        someInnerObject: {
            someNextEnum: SomeEnum;
        };
    };
    someUnionType: 'AAA' | 'BBB' | 100;
    stringAliasType: StringAlias;
    /** @pact-datetime */
    datetimeString: string;
    /** @pact-datetime-with-millis */
    datetimeWithMillisString: string;
    /** @pact-date */
    dateString: string;
    /** @pact-email */
    emailString: string;
    constString: 'CONST';
    /** @pact-example "99-400" */
    postCode: string;
    stringArray: string[];
    unionsArray: UnionType[];
    // tupleField: [number, string]; | not allowed type
    // anyType: any; | not allowed type
    unknownType: unknown;
}
