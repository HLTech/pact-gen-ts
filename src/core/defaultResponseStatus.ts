import {Interaction} from './interactions';

export const getDefaultResponseStatusForInteraction = (interaction: Interaction) => {
    switch (interaction.request.method) {
        case 'POST':
            return 201;
        case 'PATCH':
        case 'DELETE':
        case 'PUT':
            if (interaction.response.body) {
                return 200;
            }
            return 204;
        case 'GET':
        case 'HEAD':
        case 'CONNECT':
        case 'TRACE':
        case 'OPTIONS':
        default:
            return 200;
    }
};
