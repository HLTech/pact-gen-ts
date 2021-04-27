export function isLiteralObject(a: any): a is object {
    return !!a && a.constructor === Object;
}

export function isEmptyObject(obj: object) {
    return Object.keys(obj).length === 0;
}
