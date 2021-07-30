import * as tsMorph from 'ts-morph';
import {Interaction} from './interaction-creator';
import {getTypeRepresentation} from './type-representation';
import {changeObjectRepresentationIntoExample} from './create-pact-example-object';
import {changeObjectRepresentationIntoMatchingRules} from './create-pact-matching-rules';

export class AxiosInteraction {
    constructor(private node: tsMorph.CallExpression, private sourceFile: tsMorph.SourceFile) {
        if (node.getKind() !== tsMorph.SyntaxKind.CallExpression) {
            throw new Error('Expected CallExpression node');
        }
    }

    public isValid(): boolean {
        return (
            (this.axiosInstanceName === 'AxiosStatic' || this.axiosInstanceName === 'AxiosInstance') &&
            ['get', 'post', 'put'].includes(this.httpMethod)
        );
    }

    public get axiosInstanceName(): string | undefined {
        const expressiion = this.node.getExpression();

        switch (expressiion.getKind()) {
            // Handle cases:
            //  Axios.get
            //  httpClient.port
            case tsMorph.SyntaxKind.PropertyAccessExpression:
                const [method, instance, ...rest] = expressiion.getDescendantsOfKind(tsMorph.SyntaxKind.Identifier).reverse();
                return instance.getType().getSymbol()?.getName();
        }
    }

    public get httpMethod() {
        const expression = this.node.getExpression();

        switch (expression.getKind()) {
            // Handle cases:
            //  Axios.get
            //  httpClient.port
            case tsMorph.SyntaxKind.PropertyAccessExpression:
                const identifiers = expression.getDescendantsOfKind(tsMorph.SyntaxKind.Identifier);
                const method = identifiers[identifiers.length - 1];
                const methodName = method.getText();
                return methodName;

            // TODO: handle case Axios({method: 'get'});
            case tsMorph.SyntaxKind.Identifier:
            default:
                return '';
        }
    }

    public getUrl() {
        const argumentNode = this.node.getArguments()[0];
        switch (argumentNode.getKind()) {
            case tsMorph.SyntaxKind.StringLiteral:
                return argumentNode.getText();
        }
    }

    private get reponseType() {
        return this.node.getTypeArguments()[0].getType();
    }

    public toInteraction(): Interaction {
        const basicTypeRepresentationOfRequestBody = getTypeRepresentation(this.reponseType, this.sourceFile);
        const body = {
            body: changeObjectRepresentationIntoExample(basicTypeRepresentationOfRequestBody),
            matchingRules: changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfRequestBody, '$.body'),
        };

        return {
            description: `${this.httpMethod} ${this.getUrl()}`,
            request: {
                method: this.httpMethod,
                path: this.getUrl(),
                headers: {},
            },
            response: {
                body: body.body,
                matchingRules: body.matchingRules,
            },
        };
    }
}
