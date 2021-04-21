import {secondProviderAxios} from '../axios';

const axios = secondProviderAxios;

/**
 * @pact
 * @pact-path /api/ping/10
 * @pact-method PUT
 */
export function sendPing(userId: string) {
    axios.put('/ping/' + userId);
    return undefined;
}
