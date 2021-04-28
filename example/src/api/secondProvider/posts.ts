import {secondProviderAxios} from '../axios';
import qs from 'qs';

const axios = secondProviderAxios;
const endpoint = (clientNumber: string, postId: string = '') => `/client/${clientNumber}/posts/${postId}`;

export const postsApi = {
    /**
     * @pact
     * @pact-path /api/clients/10/posts
     * @pact-method GET
     */
    getPosts: async function (clientNumber: string, /** @pact-query */ query: QueryToGetPosts): Promise<PostModel[]> {
        const url = endpoint(clientNumber);
        /** @pact-response-body */
        const data = await axios.get<PostDto[]>(url + '?' + qs.stringify(query)).then((response) => response.data);
        const mappedPost = data.map(mapDtoToModelForPost);
        return mappedPost;
    },

    /**
     * @pact
     * @pact-path /api/clients/10/posts
     * @pact-method POST
     */
    addNewPost: async function (clientNumber: string, /** @pact-request-body */ newPost: NewPost) {
        const url = endpoint(clientNumber);
        /** @pact-request-body */
        const body = {newPost};
        return axios.post(url, body);
    },

    /**
     * @pact
     * @pact-path /api/clients/10/posts
     * @pact-method POST
     */
    addNewPersonalPost: async function (clientNumber: string, newPost: NewPost, toEmail: string) {
        const url = endpoint(clientNumber);
        /** @pact-request-body */
        const body = {
            personalPost: newPost,
            /** @pact-matcher email */
            email: toEmail,
        };
        return axios.post(url, body);
    },

    /**
     * @pact
     * @pact-path /api/clients/10/posts/25
     * @pact-method DELETE
     */
    deletePost: function ({clientNumber, postId}: {clientNumber: string; postId: string}) {
        const url = endpoint(clientNumber, postId);
        return axios.delete(url);
    },

    /**
     * @pact
     * @pact-path /api/clients/10/posts/25/status
     * @pact-method GET
     */
    getStatusOfPost: async function ({clientNumber, postId}: {clientNumber: string; postId: string}) {
        const url = endpoint(clientNumber, postId) + '/status';
        const {data} = await axios.get<POST_STATUSES>(url);
        return data;
    },
};

enum POST_STATUSES {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    READ_ONLY = 'READ_ONLY',
    BLOCKED = 'BLOCKED',
}

interface QueryToGetPosts {
    booleanField: boolean;
    /** @pact-matcher iso-date */
    fromDate: string;
}

interface PostDto {
    stringField: string;
}

interface PostModel {
    postContent: string;
}

interface NewPost {
    stringField: string;
}

const mapDtoToModelForPost = (postDto: PostDto): PostModel => {
    return {postContent: postDto.stringField};
};
