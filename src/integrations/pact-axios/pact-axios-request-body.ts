import {getTypeRepresentation} from '../../core/type-representation';
import {PactAxios} from './pact-axios';
import {changeObjectRepresentationIntoExample} from '../../core/create-pact-example-object';
import {changeObjectRepresentationIntoMatchingRules} from '../../core/create-pact-matching-rules';
import * as tsMorph from 'ts-morph';
import {Body} from '../../core/body';

export class PactAxiosRequestBody extends Body {
    constructor(axios: PactAxios, sourceFile: tsMorph.SourceFile) {
        super();
        const requestBodyType = axios.getRequestBodyType();
        if (requestBodyType) {
            const basicTypeRepresentationOfRequestBody = getTypeRepresentation(requestBodyType, sourceFile);
            this.body = changeObjectRepresentationIntoExample(basicTypeRepresentationOfRequestBody);
            this.matchingRules = changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfRequestBody, '$.body');
        }
    }
}
