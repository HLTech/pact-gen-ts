import {createPacts} from './core/create-pacts';
import {writeToFile} from './utils/write-to-file';
import {readPactsConfig} from './core/read-pacts-config';

export async function run(process: NodeJS.Process) {
    try {
        const pactsConfig = await readPactsConfig();

        const generatedPacts = createPacts(pactsConfig);

        generatedPacts.forEach((pact) => {
            const resultFilePath = `${pactsConfig.buildDir}/${pactsConfig.consumer}-${pact.provider.name}.json`;
            writeToFile(pactsConfig.buildDir, resultFilePath, JSON.stringify(pact, null, 2));

            console.log('A pact file has been generated: ', resultFilePath);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
