import {createPacts} from './core/create-pacts';
import {writeToFile} from './utils/write-to-file';
import {readPactsConfig} from './core/read-pacts-config';

export function run(process: NodeJS.Process) {
    try {
        const pactsConfig = readPactsConfig();

        const generatedPacts = createPacts(pactsConfig);

        generatedPacts.forEach(({pact, provider}) => {
            const resultFilePath = `${pactsConfig.buildDir}/${pactsConfig.consumer}-${provider}.json`;
            writeToFile(pactsConfig.buildDir, resultFilePath, pact);

            console.log('A pact file has been generated: ', resultFilePath);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
