import * as ts from 'typescript';
import * as tsMorph from 'ts-morph';
import {Interaction} from "./interactions";

export function mapJsDocsIntoInteraction(jsDocNode: tsMorph.Node): Interaction {
    const newInteraction: Interaction = {request: {}, response: {}};

    for (const jsDocTag of jsDocNode.getChildren()) {
        const jsDocTagElement = jsDocTag.compilerNode as ts.JSDocTag;
        switch (jsDocTagElement.tagName.escapedText as string) {
            case 'pact-description': {
                newInteraction.description = jsDocTagElement.comment;
                break;
            }
            case 'pact-method': {
                newInteraction.request.method = jsDocTagElement.comment;
                break;
            }
            case 'pact-response-status': {
                newInteraction.response.status = Number(jsDocTagElement.comment);
                break;
            }
            case 'pact-path': {
                newInteraction.request.path = jsDocTagElement.comment;
                break;
            }
            case 'pact-response-header': {
                const headerValues = jsDocTagElement.comment?.split(`" "`);
                const nameOfHeader = headerValues?.[0].substr(1);
                const valueOfHeader = headerValues?.[1].slice(0, -1);
                if (nameOfHeader && valueOfHeader) {
                    newInteraction.response.headers = {...newInteraction.response.headers, [nameOfHeader]: valueOfHeader};
                }
                break;
            }
            case 'pact-request-header': {
                const headerValues = jsDocTagElement.comment?.split(`" "`);
                const nameOfHeader = headerValues?.[0].substr(1);
                const valueOfHeader = headerValues?.[1].slice(0, -1);
                if (nameOfHeader && valueOfHeader) {
                    newInteraction.request.headers = {...newInteraction.request.headers, [nameOfHeader]: valueOfHeader};
                }
                break;
            }
        }
    }

    return newInteraction;
}
