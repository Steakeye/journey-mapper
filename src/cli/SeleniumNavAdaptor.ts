///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
///<reference path="../../typings/index.d.ts" />
import * as SQuery from 'selenium-query';
//import { WebDriver, Key as SWKeys } from 'selenium-webdriver';
import * as SW from 'selenium-webdriver';
import { Key } from 'selenium-webdriver';
//const SQuery = require('selenium-query');

module jm.cli {
    export type WebDriverBrowserOption_Chrome = "Chrome";
    export type WebDriverBrowserOption_Firefox = "Firefox";
    export type WebDriverBrowserOption = WebDriverBrowserOption_Chrome | WebDriverBrowserOption_Firefox;

    type KeyCode = string;

    const Key:Key = SW['Key'];

    export const WebDriverBrowserOption_Chrome_Val: WebDriverBrowserOption_Chrome = "Chrome";
    export const WebDriverBrowserOption_Firefox_Val: WebDriverBrowserOption_Firefox = "Firefox";

    export class SeleniumNavAdaptor implements NavigatorAdaptor {
        private static findKey(aKeyName): KeyCode { return Key[aKeyName]; }

        constructor() {
            this.initWebDriver();
            this.queryInstance = SQuery(this.webDriver);
        }

        public goTo(aUrl: string): Promise<SQuery> {
            let query: SQuery = this.queryInstance,
                driver: SW.WebDriver = this.webDriver;

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

        public sendKey(aQueryEl: SQuery, aKeyToSend: string): Promise<boolean> {
            return aQueryEl.sendKeys(SeleniumNavAdaptor.findKey(aKeyToSend)).then(
                (aQuery: SQuery) => { return true; },
                (aError: any) => { return false; }
                );
        }

        public getCurrentUrl(): Promise<string> {
            return this.webDriver.getCurrentUrl();
        }

        public getCurrentHTML(aQueryEl?: DeferredQuery): Promise<string> {
            return this.webDriver.getPageSource();
        }

        public takeScreenShot(): Promise<string> {
            return this.webDriver.takeScreenshot()
        }

        private seleniumWrapper:SQStatic = SQuery;
        private webDriver:SW.WebDriver;
        private queryInstance:SQuery;

        private initWebDriver(aBrowser:WebDriverBrowserOption = WebDriverBrowserOption_Chrome_Val): void {
            function makeFFConfig() {
                return {
                    name: WebDriverBrowserOption_Firefox_Val,
                    setBinaryPath: function (options: any) {
                        let fnName: string = "setBinary";
                        if (typeof options[fnName] !== "function") {
                            throw Error('Function to override setBinaryPath not found');
                        }

                        if (this.binaryPath) {
                            options[fnName](this.binaryPath);
                        }
                    },
                    setArguments: function (aOptions: any) {

                    },
                    setLogging: function (aOptions: any) {
                        aOptions.setLoggingPreferences({});
                    }
                };
            }

            this.webDriver = SQuery.build(aBrowser === WebDriverBrowserOption_Firefox_Val ? makeFFConfig(): undefined);
        }
    }
}


export default jm.cli.SeleniumNavAdaptor;
