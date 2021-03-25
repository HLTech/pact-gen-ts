import * as ts from 'typescript';
import * as tsMorph from 'ts-morph';
import {mapJsDocsIntoInteraction} from "./jsDocsIntoInteraction";
import {getBasicRepresentationOfType, getReturnTypeOfFunction} from "./typescriptTypes";
import {changeObjectRepresentationIntoExample, changeObjectRepresentationIntoMatchingRules} from "./pactGenerating";
import {isEmptyObject} from "../utils/objectType";
import {printInteraction} from "./printInteraction";

export interface Interaction {
    description?: string;
    request: {
        method?: string;
        path?: string;
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

            printInteraction(newInteraction);

            interactions.push(newInteraction);

            return;
        }
    }

    const children = node.getChildren();
    children.map((child) => getInteractionFromTsNode(child, source, interactions));
}