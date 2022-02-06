/**
 * @pact
 * @pact-method GET
 * @pact-path /api/standard
 */
export function standardFunction() {
    return 'string';
}

/**
 * @pact
 * @pact-method GET
 * @pact-path /api/arrow
 */
export const arrowFunction = () => {
    return 'string';
};

/**
 * @pact
 * @pact-method GET
 * @pact-path /api/arrow/withoutCurlyBraces
 */
export const arrowFunctionWithoutCurlyBraces = () => 'string';

export const apiObject = {
    /**
     * @pact
     * @pact-method GET
     * @pact-path /api/object/property/function
     */
    objectPropertyFunction() {
        return 'string';
    },

    /**
     * @pact
     * @pact-method GET
     * @pact-path /api/object/property/arrow
     */
    objectPropertyArrowFunction: () => {
        return 'string';
    },

    /**
     * @pact
     * @pact-method GET
     * @pact-path /api/object/property/assigment-function
     */
    objectPropertyAssigmentFunction: function () {
        return 'string';
    },
};

export class ApiClass {
    /**
     * @pact
     * @pact-method GET
     * @pact-path /api/class/method
     */
    classMethodFunction() {
        return 'string';
    }

    /**
     * @pact
     * @pact-method GET
     * @pact-path /api/class/property/arrow
     */
    classPropertyArrowFunction = () => {
        return 'string';
    };

    /**
     * @pact
     * @pact-method GET
     * @pact-path /api/class/property/assigment-function
     */
    classPropertyAssigmentFunction = function () {
        return 'string';
    };
}
