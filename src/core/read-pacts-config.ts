export interface PactConfig {
    consumer: string;
    buildDir: string;
    providers: Provider[];
}

export interface Provider {
    provider: string;
    files: string[];
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
}

const PACTS_CONFIG_FILE = '/pacts.config.js';

export const readPactsConfig = (): PactConfig => {
    const config = require(process.cwd() + PACTS_CONFIG_FILE);

    if (!config) {
        throw new Error('The config file is not defined properly.');
    }

    if (!config.consumer) {
        throw new Error('The consumer name must be specified in the config file.');
    }

    if (!config.buildDir) {
        config.buildDir = 'pacts';
    }

    return config;
};
