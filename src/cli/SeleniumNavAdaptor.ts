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

        public get queryStatic():SQStatic {
            return this.seleniumWrapper;
        }

        public getCurrentUrl(): string {
            //this.nav.queryStatic.getDriver().WebDriver->getCurrentUrl()
            return "//this.nav.queryStatic.getDriver().WebDriver->getCurrentUrl()";
        }

        private seleniumWrapper:SQStatic = SQuery;
    }
}

export default jm.cli.SeleniumNavAdaptor;
