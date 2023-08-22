import Axios from 'axios';

export const axiosInstance = Axios.create({
    /** This is an example where baseURL configuration option could be useful - same baseURL in custom axios instance
     * and in pacts.config.js which is then used as a prefix for all paths in interactions**/
    baseURL: 'api/v1',
});

/**
 * @pact
 * @pact-axios
 */
export const baseUrlConfigAxiosFunction = async () => {
    const {data} = await axiosInstance.get<string>('/clients');
    return data;
};

/**
 * @pact
 */
export function baseUrlApiFunction() {
    return 'string';
}
