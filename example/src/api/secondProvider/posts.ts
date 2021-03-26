import {secondProviderAxios} from "../axios";
import qs from "qs";

const axios = secondProviderAxios;
const endpoint = (clientNumber: string, postId: string = '') => `/client/${clientNumber}/posts/${postId}`;

export const postsApi = {

    /**
     * @pact
     * @pact-description "get user posts"
     * @pact-method GET
     */
    getPosts: async function (clientNumber: string, /** @pact-query */ query: QueryToGetPosts): Promise<PostDto[]> {
        const url = endpoint(clientNumber);
        const {data} = await axios.get<PostDto[]>(url + '?' + qs.stringify(query));
        return data;
    },

    /**
     * @pact
     * @pact-description "add new post"
     * @pact-method POST
     */
    addNewPost: async function (clientNumber: string, /** @pact-body */ newPost: NewPost) {
        const url = endpoint(clientNumber);
        return axios.post(url, newPost);
    },

    /**
     * @pact
     * @pact-method DELETE
     */
    deletePost: async function ({clientNumber, postId} : {clientNumber: string, postId: string}) {
        const url = endpoint(clientNumber, postId);
        return axios.delete(url);
    }

}

interface QueryToGetPosts {
    booleanField: boolean;
    /** @pact-date */
    fromDate: string;
}

interface PostDto {
    stringField: string;
}

interface NewPost {
    stringField: string;
}
