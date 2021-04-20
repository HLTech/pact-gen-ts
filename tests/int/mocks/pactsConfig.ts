export const pactsConfigFactory = (testCase: string) => ({
    consumer: 'consumer-name',
    buildDir: 'pacts',
    providers: [
        {
            provider: 'provider-name',
            files: [`tests/int/testCases/${testCase}/**/*.ts`],
        },
    ],
});
