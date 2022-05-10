import {PactConfig, ProviderConfig} from './read-pacts-config';
import * as tsMorph from 'ts-morph';
import {Interaction, InteractionCreator} from './interaction-creator';
import {glob} from 'glob';
import {printInteraction} from './print-interaction';

export function createPacts(pactsConfig: PactConfig) {
    const pactDefinitions = pactsConfig.providers.map((provider) => createPactDefinitionForProvider(provider, pactsConfig));

    const pactsWithEmptyInteractions = pactDefinitions.filter((pact) => pact.interactions.length === 0);

    if (pactsWithEmptyInteractions.length) {
        const errorMessage = pactsWithEmptyInteractions
            .map((pact) => `Pact interactions for provider: ${pact.provider?.name} are empty.`)
            .join('\n');
        throw new Error(errorMessage);
    }

    return pactDefinitions;
}

interface PactDefinition {
    consumer: {
        name: string;
    };
    provider: {
        name: string;
    };
    interactions: Interaction[];
    metadata: {
        pactSpecification: {
            version: string;
        };
    };
}

function createPactDefinitionForProvider(provider: ProviderConfig, pactsConfig: PactConfig) {
    const pactDefinition: PactDefinition = {
        consumer: {name: pactsConfig.consumer},
        provider: {name: provider.provider},
        interactions: [],
        metadata: {pactSpecification: {version: '2.0.0'}},
    };

    pactDefinition.interactions = readInteractionsFromFiles(provider.files, {...pactsConfig.commonConfigForProviders, ...provider});

    if (pactsConfig.verbose) {
        pactDefinition.interactions.forEach((interaction) => printInteraction(interaction));
    }

    return pactDefinition;
}

function readInteractionsFromFiles(filesWithApiFunctions: string[], provider: ProviderConfig) {
    const interactions: Interaction[] = [];

    const typescriptProject = new tsMorph.Project();
    typescriptProject.addSourceFilesAtPaths(filesWithApiFunctions);
    const files = glob.sync(filesWithApiFunctions.length > 1 ? `{${filesWithApiFunctions.join(',')}}` : filesWithApiFunctions[0]);
    for (const file of files) {
        const sourceFile = typescriptProject.getSourceFileOrThrow(file);

        interactions.push(...InteractionCreator.getAllInteractionsInFile(sourceFile, provider));
    }

    return interactions;
}
