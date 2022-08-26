import * as tsMorph from 'ts-morph';
import * as ts from 'typescript';
import {PACT_ANNOTATIONS} from '../consts/pact-annotations';

export class PactTag {
    public tagName: string | undefined;
    public value: string | undefined;

    constructor(jsDocTag: tsMorph.JSDocUnknownTag) {
        this.tagName = jsDocTag.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText();
        this.value = jsDocTag.getCommentText();
    }

    hasAnnotation(annotation: PACT_ANNOTATIONS) {
        return this.tagName === annotation;
    }
}
