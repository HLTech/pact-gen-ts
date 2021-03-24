import {readPactsConfig} from "./read-pacts-config";

export function createPacts() {
    const pactsConfig = readPactsConfig();
    console.log(pactsConfig);
}
