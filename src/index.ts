import {createPacts} from "./core/create-pacts";

export function run(process: NodeJS.Process) {
    try {
        createPacts();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
