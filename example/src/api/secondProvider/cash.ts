import {secondProviderAxios} from "../axios";

const axios = secondProviderAxios;
const endpoint = (clientNumber: string) => `/clients/${clientNumber}/cash`;

export const CashApi = {

    /**
     * @pact
     * @pact-description "get cash details for client"
     * @pact-method GET
     */
    getCashForClient: async function (clientNumber: string) {
        const url = endpoint(clientNumber);
        const {data} = await axios.get<CashDto>(url);
        return data;
    }

}

interface CashDto {
    booleanField: boolean;
    stringField: string;
}
