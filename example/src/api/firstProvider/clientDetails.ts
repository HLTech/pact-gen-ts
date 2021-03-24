import {firstProviderAxios} from "../axios";

const axios = firstProviderAxios;
const endpoint = (clientId: string) => `/clients/${clientId}`;

export const clientDetailsApi = {

    getClientDetails: async function (clientId: string) {
        const url = endpoint(clientId);
        const {data} = await axios.get<ApplicationDetailsDto>(url);
        return data;
    }

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
    EIGHT
}

type StringAlias = string;

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
    numberEnum:NumberEnum;
    someOtherObject: {
        someInnerObject: {
            someNextEnum: SomeEnum;
        }
    };
    someUnionType: 'AAA' | 'BBB' | 100;
    stringAliasType: StringAlias;
    datetimeString: string;
    datetimeWithMillisString: string;
    dateString: string;
    emailString: string;
}