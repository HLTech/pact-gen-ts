import * as ts from 'typescript';
import * as tsMorph from 'ts-morph';
import {mapJsDocsIntoInteraction} from './js-docs-into-interaction';
import {getTypeRepresentation} from './type-representation';
import {changeObjectRepresentationIntoExample} from './create-pact-example-object';
import qs from 'qs';
import {ProviderConfig} from './read-pacts-config';
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
    constructor(private readonly sourceFile: tsMorph.SourceFile, private readonly provider: ProviderConfig) {}

    public static getAllInteractionsInFile(sourceFile: tsMorph.SourceFile, provider: ProviderConfig) {
        return new InteractionCreator(sourceFile, provider).findAllInteractions();
    }

    public findAllInteractions() {
        const pactJsDocNodes = this.getPactJsDocsNodes();
        return pactJsDocNodes.map(this.getInteractionForPactJsDoc);
    }

    private getPactJsDocsNodes = () => {
        const allJsDocsNodes = this.sourceFile.getDescendantsOfKind(ts.SyntaxKind.JSDoc);
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
            newInteraction.description ||= InteractionCreator.getNameOfFunction(nodeWithUsagePactJsDoc);

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
        const functionBody = apiFunctionNode.getFirstChildByKind(ts.SyntaxKind.Block);
        const responseBodyType =
            (functionBody && InteractionCreator.getResponseTypeFromFunctionBody(functionBody)) ||
            InteractionCreator.getReturnTypeOfFunction(apiFunctionNode.getType());
        const basicTypeRepresentationOfResponse = getTypeRepresentation(responseBodyType, this.sourceFile, true);
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
            const basicTypeRepresentationOfRequestBody = getTypeRepresentation(requestBodyElementType, this.sourceFile);
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
            const basicTypeRepresentationOfRequestBody = getTypeRepresentation(queryElementType, this.sourceFile);
            const exampleRepresentationOfQueryObject = changeObjectRepresentationIntoExample(basicTypeRepresentationOfRequestBody);
            return {
                query: qs.stringify(exampleRepresentationOfQueryObject, {arrayFormat: this.provider.queryArrayFormat || 'brackets'}),
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
            case ts.SyntaxKind.VariableStatement:
                const variableDeclarationNode = node
                    .getFirstChildByKind(ts.SyntaxKind.VariableDeclarationList)
                    ?.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration);
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

    private static getNameOfFunction = (nodeWithFunction: tsMorph.Node): string => {
        if (nodeWithFunction.getKind() === ts.SyntaxKind.VariableStatement) {
            return nodeWithFunction
                .getFirstChildByKindOrThrow(ts.SyntaxKind.VariableDeclarationList)
                .getFirstDescendantByKindOrThrow(ts.SyntaxKind.VariableDeclaration)
                .getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier)
                .getText();
        } else {
            return nodeWithFunction.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier)?.getText();
        }
    };

    private static getResponseTypeFromFunctionBody = (bodyOfFunction: tsMorph.Block): tsMorph.Type | undefined => {
        const responseBodyJsDoc = bodyOfFunction.getDescendantsOfKind(ts.SyntaxKind.JSDoc).find((jsDocComment) => {
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

    private static getReturnTypeOfFunction = (functionType: tsMorph.Type) => {
        const returnType = functionType.getCallSignatures()[0].getReturnType();
        if (returnType.getTargetType()?.getText() === 'Promise<T>') {
            return returnType.getTypeArguments()[0];
        }
        return returnType;
    };

    private static getParameterWithJsDocFromFunction = (
        functionDeclaration: tsMorph.Node,
        jsDoc: string,
    ): tsMorph.ParameterDeclaration | undefined => {
        const parametersOfFunction = functionDeclaration.getChildrenOfKind(ts.SyntaxKind.Parameter);
        for (const parameter of parametersOfFunction) {
            const jsDocIdentifierNode = parameter
                .getFirstChildByKind(ts.SyntaxKind.JSDoc)
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
            .getFirstChildByKind(ts.SyntaxKind.Block)
            ?.getDescendantsOfKind(ts.SyntaxKind.JSDoc)
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
