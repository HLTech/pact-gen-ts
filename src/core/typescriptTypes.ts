import * as tsMorph from 'ts-morph';

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
}

export function getBasicRepresentationOfType(entryType: tsMorph.Type, source: tsMorph.Node): ObjectRepresentation {
    const stringRepresentation = entryType.getText(source);

    if (stringRepresentation.includes('AxiosResponse<any>')) {
        return {objectType: undefined};
    }

    if (entryType.isTuple()) {
        console.error('[ERROR]: tuples in this tool are not allowed.');
        process.exit(1);
    }

    let isArray = false;
    if (entryType.isArray()) {
        isArray = true;
        entryType = entryType.getArrayElementTypeOrThrow();
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
                    const jsDocTag = topNodeOfDeclaration!.compilerNode?.tags?.[0].tagName.escapedText;
                    const objectTypeRepresentation = jsDocTag ? getObjectTypeRepresentationForJsDocTag(jsDocTag as string) : undefined;
                    if (objectTypeRepresentation) {
                        return [propertyName, {objectType: objectTypeRepresentation}];
                    }
                }
                return [propertyName, getBasicRepresentationOfType(propertyType, source)];
            });
            const objectRepresentation = Object.fromEntries(objectRepresentationAsEntries);
            return {objectType: objectRepresentation, isArray};
    }
}

const getObjectTypeRepresentationForJsDocTag = (tag: string) => {
    if (tag.startsWith('pact-') === false) {
        return undefined;
    }
    return tag.slice(5);
};
