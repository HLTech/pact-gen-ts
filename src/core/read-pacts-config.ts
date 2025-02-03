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

const PACTS_CONFIG_FILE = 'pacts.config.js';
const PACTS_CONFIG_FILE_CJS = 'pacts.config.cjs';

export const readPactsConfig = (): PactConfig => {
    const config = readPactsConfigFile();

    if (!config.consumer) {
        throw new Error('The consumer name must be specified in the config file.');
    }

    if (!config.buildDir) {
        config.buildDir = 'pacts';
    }

    return config;
};

const readPactsConfigFile = () => {
    const configFilenames = [PACTS_CONFIG_FILE, PACTS_CONFIG_FILE_CJS] as const;

    for (const configFilename in configFilenames) {
        const config = require(`${process.cwd()}/${configFilename}`);
        if (config) return config;
    }

    throw new Error(
        `The config file is not defined properly. Please make sure that the one of following config files exist: ${configFilenames.join(', ')}`,
    );
};
