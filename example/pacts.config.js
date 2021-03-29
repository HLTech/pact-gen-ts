module.exports = {
    consumer: 'frontend-app',
    buildDir: 'pacts',
    providers: [
        {
            provider: 'first-provider',
            apiPath: '/src/api/firstProvider',
            requestHeaders: {
                authorization: 'auth',
            },
            responseHeaders: {
                'Content-Type': 'application/json',
            },
        },
        {
            provider: 'second-provider',
            apiPath: '/src/api/secondProvider',
            responseHeaders: {
                'Content-Type': 'application/json',
            },
        }
    ]
};
