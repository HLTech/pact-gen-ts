import * as ts from 'typescript';
import * as tsMorph from 'ts-morph';
import {mapJsDocsIntoInteraction} from './js-docs-into-interaction';
import {ProviderConfig} from './read-pacts-config';
import {getDefaultResponseStatusForInteraction} from './default-response-status';
import {PACT_ANNOTATIONS} from '../consts/pact-annotations';
import {PactAxios} from '../integrations/pact-axios/pact-axios';
import {PactDescription} from './pact-description';
import {PactAxiosResponseBody} from '../integrations/pact-axios/pact-axios-response-body';
import {ResponseBody} from './response-body';
import {RequestBody} from './request-body';
import {PactAxiosRequestBody} from '../integrations/pact-axios/pact-axios-request-body';
import {Query} from './query';
import {PactAxiosQuery} from '../integrations/pact-axios/pact-axios-query';

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
            const pactDescription = new PactDescription(pactJsDoc);
            const newInteraction = mapJsDocsIntoInteraction(pactJsDoc);

            newInteraction.description ||= InteractionCreator.getNameOfFunction(nodeWithUsagePactJsDoc);

            newInteraction.request.headers = {...this.provider.requestHeaders, ...newInteraction.request.headers};
            newInteraction.response.headers = {...this.provider.responseHeaders, ...newInteraction.response.headers};

            let responseBody;
            let requestBody;
            let queryOfRequest;

            if (pactDescription.isAxiosTagSet()) {
                const pactAxios = new PactAxios(apiFunctionNode);

                newInteraction.request.method = pactAxios.getRequestMethod();

                newInteraction.request.path ||= pactAxios.getPath();
                responseBody = new PactAxiosResponseBody(pactAxios, this.sourceFile);
                requestBody = new PactAxiosRequestBody(pactAxios, this.sourceFile);
                queryOfRequest = new PactAxiosQuery(pactAxios, this.sourceFile, this.provider.queryArrayFormat);
            } else {
                responseBody = new ResponseBody(apiFunctionNode, this.sourceFile);
                requestBody = new RequestBody(apiFunctionNode, this.sourceFile);
                queryOfRequest = new Query(apiFunctionNode, this.sourceFile, this.provider.queryArrayFormat);
            }

            if (this.provider.baseURL) {
                newInteraction.request.path = this.provider.baseURL + (newInteraction.request.path || '');
            }
            newInteraction.response.body = responseBody.body;
            newInteraction.response.matchingRules = responseBody.matchingRules;
            newInteraction.request.body = requestBody.body;
            newInteraction.request.query = queryOfRequest.query;
            newInteraction.request.matchingRules =
                queryOfRequest.matchingRules || requestBody.matchingRules
                    ? {...queryOfRequest?.matchingRules, ...requestBody?.matchingRules}
                    : undefined;
            newInteraction.response.status ||= getDefaultResponseStatusForInteraction(newInteraction);

            return newInteraction;
        }
        throw Error;
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

    static getResponseTypeFromFunctionBody = (bodyOfFunction: tsMorph.Block): tsMorph.Type | undefined => {
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

    static getReturnTypeOfFunction = (functionType: tsMorph.Type) => {
        const returnType = functionType.getCallSignatures()[0].getReturnType();
        if (returnType.getTargetType()?.getText() === 'Promise<T>') {
            return returnType.getTypeArguments()[0];
        }
        return returnType;
    };

    static getParameterWithJsDocFromFunction = (
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

    static getVariableWithJsDocFromFunction = (
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
