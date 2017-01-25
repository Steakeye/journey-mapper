///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
///<reference path="../../typings/index.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as cheerio from 'cheerio';
import * as scrape from 'website-scraper';
import { Journey } from '../core/Journey'


module jm.cli {
    interface PathValuePair {
        path: string;
        value: any;
    }

    interface ScreenShotResolveCB {
        (aPath?: string): void;
    }
    interface ScreenShotRejectCB {
        (aError?: any): void;
    }

    type AssetOriginalSource = string;
    type AssetReMappedSource = string;
    type AssetMapping = [AssetOriginalSource, AssetReMappedSource];
    //const scraper:scrape = ws_scraper;

    const emptyString: string = '';

    export class NodeAssetAdaptor implements AssetAdaptor {
        public static saveScreenShots(aJourney: Journey): Promise<string[]> {
            let journeyData: JourneyDTO = aJourney.getDTO();
            let steps: StepDTO[] = journeyData.steps;
            let screenShotPathMappings: PathValuePair[] = this.resolveScreenShotPathMappings(journeyData);
            let deferredScreenShotSaves: Promise<string>[] = NodeAssetAdaptor.doScreenShotSaving(screenShotPathMappings);
            //TODO Promise.all on the list of promises
            return Promise.all(deferredScreenShotSaves);
        }

        private static TEMP_ASSET_PATH: string = process.cwd() + '/_temp';
        private static TEMP_CONTENT_PATH: string = NodeAssetAdaptor.TEMP_ASSET_PATH + '/html';
        private static TEMP_SHARED_ASSET_PATH: string = NodeAssetAdaptor.TEMP_ASSET_PATH + '/assets';
        private static TEMP_SHARED_IMAGE_PATH: string = NodeAssetAdaptor.TEMP_SHARED_ASSET_PATH + '/img';
        private static TEMP_SCREEN_SHOTS_PATH: string = NodeAssetAdaptor.TEMP_SHARED_IMAGE_PATH + '/screenshots';
        private static FILE_PATH_FRAG_FOLDER: string = '/';
        private static FILE_PATH_ANY_GLOB: string = '*';
        private static FILENAME_FRAG_SEPARATOR: string = '.';
        private static FILENAME_FRAG_SUCCESS: string = 'success';
        private static FILENAME_FRAG_FAIL: string = 'fail';
        private static FILENAME_FRAG_STATEFUL: string = 'stateful';
        private static FILE_EXT_SCREEN_SHOT: string = 'png';
        private static FILE_EXT_HTML: string = 'html';

        private static getResolvedPath(aJourney: JourneyDTO, aStep: StepDTO, aImage: ImageDTO): string {
            let successOrFailFragment: string = aStep.succeeded ? NodeAssetAdaptor.FILENAME_FRAG_SUCCESS : NodeAssetAdaptor.FILENAME_FRAG_FAIL;

            return [NodeAssetAdaptor.TEMP_SCREEN_SHOTS_PATH, NodeAssetAdaptor.FILE_PATH_FRAG_FOLDER, [aJourney.id, aStep.id, aImage.name, successOrFailFragment, NodeAssetAdaptor.FILE_EXT_SCREEN_SHOT].join('.')].join(emptyString);
        }

        private static resolveScreenShotPathMappings(aJourney: JourneyDTO): PathValuePair[] {
            let steps: StepDTO[] = aJourney.steps;

            return steps.map((aStep: StepDTO) => {
                return aStep.screenShots.map((aImage: ImageDTO) => {
                    return { path: this.getResolvedPath(aJourney, aStep, aImage), value: aImage.value }
                });
            }).reduce((aLeft: PathValuePair[], aRight: PathValuePair[]) => aLeft.concat(aRight));
        }

        private static doScreenShotSaving(aMappings: PathValuePair[]): Promise<string>[] {
            function makeScreenShotSaver(aMapping: PathValuePair): (aOnResolve: ScreenShotResolveCB, aOnReject: ScreenShotRejectCB) => void {
                return function screenShotSaver(aOnResolve: ScreenShotResolveCB, aOnReject: ScreenShotRejectCB) {
                    let pathToWriteTo: string = aMapping.path;

                    fs.writeFile(pathToWriteTo, aMapping.value, 'base64', function (aErr) {
                        if (aErr) {
                            aOnReject(aErr);
                        } else {
                            aOnResolve(pathToWriteTo);
                        }
                    });
                }
            }

            return aMappings.map((aMapping: PathValuePair) => new Promise<string>(makeScreenShotSaver(aMapping)));
        }

        constructor() {
            mkdirp.sync(NodeAssetAdaptor.TEMP_ASSET_PATH);
            rimraf(`${NodeAssetAdaptor.TEMP_ASSET_PATH}${NodeAssetAdaptor.FILE_PATH_FRAG_FOLDER}${NodeAssetAdaptor.FILE_PATH_ANY_GLOB}`, (error: Error) => undefined)
        }

        public saveScreenShots(aJourney: Journey): Promise<string[]> {
            if (!this.screenShotFolderCreated) {
                let screenShotPath: string = NodeAssetAdaptor.TEMP_SCREEN_SHOTS_PATH;
                let dirVal: string = mkdirp.sync(screenShotPath); //, NodeAssetAdaptor.FILE_PATH_FRAG_FOLDER)

                if (dirVal === screenShotPath) {
                    this.screenShotFolderCreated = true;
                }
            }

            return NodeAssetAdaptor.saveScreenShots(aJourney);
        }

        public saveCurrentAssets(aStep: StepDTO, aNav: NavigatorAdaptor): Promise<boolean> {
            //TODO - saveCurrentAssets
            let scrapeAction: Promise<boolean> = aNav.getCurrentUrl().then(
                (aUrl: string) => {
                    return scrape(this.makeScraperOptions(aStep, aUrl)).then(() => {
                        return true
                    });
                },
                (aError: string) => {
                    return Promise.resolve(false);
                });
            let saveSourceAction: Promise<boolean> = this.saveCurrentSource(aStep, aNav);

            return Promise.all([scrapeAction, saveSourceAction]).then((aResults: boolean[]) => {
                return aResults.every(aVal => aVal === true);
            },
                (aError: any) => {
                    return false;
                });
        }

        private screenShotFolderCreated:boolean = false;

        private saveCurrentSource(aStep: StepDTO, aNav: NavigatorAdaptor): Promise<boolean> {
            return aNav.getCurrentHTML().then((aSource: string) => {
                return this.writeHTMLSource(this.sanitizeSource(aSource), this.resolveSourceDestination(aStep))
            }, (aError: any) => {
                return false;
            });
            //return Promise.resolve(true);
        }

        private writeHTMLSource(aSource: string, aDestination: string): Promise<boolean> {
            function writeHTML(aResolve: PromiseResolveCB<boolean, boolean>, aReject: PromiseRejectCB<any>) {
                fs.writeFile(aDestination, aSource, 'utf8', (aErr: any) => {
                    if(aErr) {
                        aReject(aErr);
                    } else {
                        aResolve(true);
                    }
                });
            }

            return new Promise(writeHTML);
        }

        private resolveSourceDestination(aStep: StepDTO): string {
            //return path.resolve(NodeAssetAdaptor.TEMP_CONTENT_PATH, aStep.id + "_temp." + NodeAssetAdaptor.FILE_EXT_HTML)
            let fileName: string = [aStep.id, NodeAssetAdaptor.FILENAME_FRAG_STATEFUL, NodeAssetAdaptor.FILE_EXT_HTML].join(NodeAssetAdaptor.FILENAME_FRAG_SEPARATOR);
            let filePath: string = [NodeAssetAdaptor.TEMP_CONTENT_PATH, aStep.parentID, fileName].join(NodeAssetAdaptor.FILE_PATH_FRAG_FOLDER);
            return filePath;
        }

        private sanitizeSource(aSource: string): string {
            //TODO: We need to parse the source using cheerio and then return the parsed string
            //Parsing will mutate all resource string in the code to point to local assets
            return aSource;
        }

        private findMissingAssets(aAssetMapping:AssetMapping[]): string[] {
            //TODO: This needs to take a list or resources and check for any missing local files and return a list of files that need to be fetched to save locally
            return [];
        }

        private makeScraperOptions(aStep: StepDTO, aUrl: string): websiteScraper.Options  {
            return <websiteScraper.Options>{
                urls: [ { url: aUrl, filename: aStep.id }],
                directory: `${NodeAssetAdaptor.TEMP_CONTENT_PATH}${NodeAssetAdaptor.FILE_PATH_FRAG_FOLDER}${aStep.parentID}`
            }
        }

    }
}


export default jm.cli.NodeAssetAdaptor;
