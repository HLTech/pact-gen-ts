import * as ts from 'typescript';
import * as tsMorph from 'ts-morph';
import {Interaction} from './interaction-creator';
import {PACT_ANNOTATIONS} from '../consts/pact-annotations';

export function mapJsDocsIntoInteraction(jsDocNode: tsMorph.Node): Interaction {
    const newInteraction: Interaction = {request: {}, response: {}};

    for (const jsDocTag of jsDocNode.getChildren()) {
        const jsDocTagElement = jsDocTag.compilerNode as ts.JSDocTag;
        switch (jsDocTagElement.tagName.escapedText as string) {
            case PACT_ANNOTATIONS.PACT_DESCRIPTION: {
                newInteraction.description = jsDocTagElement.comment;
                break;
            }
            case PACT_ANNOTATIONS.PACT_METHOD: {
                newInteraction.request.method = jsDocTagElement.comment;
                break;
            }
            case PACT_ANNOTATIONS.PACT_RESPONSE_STATUS: {
                newInteraction.response.status = Number(jsDocTagElement.comment);
                break;
            }
            case PACT_ANNOTATIONS.PACT_PATH: {
                newInteraction.request.path = jsDocTagElement.comment;
                break;
            }
            case PACT_ANNOTATIONS.PACT_RESPONSE_HEADER: {
                const headerValues = jsDocTagElement.comment?.split(`" "`);
                const nameOfHeader = headerValues?.[0].substr(1);
                const valueOfHeader = headerValues?.[1].slice(0, -1);
                if (nameOfHeader && valueOfHeader) {
                    newInteraction.response.headers = {...newInteraction.response.headers, [nameOfHeader]: valueOfHeader};
                }
                break;
            }
            case PACT_ANNOTATIONS.PACT_REQUEST_HEADER: {
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
