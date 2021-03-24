import Axios from 'axios';

export const firstProviderAxios = Axios.create({
    baseURL: 'first-provider/api/v1'
});

export const secondProviderAxios = Axios.create({
    baseURL: 'second-provider/api/v1'
});
