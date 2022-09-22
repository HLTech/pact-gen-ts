import axios, {AxiosInstance} from 'axios';
import {axiosInstance} from './axios-instance';

export const applicationId = '1';
export const clientNo = '1';

/**
 * @pact
 * @pact-axios
 */
export const getPactAxiosArgumentPathFunction = async (clientNumber: number) => {
    const {data} = await axios.get<string>(`/clients/${clientNumber}`);
    return data;
};

/**
 * @pact
 * @pact-axios
 */
export async function getPactAxiosTemplateStringPathFunction() {
    await axios.delete<void>(`/api/client/${clientNo}/application/${applicationId}`);
}

/**
 * @pact
 * @pact-axios
 */
export async function getPactAxiosVariablePathFunction() {
    const endpointUrl = '/api/applications';
    await axios.delete<void>(endpointUrl);
}

/**
 * @pact
 * @pact-axios
 */
export async function getPactAxiosVariableConcatPathFunction() {
    const endpointUrl = '/api/' + 'applications';
    await axios.delete<void>(endpointUrl);
}

/**
 * @pact
 * @pact-axios
 */
export async function getPactAxiosVariableConcatPathWithVariableFunction(param: string) {
    const endpointUrl = '/api/' + param;
    await axios.delete<void>(endpointUrl);
}

/**
 * @pact
 * @pact-axios
 */
export async function getPactAxiosVariableTemplateStringPathFunction() {
    const endpointUrl = `/api/client/${clientNo}/application/${applicationId}`;
    await axios.delete<void>(endpointUrl);
}

/**
 * @pact
 * @pact-axios
 */
export async function getPactAxiosConcatedPathFunction() {
    await axios.delete<void>('/api/client/' + clientNo);
}

/**
 * @pact
 * @pact-axios
 */
export async function getPactAxiosApiFunction() {
    const {data} = await axios.get<string>('/api');
}

/**
 * @pact
 * @pact-axios
 */
export async function customAxiosInstancePactAxiosApiFunction() {
    const data = await axiosInstance.get<ResponseBody>('/api').then((response) => response.data);
}

interface ResponseBody {
    stringField: string;
    numberField: number;
}

/**
 * @pact
 * @pact-axios
 */
export async function postPactAxiosApiFunction(requestBody: RequestBody) {
    await axios.post<void>('/api', requestBody);
}

interface RequestBody {
    stringField: string;
    numberField: number;
}

/**
 * @pact
 * @pact-axios
 */
export async function putPactAxiosApiFunction(requestBody: RequestBody) {
    await axios.put<string>('/api', requestBody);
}

/**
 * @pact
 * @pact-axios
 */
export async function patchPactAxiosApiFunction(requestBody: RequestBody) {
    await axios.patch<void>('/api', requestBody);
}

/**
 * @pact
 * @pact-axios
 */
export async function deletePactAxiosApiFunction() {
    await axios.delete<void>('/api');
}

/**
 * @pact
 * @pact-axios
 */
export async function getPactAxiosWithQueryApiFunction(query: Query) {
    const {data} = await axios.get<string>('/api/query', {params: query});
}

/**
 * @pact
 * @pact-axios
 */
export async function getPactAxiosWithDataAndQueryApiFunction(query: Query) {
    const {data} = await axios.post<string>('/api/post', {postId: 'id'}, {params: query});
}

interface Query {
    page: number;
    limit: number;
}

/**
 * @pact
 * @pact-axios
 */
export async function getPactAxiosWithDataConfigApiFunction(data: DataToDelete) {
    await axios.delete<void>('/api', {data});
}

interface DataToDelete {
    id: string;
}

export class PostsApi {
    constructor(private axios: AxiosInstance) {}

    /**
     * @pact
     * @pact-axios
     */
    public async getPactAxiosClassMethod(): Promise<PostDto[]> {
        const response = await this.axios.get<PostDto[]>('/posts', {
            params: {
                select: 'id,name',
            },
        });
        return response.data;
    }
}

interface PostDto {
    id: string;
}
