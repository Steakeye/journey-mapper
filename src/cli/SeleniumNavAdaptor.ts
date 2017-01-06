///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
import * as SQuery from 'selenium-query';
//const SQuery = require('selenium-query');

module jm.cli {
    export class SeleniumNavAdaptor implements NavigatorAdaptor {
        constructor() {
            //SQuery.
        }

        public goTo(aUrl: string, aOnUrl: (aSuccess: boolean) => void): void {

        }
    }
}

export default jm.cli.SeleniumNavAdaptor;
