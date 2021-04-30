import {createMapper} from '../utils/mapper';
import {isLiteralObject} from '../utils/object-type';
import {TypeRepresentation} from './type-representation';

const exampleRepresentationOfType = createMapper<unknown, boolean | number | string>([
    ['boolean', true],
    ['number', 10],
    ['string', 'text'],
    ['email', 'email@example.com'],
    ['iso-date', '2013-02-01'],
    ['iso-datetime', '2015-08-06T16:53:10+01:00'],
    ['iso-datetime-with-millis', '2015-08-06T16:53:10.123+01:00'],
    ['iso-time', 'T22:44:30.652Z'],
    ['timestamp', 'Mon, 31 Oct 2016 15:21:14 -0400'],
    ['uuid', 'ce118b6e-d8e1-11e7-9296-cec278b6b50a'],
    ['ipv4', '127.0.0.13'],
    ['ipv6', '::ffff:192.0.2.128'],
    ['hex', '3F'],
]);

export const changeObjectRepresentationIntoExample = (objectRepresentation: TypeRepresentation): unknown => {
    if (objectRepresentation.isArray) {
        return [
            changeObjectRepresentationIntoExample({
                ...objectRepresentation,
                isArray: false,
            }),
        ];
    }
    if (objectRepresentation.isEnum) {
        return objectRepresentation.enumValues![0];
    }
    if (objectRepresentation.exampleValue) {
        if (objectRepresentation.type === 'number') {
            return Number(objectRepresentation.exampleValue);
        }
        if (objectRepresentation.exampleValue.startsWith('"') && objectRepresentation.exampleValue.endsWith('"')) {
            return objectRepresentation.exampleValue.slice(1, -1);
        }
        return objectRepresentation.exampleValue;
    }
    if (isLiteralObject(objectRepresentation.type)) {
        return Object.fromEntries(
            Object.entries(objectRepresentation.type).map(([key, value]) => [key, changeObjectRepresentationIntoExample(value)]),
        );
    }
    return exampleRepresentationOfType(objectRepresentation.type);
};
