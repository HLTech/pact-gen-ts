import {PactConfig, Provider, readPactsConfig} from "./read-pacts-config";
import * as fs from "fs";
import * as tsMorph from "ts-morph";
import {getAllFilesFromDirectory} from "../utils/systemFiles";
import {getInteractionFromTsNode, Interaction} from "./interactions";

export function createPacts() {
    const pactsConfig = readPactsConfig();
    if (!fs.existsSync((pactsConfig.buildDir))) {
        fs.mkdirSync(pactsConfig.buildDir);
    }

    pactsConfig.providers.forEach((provider) => createPactForProvider(provider, pactsConfig));
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
        }
    }
}

function createPactForProvider(provider: Provider, pactsConfig: PactConfig) {
    const pactDefinition: PactDefinition = {
        consumer: {name: pactsConfig.consumer},
        provider: {name: provider.provider},
        interactions: [],
        metadata: {pactSpecification: {version: '2.0.0'}},
    };

    pactDefinition.interactions = readInteractionsFromFiles(provider.apiPath, provider);

    const resultJSON = JSON.stringify(pactDefinition, null, 2);
    const resultFilePath = `${pactsConfig.buildDir}/${pactsConfig.consumer}-${provider.provider}.json`;
    fs.writeFileSync(resultFilePath, resultJSON);
}

function readInteractionsFromFiles(directoryPathWithApi: string, provider: Provider) {
    const interactions: Interaction[] = [];

    const typescriptProject = new tsMorph.Project();
    typescriptProject.addSourceFilesAtPaths('src/**/*.ts');
    for (const file of getAllFilesFromDirectory('./' + directoryPathWithApi)) {
        const sourceFile = typescriptProject.getSourceFileOrThrow(file);

        getInteractionFromTsNode(sourceFile, sourceFile, interactions, provider);
    }

    return interactions;
}
