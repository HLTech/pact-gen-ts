import * as ts from 'typescript';
import * as tsMorph from 'ts-morph';
import {mapJsDocsIntoInteraction} from './js-docs-into-interaction';
import {getBasicRepresentationOfType, getReturnTypeOfFunction} from './typescript-types';
import {changeObjectRepresentationIntoExample} from './create-pact-example-object';
import qs from 'qs';
import {Provider} from './read-pacts-config';
import {getDefaultResponseStatusForInteraction} from './default-response-status';
import {PACT_ANNOTATIONS} from '../consts/pact-annotations';
import {changeObjectRepresentationIntoMatchingRules} from './create-pact-matching-rules';

export interface Interaction {
    description?: string;
    request: {
        method?: string;
        path?: string;
        body?: unknown;
        query?: string;
        matchingRules?: object;
        headers?: Record<string, string>;
    };
    response: {
        status?: number;
        body?: unknown;
        matchingRules?: object;
        headers?: Record<string, string>;
    };
}

export class InteractionCreator {
    constructor(private readonly sourceFile: tsMorph.Node, private readonly provider: Provider) {}

    public static getAllInteractionsInFile(sourceFile: tsMorph.Node, provider: Provider) {
        return new InteractionCreator(sourceFile, provider).findAllInteractions();
    }

    public findAllInteractions() {
        const pactJsDocNodes = this.getPactJsDocsNodes();
        return pactJsDocNodes.map(this.getInteractionForPactJsDoc);
    }

    private getPactJsDocsNodes = () => {
        const allJsDocsNodes = this.sourceFile.getDescendantsOfKind(ts.SyntaxKind.JSDocComment);
        return allJsDocsNodes.filter((jsDocNode) =>
            jsDocNode
                .getChildrenOfKind(ts.SyntaxKind.JSDocTag)
                .find((jsDocTag) => jsDocTag.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText() === PACT_ANNOTATIONS.PACT),
        );
    };

    private getInteractionForPactJsDoc = (pactJsDoc: tsMorph.JSDoc): Interaction => {
        const nodeWithUsagePactJsDoc = pactJsDoc.getParent();
        const apiFunctionNode = InteractionCreator.getFunctionNode(nodeWithUsagePactJsDoc);
        if (apiFunctionNode) {
            const newInteraction = mapJsDocsIntoInteraction(pactJsDoc);
            newInteraction.response.status ||= getDefaultResponseStatusForInteraction(newInteraction);
            newInteraction.description ||= nodeWithUsagePactJsDoc.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText();

            newInteraction.request.headers = {...this.provider.requestHeaders, ...newInteraction.request.headers};
            newInteraction.response.headers = {...this.provider.responseHeaders, ...newInteraction.response.headers};

            const responseBody = this.getResponseBodyForApiFunction(apiFunctionNode);
            const requestBody = this.getRequestBodyForApiFunction(apiFunctionNode);
            const queryOfRequest = this.getQueryRequestForApiFunction(apiFunctionNode);

            newInteraction.response.body = responseBody.body;
            newInteraction.response.matchingRules = responseBody.matchingRules;
            newInteraction.request.body = requestBody?.body;
            newInteraction.request.query = queryOfRequest?.query;
            newInteraction.request.matchingRules =
                queryOfRequest?.matchingRules || requestBody?.matchingRules
                    ? {...queryOfRequest?.matchingRules, ...requestBody?.matchingRules}
                    : undefined;

            return newInteraction;
        }
        throw Error;
    };

    private getResponseBodyForApiFunction = (apiFunctionNode: tsMorph.Node) => {
        const functionBody = apiFunctionNode.getFirstChildByKindOrThrow(ts.SyntaxKind.Block);
        let responseBodyType = InteractionCreator.getResponseTypeFromFunctionBody(functionBody);
        if (responseBodyType === undefined) {
            responseBodyType = getReturnTypeOfFunction(apiFunctionNode.getType());
        }
        const basicTypeRepresentationOfResponse = getBasicRepresentationOfType(responseBodyType, this.sourceFile, true);
        return {
            body: changeObjectRepresentationIntoExample(basicTypeRepresentationOfResponse),
            matchingRules: changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfResponse, '$.body'),
        };
    };

    private getRequestBodyForApiFunction = (apiFunctionNode: tsMorph.Node) => {
        const requestBodyElement =
            InteractionCreator.getParameterWithJsDocFromFunction(apiFunctionNode, PACT_ANNOTATIONS.PACT_REQUEST_BODY) ||
            InteractionCreator.getVariableWithJsDocFromFunction(apiFunctionNode, PACT_ANNOTATIONS.PACT_REQUEST_BODY);
        if (requestBodyElement) {
            const requestBodyElementType = requestBodyElement.getType();
            const basicTypeRepresentationOfRequestBody = getBasicRepresentationOfType(requestBodyElementType, this.sourceFile);
            return {
                body: changeObjectRepresentationIntoExample(basicTypeRepresentationOfRequestBody),
                matchingRules: changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfRequestBody, '$.body'),
            };
        }
    };

    private getQueryRequestForApiFunction = (apiFunctionNode: tsMorph.Node) => {
        const queryElement =
            InteractionCreator.getParameterWithJsDocFromFunction(apiFunctionNode, PACT_ANNOTATIONS.PACT_QUERY) ||
            InteractionCreator.getVariableWithJsDocFromFunction(apiFunctionNode, PACT_ANNOTATIONS.PACT_QUERY);
        if (queryElement) {
            const queryElementType = queryElement.getType();
            const basicTypeRepresentationOfRequestBody = getBasicRepresentationOfType(queryElementType, this.sourceFile);
            const exampleRepresentationOfQueryObject = changeObjectRepresentationIntoExample(basicTypeRepresentationOfRequestBody);
            return {
                query: qs.stringify(exampleRepresentationOfQueryObject),
                matchingRules: changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfRequestBody, '$.query'),
            };
        }
    };

    private static getFunctionNode = (node: tsMorph.Node): tsMorph.Node | undefined => {
        switch (node.getKind()) {
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.MethodDeclaration:
                return node;
            case ts.SyntaxKind.VariableDeclaration:
                const variableDeclarationNode = node
                    .getFirstChildByKind(ts.SyntaxKind.VariableDeclarationList)
                    ?.getFirstChildByKind(ts.SyntaxKind.VariableDeclaration);
                if (variableDeclarationNode) {
                    return (
                        variableDeclarationNode.getFirstChildByKind(ts.SyntaxKind.FunctionDeclaration) ||
                        variableDeclarationNode.getFirstChildByKind(ts.SyntaxKind.ArrowFunction)
                    );
                }
                break;
            case ts.SyntaxKind.PropertyAssignment:
            case ts.SyntaxKind.PropertyDeclaration:
                return node.getFirstChildByKind(ts.SyntaxKind.FunctionExpression) || node.getFirstChildByKind(ts.SyntaxKind.ArrowFunction);
        }
    };

    private static getResponseTypeFromFunctionBody = (bodyOfFunction: tsMorph.Block): tsMorph.Type | undefined => {
        const responseBodyJsDoc = bodyOfFunction.getDescendantsOfKind(ts.SyntaxKind.JSDocComment).find((jsDocComment) => {
            return (
                jsDocComment.getFirstChildByKind(ts.SyntaxKind.JSDocTag)?.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText() ===
                PACT_ANNOTATIONS.PACT_RESPONSE_BODY
            );
        });
        if (responseBodyJsDoc) {
            const variableStatementNode = responseBodyJsDoc.getParent();
            return variableStatementNode.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration)?.getType();
        }
    };

    private static getParameterWithJsDocFromFunction = (
        functionDeclaration: tsMorph.Node,
        jsDoc: string,
    ): tsMorph.ParameterDeclaration | undefined => {
        const parametersOfFunction = functionDeclaration.getChildrenOfKind(ts.SyntaxKind.Parameter);
        for (const parameter of parametersOfFunction) {
            const jsDocIdentifierNode = parameter
                .getFirstChildByKind(ts.SyntaxKind.JSDocComment)
                ?.getFirstChildByKind(ts.SyntaxKind.JSDocTag)
                ?.getFirstChildByKind(ts.SyntaxKind.Identifier);
            if (jsDocIdentifierNode?.getText() === jsDoc) {
                return parameter;
            }
        }
    };

    private static getVariableWithJsDocFromFunction = (
        functionDeclaration: tsMorph.Node,
        jsDoc: string,
    ): tsMorph.VariableDeclaration | undefined => {
        const pactBodyJsDoc = functionDeclaration
            .getFirstChildByKindOrThrow(ts.SyntaxKind.Block)
            .getDescendantsOfKind(ts.SyntaxKind.JSDocComment)
            .find((jsDocComment) => {
                return (
                    jsDocComment.getFirstChildByKind(ts.SyntaxKind.JSDocTag)?.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText() ===
                    jsDoc
                );
            });
        if (pactBodyJsDoc) {
            const variableStatementNode = pactBodyJsDoc.getParent();
            return variableStatementNode.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration);
        }
    };
}
