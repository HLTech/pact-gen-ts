import {getTypeRepresentation} from './type-representation';
import {InteractionCreator} from './interaction-creator';
import * as tsMorph from 'ts-morph';
import {changeObjectRepresentationIntoExample} from './create-pact-example-object';
import {changeObjectRepresentationIntoMatchingRules, MatchingRules} from './create-pact-matching-rules';
import {PACT_ANNOTATIONS} from '../consts/pact-annotations';
import qs, {IStringifyOptions} from 'qs';

export class Query {
    public query: string | undefined;
    public matchingRules: MatchingRules | undefined;

    constructor(apiFunctionNode: tsMorph.Node, sourceFile: tsMorph.SourceFile, queryArrayFormat: IStringifyOptions['arrayFormat']) {
        const queryElement =
            InteractionCreator.getParameterWithJsDocFromFunction(apiFunctionNode, PACT_ANNOTATIONS.PACT_QUERY) ||
            InteractionCreator.getVariableWithJsDocFromFunction(apiFunctionNode, PACT_ANNOTATIONS.PACT_QUERY);
        if (queryElement) {
            const queryElementType = queryElement.getType();
            const basicTypeRepresentationOfRequestBody = getTypeRepresentation(queryElementType, sourceFile);
            const exampleRepresentationOfQueryObject = changeObjectRepresentationIntoExample(basicTypeRepresentationOfRequestBody);
            this.query = qs.stringify(exampleRepresentationOfQueryObject, {arrayFormat: queryArrayFormat || 'brackets'});
            this.matchingRules = changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfRequestBody, '$.query');
        }
    }
}
