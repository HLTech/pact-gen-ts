import {Interaction} from "./interactions";

export function printInteraction(interaction: Interaction) {
    const {description, request, response} = interaction;
    description && console.log(description);
    console.log(`${request.method}: ${request.path}`);
    console.log('Response:');
    console.log(response.body);
    console.log('\n');
}
