import {IStringifyOptions} from 'qs';

export interface PactConfig {
    consumer: string;
    buildDir: string;
    providers: ProviderConfig[];
    verbose?: boolean;
    queryArrayFormat?: IStringifyOptions['arrayFormat'];
    commonConfigForProviders?: CommonProviderConfig;
}

interface CommonProviderConfig {
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    queryArrayFormat?: IStringifyOptions['arrayFormat'];
}

export interface ProviderConfig extends CommonProviderConfig {
    provider: string;
    files: string[];
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
