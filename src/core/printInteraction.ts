import {Interaction} from "./interactions";

export function printInteraction(interaction: Interaction) {
    const {description, request, response} = interaction;
    description && console.log(description);
    console.log(`${request.method}: ${request.path}`);
    console.log('Query:');
    console.log(request.query);
    console.log('Request:');
    console.log(request.body);
    console.log('Response:');
    console.log(response.body);
    console.log('\n');
}
