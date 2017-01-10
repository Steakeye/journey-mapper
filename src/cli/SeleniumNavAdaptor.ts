///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
import * as SQuery from 'selenium-query';
//const SQuery = require('selenium-query');

module jm.cli {
    export class SeleniumNavAdaptor implements NavigatorAdaptor {
        constructor() {
            //SQuery.
        }

        public goTo(aUrl: string): Promise<SQuery> {
            let sqLoad:SQuery = SQuery.load(aUrl);

            //return Promise.resolve(sqLoad)
            return sqLoad;
        }

        private seleniumWrapper = SQuery;
    }
}

export default jm.cli.SeleniumNavAdaptor;
