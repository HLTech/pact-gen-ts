import {secondProviderAxios} from '../axios';

const axios = secondProviderAxios;
const endpoint = (clientNumber: string) => `/clients/${clientNumber}/cash`;

export const CashApi = {
    /**
     * @pact
     * @pact-method GET
     * @pact-path /api/clients/10/cash
     */
    getCashForClient: async function (clientNumber: string) {
        const url = endpoint(clientNumber);
        const {data} = await axios.get<CashDto>(url);
        return data;
    },

    /**
     * @pact
     * @pact-method GET
     * @pact-path /api/clients/10/cash/report
     */
    getCashReport: async function (clientNumber: string) {
        const url = endpoint(clientNumber) + '/report';
        const {data} = await axios.get<string>(url);
        return data;
    },

    /**
     * @pact
     * @pact-description "get file of cash report for client"
     * @pact-method GET
     * @pact-path /api/clients/10/cash/report/file
     * @pact-response-header "Content-Type" "application/pdf"
     */
    downloadCashReport: async function (clientNumber: string) {
        const url = endpoint(clientNumber) + '/report/file';
        const {data} = await axios.get<Blob>(url);
        return data;
    },
};

interface CashDto {
    booleanField: boolean;
    stringField: string;
}
