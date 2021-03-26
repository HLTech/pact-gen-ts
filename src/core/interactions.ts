import * as ts from 'typescript';
import * as tsMorph from 'ts-morph';
import {mapJsDocsIntoInteraction} from "./jsDocsIntoInteraction";
import {getBasicRepresentationOfType, getReturnTypeOfFunction} from "./typescriptTypes";
import {changeObjectRepresentationIntoExample, changeObjectRepresentationIntoMatchingRules} from "./pactGenerating";
import {isEmptyObject} from "../utils/objectType";
import {printInteraction} from "./printInteraction";
import qs from 'qs';

export interface Interaction {
    description?: string;
    request: {
        method?: string;
        path?: string;
        body?: unknown;
        query?: string;
        matchingRules?: object;
    };
    response: {
        status?: number;
        body?: unknown;
        matchingRules?: object;
    };
}

export function getInteractionFromTsNode(node: tsMorph.Node, source: tsMorph.Node, interactions: Interaction[]) {
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
                        )
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
            const functionType = functionNode.getType();
            const responseType = getReturnTypeOfFunction(functionType);
            const basicTypeRepresentationOfResponse = getBasicRepresentationOfType(responseType, source);

            const newInteraction = mapJsDocsIntoInteraction(node);
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
            const requestBodyParameter = getParameterOfRequestBody(parameters);
            const queryParameter = getParameterOfQuery(parameters);
            if (requestBodyParameter) {
                const parameterType = requestBodyParameter.getType();
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

            printInteraction(newInteraction);

            interactions.push(newInteraction);

            return;
        }
    }

    const children = node.getChildren();
    children.map((child) => getInteractionFromTsNode(child, source, interactions));
}

const getParameterOfRequestBody = (parameters: tsMorph.ParameterDeclaration[]) => {
    for (const parameter of parameters) {
        const jsDocIdentifierNode = parameter.getFirstChildByKind(ts.SyntaxKind.JSDocComment)?.getFirstChildByKind(ts.SyntaxKind.JSDocTag)?.getFirstChildByKind(ts.SyntaxKind.Identifier);
        if (jsDocIdentifierNode?.getText() === 'pact-body') {
            return parameter;
        }
    }
}

const getParameterOfQuery = (parameters: tsMorph.ParameterDeclaration[]) => {
    for (const parameter of parameters) {
        const jsDocIdentifierNode = parameter.getFirstChildByKind(ts.SyntaxKind.JSDocComment)?.getFirstChildByKind(ts.SyntaxKind.JSDocTag)?.getFirstChildByKind(ts.SyntaxKind.Identifier);
        if (jsDocIdentifierNode?.getText() === 'pact-query') {
            return parameter;
        }
    }
}
