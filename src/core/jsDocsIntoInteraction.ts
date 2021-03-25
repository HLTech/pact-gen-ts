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
        }
    }

    return newInteraction;
}
