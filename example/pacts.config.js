module.exports = {
    consumer: 'frontend-app',
    buildDir: 'pacts',
    providers: [
        {
            provider: 'first-provider',
            apiPath: '/src/api/firstProvider'
        },
        {
            provider: 'second-provider',
            apiPath: '/src/api/secondProvider'
        }
    ]
};
