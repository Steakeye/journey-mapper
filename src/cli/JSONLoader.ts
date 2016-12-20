import * as fs from 'fs';
import ErrorHandler from './ErrorHandler';

module jm.cli {
    const JOURNEYS_LOAD_FAILED: string = "JSON failed to load. ";

    export function JSONLoader(aJsonPath: string) : Promise<Object> {
        let loader: Promise<Object> = new Promise((resolve : (value: Object) => void, reject: (error?: any) => void) => {
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


        return loader.catch<Object>(ErrorHandler.setupPromiseErrorHandler(JOURNEYS_LOAD_FAILED, {}));
    }
}

export default jm.cli.JSONLoader;
