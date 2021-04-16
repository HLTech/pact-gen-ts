module.exports = {
    consumer: 'frontend-app',
    buildDir: 'pacts',
    providers: [
        {
            provider: 'first-provider',
            files: ['src/api/firstProvider/*.ts'],
            requestHeaders: {
                authorization: 'auth',
            },
            responseHeaders: {
                'Content-Type': 'application/json',
            },
        },
        {
            provider: 'second-provider',
            files: ['src/api/secondProvider/*.ts'],
            responseHeaders: {
                'Content-Type': 'application/json',
            },
        },
    ],
};
