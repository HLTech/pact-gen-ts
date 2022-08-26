import {getTypeRepresentation} from '../../core/type-representation';
import {PactAxios} from './pact-axios';
import {changeObjectRepresentationIntoExample} from '../../core/create-pact-example-object';
import {changeObjectRepresentationIntoMatchingRules} from '../../core/create-pact-matching-rules';
import * as tsMorph from 'ts-morph';
import {Body} from '../../core/body';

export class PactAxiosResponseBody extends Body {
    constructor(axios: PactAxios, sourceFile: tsMorph.SourceFile) {
        super();
        const basicTypeRepresentationOfResponse = getTypeRepresentation(axios.getResponseBodyType(), sourceFile, true);
        this.body = changeObjectRepresentationIntoExample(basicTypeRepresentationOfResponse);
        this.matchingRules = changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfResponse, '$.body');
    }
}
