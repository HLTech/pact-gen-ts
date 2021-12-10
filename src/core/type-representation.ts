import * as tsMorph from 'ts-morph';
import * as ts from 'typescript';
import {PACT_ANNOTATIONS} from '../consts/pact-annotations';

export interface TypeRepresentation {
    type?: string | Record<string, TypeRepresentation>;
    isArray?: boolean;
    isEnum?: boolean;
    enumValues?: Array<number | string>;
    exampleValue?: string;
}

export function getTypeRepresentation(
    entryType: tsMorph.Type,
    source: tsMorph.SourceFile,
    isResponseFromFunction?: boolean,
): TypeRepresentation {
    if (entryType.isAny()) {
        console.error('[ERROR]: "any" type is not allowed.');
        process.exit(1);
    }

    if (entryType.isTuple()) {
        console.error('[ERROR]: tuples in this tool are not allowed.');
        process.exit(2);
    }

    if (entryType.isUnknown() || entryType.isUndefined() || entryType.isNull()) {
        return {};
    }

    const stringRepresentationOfType = entryType.getText(source);

    // Only for return type from function
    if (isResponseFromFunction && (stringRepresentationOfType.includes('AxiosResponse<any>') || stringRepresentationOfType === 'void')) {
        return {};
    }

    if (entryType.isArray()) {
        const arrayElementType = entryType.getArrayElementTypeOrThrow();
        return {
            ...getTypeRepresentation(arrayElementType, source),
            isArray: true,
        };
    }

    // For cases: field: "value";
    if (entryType.isLiteral()) {
        const literalValue = String(entryType.getLiteralValue());
        return {
            enumValues: [literalValue],
            isEnum: true,
        };
    }

    if ((entryType.isEnum() || entryType.isUnion()) && stringRepresentationOfType !== 'boolean') {
        const enumMembers = entryType.getUnionTypes();
        const enumValues = enumMembers.map((member) => member.getLiteralValue()).filter((member) => member);
        if (enumValues.length) {
            return {
                enumValues: enumValues as Array<number | string>,
                isEnum: true,
            };
        }
        // For cases: field: "YES" | undefined;
        return getTypeRepresentation(enumMembers[0], source);
    }

    switch (stringRepresentationOfType) {
        case 'Blob':
            return {type: 'string'};
        case 'string':
        case 'boolean':
        case 'number':
            return {type: stringRepresentationOfType};
        default:
            return {type: getObjectTypeRepresentation(entryType, source)};
    }
}

const getObjectTypeRepresentation = (entryType: tsMorph.Type, source: tsMorph.SourceFile): Record<string, TypeRepresentation> => {
    const objectTypeRepresentation: Record<string, TypeRepresentation> = {};

    const objectProperties = entryType.getProperties();
    for (const property of objectProperties) {
        const propertyName = property.getEscapedName();

        let typeMatcher: string | undefined;
        let exampleRepresentation: string | undefined;
        const jsDocTagsOfProperty = property.getValueDeclaration()?.getDescendantsOfKind(ts.SyntaxKind.JSDocTag);
        jsDocTagsOfProperty?.forEach((jsDocTag) => {
            const annotation = jsDocTag?.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText();
            if (annotation === PACT_ANNOTATIONS.PACT_MATCHER) {
                typeMatcher = jsDocTag?.getCommentText();
            } else if (annotation === PACT_ANNOTATIONS.PACT_EXAMPLE) {
                exampleRepresentation = jsDocTag?.getCommentText();
            }
        });

        const propertyType = property.getTypeAtLocation(source);
        const propertyTypeRepresentation = getTypeRepresentation(propertyType, source);
        if (typeMatcher && exampleRepresentation) {
            objectTypeRepresentation[propertyName] = {
                ...propertyTypeRepresentation,
                type: typeMatcher,
                exampleValue: exampleRepresentation,
            };
        } else if (typeMatcher) {
            objectTypeRepresentation[propertyName] = {...propertyTypeRepresentation, type: typeMatcher};
        } else if (exampleRepresentation) {
            objectTypeRepresentation[propertyName] = {...propertyTypeRepresentation, exampleValue: exampleRepresentation};
        } else {
            objectTypeRepresentation[propertyName] = propertyTypeRepresentation;
        }
    }

    return objectTypeRepresentation;
};
