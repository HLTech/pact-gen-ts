import * as tsMorph from 'ts-morph';
import * as ts from 'typescript';
import {PACT_ANNOTATIONS} from '../consts/pact-annotations';

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

export function getBasicRepresentationOfType(
    entryType: tsMorph.Type,
    source: tsMorph.Node,
    isResponseFromFunction?: boolean,
): ObjectRepresentation {
    if (entryType.isAny()) {
        if (isResponseFromFunction) {
            return {objectType: undefined};
        }
        console.error('[ERROR]: "any" type is not allowed.');
        process.exit(1);
    }

    if (entryType.isTuple()) {
        console.error('[ERROR]: tuples in this tool are not allowed.');
        process.exit(2);
    }

    if (entryType.isUnknown() || entryType.isUndefined() || entryType.isNull()) {
        return {objectType: undefined};
    }

    let stringRepresentation = entryType.getText(source);

    if (stringRepresentation.includes('AxiosResponse<any>') || stringRepresentation === 'void') {
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
        if (enumValues.length) {
            return {
                objectType: undefined,
                enumValues: enumValues as Array<number | string>,
                isEnum: true,
                isArray,
            };
        }
        return {
            ...getBasicRepresentationOfType(enumMembers[0], source),
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
                    if (annotation === PACT_ANNOTATIONS.PACT_MATCHER) {
                        const objectMatcher = jsDocTag?.getComment();
                        return [propertyName, {objectType: objectMatcher}];
                    }
                    if (annotation === PACT_ANNOTATIONS.PACT_EXAMPLE) {
                        const objectExampleRepresentation = jsDocTag?.getComment();
                        return [
                            propertyName,
                            {...getBasicRepresentationOfType(propertyType, source), exampleValue: objectExampleRepresentation},
                        ];
                    }
                }
                return [propertyName, getBasicRepresentationOfType(propertyType, source)];
            });
            const objectRepresentation = Object.fromEntries(objectRepresentationAsEntries);
            return {objectType: objectRepresentation, isArray};
    }
}
