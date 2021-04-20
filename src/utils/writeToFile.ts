import fs from 'fs';

export const writeToFile = (directory: string, nameFile: string, content: string) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
    fs.writeFileSync(nameFile, content);
};
