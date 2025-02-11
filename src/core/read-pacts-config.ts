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

const CONFIG_FILES = ['pacts.config.js', 'pacts.config.cjs'] as const;

export const readPactsConfig = async (): Promise<PactConfig> => {
    const config = await loadConfig();
    validateAndNormalizeConfig(config);
    return config;
};

const validateAndNormalizeConfig = (config: PactConfig): void => {
    if (!config.consumer) {
        throw new Error('The consumer name must be specified in the config file.');
    }
    config.buildDir ??= 'pacts';
};

const loadConfig = async (): Promise<PactConfig> => {
    const results = await Promise.allSettled(
        CONFIG_FILES.map((filename) => import(`${process.cwd()}/${filename}`).catch(() => require(`${process.cwd()}/${filename}`))),
    );

    const validConfig = results.find((result) => result.status === 'fulfilled');

    if (!validConfig) {
        throw new Error(`Config file not found. Please ensure one of these exists: ${CONFIG_FILES.join(', ')}`);
    }

    return (validConfig as PromiseFulfilledResult<PactConfig>).value;
};
