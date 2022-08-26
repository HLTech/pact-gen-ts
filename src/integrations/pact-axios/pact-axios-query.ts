import {getTypeRepresentation} from '../../core/type-representation';
import * as tsMorph from 'ts-morph';
import {changeObjectRepresentationIntoExample} from '../../core/create-pact-example-object';
import {changeObjectRepresentationIntoMatchingRules, MatchingRules} from '../../core/create-pact-matching-rules';
import qs, {IStringifyOptions} from 'qs';
import {PactAxios} from './pact-axios';

export class PactAxiosQuery {
    public query: string | undefined;
    public matchingRules: MatchingRules | undefined;

    constructor(axios: PactAxios, sourceFile: tsMorph.SourceFile, queryArrayFormat: IStringifyOptions['arrayFormat']) {
        const queryElementType = axios.getQueryType();
        if (queryElementType) {
            const basicTypeRepresentationOfRequestBody = getTypeRepresentation(queryElementType, sourceFile);
            const exampleRepresentationOfQueryObject = changeObjectRepresentationIntoExample(basicTypeRepresentationOfRequestBody);
            this.query = qs.stringify(exampleRepresentationOfQueryObject, {arrayFormat: queryArrayFormat || 'brackets'});
            this.matchingRules = changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfRequestBody, '$.query');
        }
    }
}
