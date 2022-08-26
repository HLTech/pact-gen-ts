import {getTypeRepresentation} from './type-representation';
import {InteractionCreator} from './interaction-creator';
import * as tsMorph from 'ts-morph';
import {changeObjectRepresentationIntoExample} from './create-pact-example-object';
import {changeObjectRepresentationIntoMatchingRules} from './create-pact-matching-rules';
import {PACT_ANNOTATIONS} from '../consts/pact-annotations';
import {Body} from './body';

export class RequestBody extends Body {
    constructor(apiFunctionNode: tsMorph.Node, sourceFile: tsMorph.SourceFile) {
        super();
        const requestBodyElement =
            InteractionCreator.getParameterWithJsDocFromFunction(apiFunctionNode, PACT_ANNOTATIONS.PACT_REQUEST_BODY) ||
            InteractionCreator.getVariableWithJsDocFromFunction(apiFunctionNode, PACT_ANNOTATIONS.PACT_REQUEST_BODY);
        if (requestBodyElement) {
            const requestBodyElementType = requestBodyElement.getType();
            const basicTypeRepresentationOfRequestBody = getTypeRepresentation(requestBodyElementType, sourceFile);
            this.body = changeObjectRepresentationIntoExample(basicTypeRepresentationOfRequestBody);
            this.matchingRules = changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfRequestBody, '$.body');
        }
    }
}
