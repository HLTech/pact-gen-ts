import {PactConfig, Provider, readPactsConfig} from './read-pacts-config';
import * as tsMorph from 'ts-morph';
import {getInteractionFromTsNode, Interaction} from './interactions';
import {glob} from 'glob';
import {printInteraction} from './printInteraction';

export function createPacts(pactsConfig: PactConfig) {
    return pactsConfig.providers.map((provider) => ({pact: createPactForProvider(provider, pactsConfig), provider: provider.provider}));
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

function createPactForProvider(provider: Provider, pactsConfig: PactConfig) {
    const pactDefinition: PactDefinition = {
        consumer: {name: pactsConfig.consumer},
        provider: {name: provider.provider},
        interactions: [],
        metadata: {pactSpecification: {version: '2.0.0'}},
    };

    pactDefinition.interactions = readInteractionsFromFiles(provider.files, provider);

    if (pactsConfig.verbose) {
        pactDefinition.interactions.forEach((interaction) => printInteraction(interaction));
    }

    return JSON.stringify(pactDefinition, null, 2);
}

function readInteractionsFromFiles(filesWithApiFunctions: string[], provider: Provider) {
    const interactions: Interaction[] = [];

    const typescriptProject = new tsMorph.Project();
    typescriptProject.addSourceFilesAtPaths(filesWithApiFunctions);
    const files = glob.sync(filesWithApiFunctions.length > 1 ? `{${filesWithApiFunctions.join(',')}}` : filesWithApiFunctions[0]);
    for (const file of files) {
        const sourceFile = typescriptProject.getSourceFileOrThrow(file);

        getInteractionFromTsNode(sourceFile, sourceFile, interactions, provider);
    }

    return interactions;
}
