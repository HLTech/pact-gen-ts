import * as ts from 'typescript';
import * as tsMorph from 'ts-morph';
import {mapJsDocsIntoInteraction} from './jsDocsIntoInteraction';
import {getBasicRepresentationOfType, getReturnTypeOfFunction} from './typescriptTypes';
import {changeObjectRepresentationIntoExample, changeObjectRepresentationIntoMatchingRules} from './pactGenerating';
import {isEmptyObject} from '../utils/objectType';
import {printInteraction} from './printInteraction';
import qs from 'qs';
import {Provider} from './read-pacts-config';
import {getDefaultResponseStatusForInteraction} from './defaultResponseStatus';

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

export function getInteractionFromTsNode(node: tsMorph.Node, source: tsMorph.Node, interactions: Interaction[], provider: Provider) {
    if (tsMorph.Node.isJSDoc(node)) {
        const getFunctionNode = (node: tsMorph.Node) => {
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
                    return (
                        node.getFirstChildByKind(ts.SyntaxKind.FunctionExpression) || node.getFirstChildByKind(ts.SyntaxKind.ArrowFunction)
                    );
            }
        };

        const parentNode = node.getParent();
        const functionNode = getFunctionNode(parentNode);
        if (functionNode) {
            let responseType = getResponseTypeFromFunctionBody(functionNode.getFirstChildByKindOrThrow(ts.SyntaxKind.Block))?.getType();
            if (!responseType) {
                const functionType = functionNode.getType();
                responseType = getReturnTypeOfFunction(functionType);
            }
            const basicTypeRepresentationOfResponse = getBasicRepresentationOfType(responseType, source);

            const newInteraction = mapJsDocsIntoInteraction(node);
            newInteraction.request.headers = {...provider.requestHeaders, ...newInteraction.request.headers};
            newInteraction.response.headers = {...provider.responseHeaders, ...newInteraction.response.headers};
            const exampleRepresentation = changeObjectRepresentationIntoExample(basicTypeRepresentationOfResponse);
            if (exampleRepresentation) {
                newInteraction.response.body = exampleRepresentation;
            }
            const matchingRules = changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfResponse, '$.body');
            if (isEmptyObject(matchingRules) === false) {
                const mapped = Object.fromEntries((matchingRules as []).map((a) => [Object.keys(a)[0], a[Object.keys(a)[0]]]));
                newInteraction.response.matchingRules = {...mapped, '$.body': {match: 'type'}};
            }

            const parameters = functionNode.getChildrenOfKind(ts.SyntaxKind.Parameter);
            let nodeWithRequestBody: tsMorph.VariableDeclaration | tsMorph.ParameterDeclaration | undefined = getParameterOfRequestBody(
                parameters,
            );
            if (!nodeWithRequestBody) {
                nodeWithRequestBody = getRequestBodyVariable(functionNode.getFirstChildByKindOrThrow(ts.SyntaxKind.Block));
            }
            if (nodeWithRequestBody) {
                const parameterType = nodeWithRequestBody.getType();
                const basicTypeRepresentationOfRequestBody = getBasicRepresentationOfType(parameterType, source);
                const exampleRepresentation = changeObjectRepresentationIntoExample(basicTypeRepresentationOfRequestBody);
                if (exampleRepresentation) {
                    newInteraction.request.body = exampleRepresentation;
                }
                const matchingRules = changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfResponse, '$.body');
                if (isEmptyObject(matchingRules) === false) {
                    const mapped = Object.fromEntries((matchingRules as []).map((a) => [Object.keys(a)[0], a[Object.keys(a)[0]]]));
                    newInteraction.request.matchingRules = {...mapped, '$.body': {match: 'type'}};
                }
            }
            const queryParameter = getParameterOfQuery(parameters);
            if (queryParameter) {
                const parameterType = queryParameter.getType();
                const basicTypeRepresentationOfQuery = getBasicRepresentationOfType(parameterType, source);
                const exampleRepresentationOfQueryObject = changeObjectRepresentationIntoExample(basicTypeRepresentationOfQuery);
                const exampleRepresentationOfQueryStrings = qs.stringify(exampleRepresentationOfQueryObject);
                newInteraction.request.query = exampleRepresentationOfQueryStrings;
                const matchingRules = changeObjectRepresentationIntoMatchingRules(basicTypeRepresentationOfQuery, '$.query');
                if (isEmptyObject(matchingRules) === false) {
                    const mapped = Object.fromEntries((matchingRules as []).map((a) => [Object.keys(a)[0], a[Object.keys(a)[0]]]));
                    newInteraction.request.matchingRules = {...mapped, ...newInteraction.request.matchingRules};
                }
            }

            if (!newInteraction.response.status) {
                newInteraction.response.status = getDefaultResponseStatusForInteraction(newInteraction);
            }

            printInteraction(newInteraction);

            interactions.push(newInteraction);

            return;
        }
    }

    const children = node.getChildren();
    children.map((child) => getInteractionFromTsNode(child, source, interactions, provider));
}

const getResponseTypeFromFunctionBody = (bodyOfFunction: tsMorph.Block) => {
    const responseBodyJsDoc = bodyOfFunction.getDescendantsOfKind(ts.SyntaxKind.JSDocComment).find((jsDocComment) => {
        return (
            jsDocComment.getFirstChildByKind(ts.SyntaxKind.JSDocTag)?.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText() ===
            'pact-response-body'
        );
    });
    if (responseBodyJsDoc) {
        const variableStatementNode = responseBodyJsDoc.getParent();
        return variableStatementNode.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration);
    }
};

const getParameterOfRequestBody = (parameters: tsMorph.ParameterDeclaration[]) => {
    for (const parameter of parameters) {
        const jsDocIdentifierNode = parameter
            .getFirstChildByKind(ts.SyntaxKind.JSDocComment)
            ?.getFirstChildByKind(ts.SyntaxKind.JSDocTag)
            ?.getFirstChildByKind(ts.SyntaxKind.Identifier);
        if (jsDocIdentifierNode?.getText() === 'pact-body') {
            return parameter;
        }
    }
};

const getParameterOfQuery = (parameters: tsMorph.ParameterDeclaration[]) => {
    for (const parameter of parameters) {
        const jsDocIdentifierNode = parameter
            .getFirstChildByKind(ts.SyntaxKind.JSDocComment)
            ?.getFirstChildByKind(ts.SyntaxKind.JSDocTag)
            ?.getFirstChildByKind(ts.SyntaxKind.Identifier);
        if (jsDocIdentifierNode?.getText() === 'pact-query') {
            return parameter;
        }
    }
};

const getRequestBodyVariable = (bodyOfFunction: tsMorph.Block) => {
    const pactBodyJsDoc = bodyOfFunction.getDescendantsOfKind(ts.SyntaxKind.JSDocComment).find((jsDocComment) => {
        return (
            jsDocComment.getFirstChildByKind(ts.SyntaxKind.JSDocTag)?.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText() ===
            'pact-body'
        );
    });
    if (pactBodyJsDoc) {
        const variableStatementNode = pactBodyJsDoc.getParent();
        return variableStatementNode.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration);
    }
};
