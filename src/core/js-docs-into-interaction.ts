import * as ts from 'typescript';
import * as tsMorph from 'ts-morph';
import {Interaction} from './interaction-creator';
import {PACT_ANNOTATIONS} from '../consts/pact-annotations';

export function mapJsDocsIntoInteraction(jsDocNode: tsMorph.JSDoc): Interaction {
    const newInteraction: Interaction = {request: {}, response: {}};

    for (const jsDocTag of jsDocNode.getChildrenOfKind(ts.SyntaxKind.JSDocTag)) {
        switch (jsDocTag.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()) {
            case PACT_ANNOTATIONS.PACT_DESCRIPTION: {
                newInteraction.description = jsDocTag.getComment();
                break;
            }
            case PACT_ANNOTATIONS.PACT_METHOD: {
                newInteraction.request.method = jsDocTag.getComment();
                break;
            }
            case PACT_ANNOTATIONS.PACT_RESPONSE_STATUS: {
                newInteraction.response.status = Number(jsDocTag.getComment());
                break;
            }
            case PACT_ANNOTATIONS.PACT_PATH: {
                newInteraction.request.path = jsDocTag.getComment();
                break;
            }
            case PACT_ANNOTATIONS.PACT_RESPONSE_HEADER: {
                const headerValues = jsDocTag.getComment()?.split(`" "`);
                const nameOfHeader = headerValues?.[0].substr(1);
                const valueOfHeader = headerValues?.[1].slice(0, -1);
                if (nameOfHeader && valueOfHeader) {
                    newInteraction.response.headers = {...newInteraction.response.headers, [nameOfHeader]: valueOfHeader};
                }
                break;
            }
            case PACT_ANNOTATIONS.PACT_REQUEST_HEADER: {
                const headerValues = jsDocTag.getComment()?.split(`" "`);
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
