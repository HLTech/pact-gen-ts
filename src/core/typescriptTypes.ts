import * as tsMorph from 'ts-morph';
import * as ts from 'typescript';

export function getReturnTypeOfFunction(functionType: tsMorph.Type) {
    const returnType = functionType.getCallSignatures()[0].getReturnType();

    if (returnType.getText().startsWith('Promise<')) {
        return returnType.getTypeArguments()[0];
    }
    return returnType;
}

export interface ObjectRepresentation {
    objectType: string | Record<string, ObjectRepresentation> | undefined;
    isArray?: boolean;
    isEnum?: boolean;
    enumValues?: Array<number | string>;
    exampleValue?: string;
}

export function getBasicRepresentationOfType(entryType: tsMorph.Type, source: tsMorph.Node): ObjectRepresentation {
    let stringRepresentation = entryType.getText(source);

    if (stringRepresentation.includes('AxiosResponse<any>')) {
        return {objectType: undefined};
    }

    if (entryType.isAny()) {
        console.error('[ERROR]: "any" type is not allowed.');
        process.exit(1);
    }

    if (entryType.isTuple()) {
        console.error('[ERROR]: tuples in this tool are not allowed.');
        process.exit(2);
    }

    if (entryType.isUnknown()) {
        return {objectType: undefined};
    }

    let isArray = false;
    if (entryType.isArray()) {
        isArray = true;
        entryType = entryType.getArrayElementTypeOrThrow();
        stringRepresentation = entryType.getText(source);
    }
    if (entryType.isLiteral()) {
        const literalValue = String(entryType.getLiteralValue());
        return {
            objectType: undefined,
            enumValues: [literalValue],
            isEnum: true,
            isArray,
        };
    }
    if ((entryType.isEnum() || entryType.isUnion()) && stringRepresentation !== 'boolean') {
        const enumMembers = entryType.getUnionTypes();
        const enumValues = enumMembers.map((member) => member.getLiteralValue()).filter((member) => member);
        return {
            objectType: undefined,
            enumValues: enumValues as Array<number | string>,
            isEnum: true,
            isArray,
        };
    }
    switch (stringRepresentation) {
        case 'Blob':
            return {objectType: 'string', isArray};
        case 'string':
        case 'boolean':
        case 'number':
            return {objectType: stringRepresentation, isArray};
        default:
            const objectRepresentationAsEntries = entryType.getProperties().map((property) => {
                const propertyName = property.getEscapedName();
                const propertyType = property.getTypeAtLocation(source);
                const topNodeOfDeclaration = property.getValueDeclaration()?.getChildren()[0];
                if (tsMorph.Node.isJSDoc(topNodeOfDeclaration)) {
                    const jsDocTag = topNodeOfDeclaration.getFirstChildByKind(ts.SyntaxKind.JSDocTag);
                    const annotation = jsDocTag?.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText();
                    const objectTypeRepresentation = annotation === 'pact-matcher' && jsDocTag?.getComment();
                    if (objectTypeRepresentation) {
                        if (objectTypeRepresentation === 'example') {
                            const commentOfJsDoc = topNodeOfDeclaration!.compilerNode?.tags?.[0].comment;
                            return [propertyName, {...getBasicRepresentationOfType(propertyType, source), exampleValue: commentOfJsDoc}];
                        }
                        return [propertyName, {objectType: objectTypeRepresentation}];
                    }
                }
                return [propertyName, getBasicRepresentationOfType(propertyType, source)];
            });
            const objectRepresentation = Object.fromEntries(objectRepresentationAsEntries);
            return {objectType: objectRepresentation, isArray};
    }
}
