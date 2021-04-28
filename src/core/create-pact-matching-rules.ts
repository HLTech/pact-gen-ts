import {ObjectRepresentation} from './typescript-types';
import {isEmptyObject, isLiteralObject} from '../utils/object-type';
import {matchingRegexFormats} from '../utils/matchers';

type MatchingRules = Record<string, {match: 'regex' | 'type'; regex?: string}>;

export const changeObjectRepresentationIntoMatchingRules = (objectRepresentation: ObjectRepresentation, level: string) => {
    const matchingRules: MatchingRules = {};

    const findAllMatchingRulesRecursive = (objectRepresentation: ObjectRepresentation, currentLevel: string) => {
        if (isLiteralObject(objectRepresentation.objectType)) {
            Object.entries(objectRepresentation.objectType).forEach(([fieldName, fieldObjectRepresentation]) =>
                findAllMatchingRulesRecursive(fieldObjectRepresentation, `${currentLevel}.${fieldName}`),
            );
        } else if (objectRepresentation.isEnum) {
            matchingRules[currentLevel] = {
                match: 'regex',
                regex: objectRepresentation.enumValues?.join('|'),
            };
        } else {
            const matchedFormat = matchingRegexFormats[objectRepresentation.objectType || ''];
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
