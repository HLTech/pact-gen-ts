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
    ])('%s', (testCase) => {
        const pactsConfig = pactsConfigFactory(testCase);

        const generatedPacts = createPacts(pactsConfig);

        generatedPacts.forEach(({pact}) => {
            expect(JSON.parse(JSON.stringify(pact, null, 2))).toMatchSnapshot();
        });
    });

    test.each<IStringifyOptions['arrayFormat']>(['brackets', 'indices', 'comma', 'repeat'])(
        'handles "%s" array format for query params',
        (queryArrayFormat) => {
            const pactsConfig = {...pactsConfigFactory('query-array-format'), commonConfigForProviders: {queryArrayFormat}};

            const generatedPact = createPacts(pactsConfig)[0].pact;

            expect(JSON.parse(JSON.stringify(generatedPact, null, 2))).toMatchSnapshot();
        },
    );
});
