import {isEmptyObject, isLiteralObject} from '../utils/object-type';
import {TypeRepresentation} from './type-representation';
import {matchingRegexFormats} from '../consts/matching-regex-formats';

type MatchingRules = Record<string, {match: 'regex' | 'type'; regex?: string}>;

export const changeObjectRepresentationIntoMatchingRules = (objectRepresentation: TypeRepresentation, level: string) => {
    const matchingRules: MatchingRules = {};

    const findAllMatchingRulesRecursive = (objectRepresentation: TypeRepresentation, currentLevel: string) => {
        if (isLiteralObject(objectRepresentation.type)) {
            Object.entries(objectRepresentation.type).forEach(([fieldName, fieldObjectRepresentation]) =>
                findAllMatchingRulesRecursive(fieldObjectRepresentation, `${currentLevel}.${fieldName}`),
            );
        } else if (objectRepresentation.isEnum) {
            matchingRules[currentLevel] = {
                match: 'regex',
                regex: objectRepresentation.enumValues?.join('|'),
            };
        } else {
            const matchedFormat = matchingRegexFormats[objectRepresentation.type || ''];
            if (matchedFormat) {
                matchingRules[currentLevel] = {
                    match: 'regex',
                    regex: matchedFormat,
                };
            }
        }
    };

    findAllMatchingRulesRecursive(objectRepresentation, level);

    if (isEmptyObject(matchingRules) === false) {
        return {[level]: {match: 'type'}, ...matchingRules};
    }
};
