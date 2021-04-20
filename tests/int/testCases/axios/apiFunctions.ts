import axios from 'axios';

/**
 * @pact
 * @pact-method GET
 * @pact-path /api
 */
export async function getAxiosApiFunction() {
    const {data} = await axios.get<string>('/api');
    return data;
}

/**
 * @pact
 * @pact-method GET
 * @pact-path /api
 */
export async function secondGetAxiosApiFunction() {
    return await axios.get<string>('/api').then((response) => response.data);
}

/**
 * @pact
 * @pact-method POST
 * @pact-path /api
 */
export async function postAxiosApiFunction(requestBody: RequestBody) {
    const {data} = await axios.post<string>('/api', requestBody);
    return data;
}

interface RequestBody {
    stringField: string;
    numberField: number;
}

/**
 * @pact
 * @pact-method DELETE
 * @pact-path /api
 */
export async function deleteAxiosApiFunction() {
    return await axios.delete('/api');
}

/**
 * @pact
 * @pact-method GET
 * @pact-path /api/query
 */
export async function getAxiosWithQueryApiFunction(query: Query) {
    const {data} = await axios.get<string>('/api/query', {params: query});
    return data;
}

interface Query {
    page: number;
    limit: number;
}
