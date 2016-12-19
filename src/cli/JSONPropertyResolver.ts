//import * as JSONRefs from 'json-refs';
var JSONRefs = require('json-refs');

module jm.cli {
    /*TODO:
    I want to hve an object that defines how to interact with a property
    If a property key is found, then the property type is checked
    If the type of the value is string then the json resolve will try to resolve the content as JSON and replace the string
    If the string does not resolve to an error then the JSON resolver quites and causes a fail event
    Otherwise, when an object is found or resolved, it's type is checked and it does not match the expected type, a fail event is thrown
    When the value matches the type then the children are checked for resolution unless a checkChildStrings flag is set to false
    All children of object types will be checked against resolution declarations

    maybe use something like:
     https://www.npmjs.com/package/tree-crawl

    * */

    export interface IJSONPropertyResolve {
        property: string;
        //type: { new(): any };
        checkChildStrings?: boolean;
    }

    export class JSONPropertyResolver {

        constructor(...aPropertiesToResolve: IJSONPropertyResolve[]) {
            this.createResoltionFunctions(aPropertiesToResolve);
        }

        public resolveProperties(aJSObject: Object): Promise<Object> {
            let promiseResolver:(aThen:() => void, aFail:() => void) => void = (aThen:() => void, aFail:() => void) => {
                    //TODO: Do stuff
                },
                resolutionPromise: Promise<Object> = new Promise(promiseResolver);
            //TODO!
            return resolutionPromise;
        }

        private resolutionFunctions: { [property: string]: (() => Promise<Object>) }

        private createResoltionFunctions(aPropertiesToResolve: IJSONPropertyResolve[]) {
            aPropertiesToResolve.map((aPropertyToResolve: IJSONPropertyResolve) => {
                return (aObj: Object) => {

                }
            });
        }
    }
}

export = jm.cli;
