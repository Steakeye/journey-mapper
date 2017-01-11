///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
///<reference path="../../typings/index.d.ts" />
import * as SQuery from 'selenium-query';
import { WebDriver } from 'selenium-webdriver';
//const SQuery = require('selenium-query');

module jm.cli {
    export class SeleniumNavAdaptor implements NavigatorAdaptor {
        constructor() {
            //SQuery.
            this.webDriver = SQuery.build();
            this.query = SQuery(this.webDriver);
            //this.queryInstance = new SQuery(this.webDriver);
        }

        public goTo(aUrl: string): Promise<SQuery> {
            let query: SQuery = this.query,
                driver: WebDriver = this.webDriver;
            //let sqLoad:SQuery = SQuery.load(aUrl);

            //return Promise.resolve(sqLoad)
            this.webDriver.get(aUrl).then(function () {
                query.add(driver);
                query.resolve(query);
            }, function (error) {
                if (error.code !== 100) {
                    query.reject(error);
                    return;
                }
                //driver = SQuery.build(config);
                driver.get(aUrl).then(function () {
                    query.add(driver);
                    query.resolve(query);
                }, function (error) {
                    return query.reject(error);
                });
            });

            return query;
        }

        public get queryStatic():SQStatic {
            return this.seleniumWrapper;
        }

        public getCurrentUrl(): Promise<string> {
            //this.nav.queryStatic.getDriver().WebDriver->getCurrentUrl()
            return this.webDriver.getCurrentUrl();
            //return "//this.nav.queryStatic.getDriver().WebDriver->getCurrentUrl()";
        }

        private seleniumWrapper:SQStatic = SQuery;
        private query:SQuery = null;
        private queryInstance:SQuery = null;
        private webDriver:WebDriver = null;
    }
}

export default jm.cli.SeleniumNavAdaptor;
