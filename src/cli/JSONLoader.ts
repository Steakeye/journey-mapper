import * as fs from 'fs';

module jm.cli {
    export function JSONLoader(aJsonPath: string) : Promise<Object> {
        return new Promise((resolve : (value: Object) => void, reject: (error?: any) => void) => {
            function handleJSON(aException: NodeJS.ErrnoException | null, aJSONData: string): void {
                if (aException) {
                    reject(aException)
                } else {
                    try {
                        resolve(JSON.parse(aJSONData))
                    } catch(aParseErr) {
                        reject(aParseErr)
                    }
                }
            }

            fs.readFile(aJsonPath, "utf8", handleJSON);
        });
    }
}

export default jm.cli.JSONLoader;
