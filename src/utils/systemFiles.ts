import * as fs from "fs";
import path from "path";

export function* getAllFilesFromDirectory(directory: string): Generator<string> {
    const dirElements = fs.readdirSync(directory, {withFileTypes: true});
    for (const dirElement of dirElements) {
        const nameOfDirElement = path.join(directory, dirElement.name);
        if (dirElement.isDirectory()) {
            yield* getAllFilesFromDirectory(nameOfDirElement);
        } else {
            yield nameOfDirElement;
        }
    }
}
