interface PactConfig {
    consumer: string;
    buildDir: string;
    providers: Provider[];
}

interface Provider {
    provider: string;
    apiPath: string;
}

const PACTS_CONFIG_FILE = '/pacts.config.js';

export const readPactsConfig = (): PactConfig => {
    const config = require(process.cwd() + PACTS_CONFIG_FILE);

    if (!(config?.consumer)) {
        throw new Error('The consumer name must be specified in the config file.');
    }

    return config;
}
