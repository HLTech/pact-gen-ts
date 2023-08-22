import {createPacts} from '../../src/core/create-pacts';
import {pactsConfigFactory} from './mocks/pactsConfig';
import {IStringifyOptions} from 'qs';

describe('createPacts', () => {
    test.each([
        'basic',
        'pact-example',
        'pact-function-annotations',
        'pact-matcher',
        'pact-query',
        'pact-request-body',
        'pact-response-body',
        'type-analysis',
        'axios',
        'matching-rules',
        'different-functions',
        'pact-axios',
    ])('%s', (testCase) => {
        const pactsConfig = pactsConfigFactory(testCase);

        const generatedPacts = createPacts(pactsConfig);

        generatedPacts.forEach((pact) => {
            expect(JSON.parse(JSON.stringify(pact, null, 2))).toMatchSnapshot();
        });
    });

    test('base-url', () => {
        const pactsConfig = {
            consumer: 'consumer-name',
            buildDir: 'pacts',
            providers: [
                {
                    provider: 'provider-name',
                    files: ['tests/int/testCases/base-url/**/*.ts'],
                    baseURL: '/api/v1',
                },
            ],
        };

        const generatedPacts = createPacts(pactsConfig);

        generatedPacts.forEach((pact) => {
            expect(JSON.parse(JSON.stringify(pact, null, 2))).toMatchSnapshot();
        });
    });

    test.each<IStringifyOptions['arrayFormat']>(['brackets', 'indices', 'comma', 'repeat'])(
        'handles "%s" array format for query params',
        (queryArrayFormat) => {
            const pactsConfig = {...pactsConfigFactory('query-array-format'), commonConfigForProviders: {queryArrayFormat}};

            const generatedPact = createPacts(pactsConfig)[0];

            expect(JSON.parse(JSON.stringify(generatedPact, null, 2))).toMatchSnapshot();
        },
    );

    test('throws error when pact interactions array is empty', () => {
        const pactsConfig = {
            consumer: 'consumer-name',
            buildDir: 'pacts',
            providers: [
                {
                    provider: 'first-provider-name',
                    files: [`tests/int/testCases/empty-interactions/**/*.ts`],
                },
                {
                    provider: 'second-provider-name',
                    files: [`tests/int/testCases/empty-interactions/**/*.ts`],
                },
            ],
        };

        expect(() => createPacts(pactsConfig)).toThrowError(
            'Pact interactions for provider: first-provider-name are empty.\nPact interactions for provider: second-provider-name are empty.',
        );
    });
});
