///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
///<reference path="../../typings/index.d.ts" />
import * as SQuery from 'selenium-query';
import { WebDriver } from 'selenium-webdriver';
//const SQuery = require('selenium-query');

module jm.cli {
    export class SeleniumNavAdaptor implements NavigatorAdaptor {
        constructor() {
        }

        public goTo(aUrl: string): Promise<SQuery> {
            let query: SQuery = this.queryInstance,
                driver: WebDriver = this.webDriver;

            driver.get(aUrl).then(function () {
                //query.resolve(query);
            }, function (error) {
                if (error.code !== 100) {
                    query.reject(error);
                    return;
                }
                //driver = SQuery.build(config);
                driver.get(aUrl).then(function () {
                    //query.resolve(query);
                }, function (error) {
                    return query.reject(error);
                });
            });

            return query;
        }

        public get query():SQuery {
            return this.queryInstance;
        }

        public get queryStatic():SQStatic {
            return this.seleniumWrapper;
        }

        public getCurrentUrl(): Promise<string> {
            return this.webDriver.getCurrentUrl();
        }

        public takeScreenShot(): Promise<string> {
            return this.webDriver.takeScreenshot()
        }

        private seleniumWrapper:SQStatic = SQuery;
        private webDriver:WebDriver = SQuery.build();
        private queryInstance:SQuery = SQuery(this.webDriver);
    }
}


export default jm.cli.SeleniumNavAdaptor;
