import {getTypeRepresentation} from './type-representation';
import * as ts from 'typescript';
import {InteractionCreator} from './interaction-creator';
import * as tsMorph from 'ts-morph';
import {changeObjectRepresentationIntoExample} from './create-pact-example-object';
import {changeObjectRepresentationIntoMatchingRules} from './create-pact-matching-rules';
import {Body} from './body';

export class ResponseBody extends Body {
    constructor(apiFunctionNode: tsMorph.Node, sourceFile: tsMorph.SourceFile) {
        super();
        const functionBody = apiFunctionNode.getFirstChildByKind(ts.SyntaxKind.Block);
        const responseBodyType =
            (functionBody && InteractionCreator.getResponseTypeFromFunctionBody(functionBody)) ||
            InteractionCreator.getReturnTypeOfFunction(apiFunctionNode.getType());
        const basicTypeRepresentationOfResponse = getTypeRepresentation(responseBodyType, sourceFile, true);
        this.body = changeObjectRepresentationIntoExample(basicTypeRepresentationOfResponse);
        this.matchingRules = changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfResponse, '$.body');
    }
}
