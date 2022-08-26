import * as tsMorph from 'ts-morph';
import * as ts from 'typescript';
import {PACT_ANNOTATIONS} from '../consts/pact-annotations';
import {PactTag} from './pact-tag';

export class PactDescription {
    pactTags: PactTag[];

    constructor(pactJsDoc: tsMorph.JSDoc) {
        this.pactTags = pactJsDoc.getChildrenOfKind(ts.SyntaxKind.JSDocTag).map((child) => new PactTag(child));
    }

    isAxiosTagSet() {
        return this.pactTags.find((tag) => tag.hasAnnotation(PACT_ANNOTATIONS.PACT_AXIOS));
    }
}
