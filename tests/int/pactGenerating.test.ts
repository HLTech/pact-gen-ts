import {createPacts} from '../../src/core/create-pacts';
import {pactsConfigFactory} from './mocks/pactsConfig';

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
    ])('%s', (testCase) => {
        const pactsConfig = pactsConfigFactory(testCase);

        const generatedPacts = createPacts(pactsConfig);

        generatedPacts.forEach(({pact}) => {
            expect(JSON.parse(pact)).toMatchSnapshot();
        });
    });
});
