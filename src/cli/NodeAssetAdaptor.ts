///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
///<reference path="../../typings/index.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as cheerio from 'cheerio';
import * as scrape from 'website-scraper';
import { Journey } from '../core/Journey'
import {Cheerio} from "cheerio";
import {accessSync} from "fs";


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

    type NodeAssetAttribute = string;
    type NodeAssetSelector = { selector: string, attr?: NodeAssetAttribute };
    type NodeAssetStoreDefinition = { directory: string, extensions: string[] };

    const emptyString: string = '';

    class NodeAssetPathResovler {
        private static readonly SELECTOR_SET: NodeAssetSelector[] =  [
            { selector: 'style' },
            { selector: '[style]', attr: 'style' },
            { selector: 'img', attr: 'src' },
            { selector: 'img', attr: 'srcset' },
            { selector: 'input', attr: 'src' },
            { selector: 'object', attr: 'data' },
            { selector: 'embed', attr: 'src' },
            { selector: 'param[name="movie"]', attr: 'value' },
            { selector: 'script', attr: 'src' },
            { selector: 'link[rel="stylesheet"]', attr: 'href' },
            { selector: 'link[rel*="icon"]', attr: 'href' },
            { selector: 'svg *[xlink\\:href]', attr: 'xlink:href' },
            { selector: 'svg *[href]', attr: 'href' }
        ];
        private static readonly ASSET_STORE_DEFINTIONS: NodeAssetStoreDefinition[] = [
            { directory: 'images', extensions: ['.png', '.jpg', '.jpeg', '.gif'] },
            { directory: 'js', extensions: ['.js'] },
            { directory: 'css', extensions: ['.css'] },
            { directory: 'fonts', extensions: ['.ttf', '.woff', '.woff2', '.eot', '.svg'] }
        ];

        public static transformSource(aSource: string): [string, AssetMapping[]] {
            let cheerioDOM:cheerio.Static = cheerio.load(aSource),
                assetsToMutate: [Cheerio, NodeAssetAttribute][] = this.findElementsToMutate(cheerioDOM),
                assetMapping: AssetMapping[] = this.mutateElements(assetsToMutate);

            //TODO: We need to iterate over
            return [cheerioDOM.html(), assetMapping];
        }

        private static findElementsToMutate(aDOM: cheerio.Static): [Cheerio, NodeAssetAttribute][] {
            //let selectorsAndElement: [NodeAssetSelector, Cheerio][] =
             return NodeAssetPathResovler.SELECTOR_SET.map((aSelector: NodeAssetSelector): [Cheerio, NodeAssetAttribute] =>{
                return [aDOM(aSelector.selector), aSelector.attr];
            }).filter((aSelectorAndEl:[Cheerio, NodeAssetAttribute]) => !!aSelectorAndEl[0].length);

            //return selectorsAndElement;
        }

        private static mutateElements(aElementsAndAtributes: [Cheerio, NodeAssetAttribute][]): AssetMapping[]  {
            let changeList: (AssetMapping | AssetMapping[])[] = aElementsAndAtributes.map((aElAndAttr:[Cheerio, NodeAssetAttribute]):AssetMapping | AssetMapping[] => {
                let attr: NodeAssetAttribute = aElAndAttr[1],
                    el: Cheerio = aElAndAttr[0],
                    oldAndNewMapping: AssetMapping | AssetMapping[];

                if (attr) {
                    oldAndNewMapping = this.mutateAttributeValue(el, aElAndAttr[1])
                } else {
                    oldAndNewMapping = this.mutateElementContent(el)
                }

                return oldAndNewMapping;
            }),
                flatChangeList: AssetMapping[] = [];

            changeList.forEach((aAssetMappings: AssetMapping | AssetMapping[], aIdx: number) => {
                if (aAssetMappings && aAssetMappings.length) {
                    if (aAssetMappings.length === 2 &&
                        typeof aAssetMappings[0] === 'string'&&
                        typeof aAssetMappings[1] === 'string') {
                        flatChangeList.push(<AssetMapping>aAssetMappings);
                    } else {
                        //We now assume its a list of asset mappings
                        flatChangeList.push.apply(flatChangeList, aAssetMappings);
                        //changeList.splice.apply(changeList, (<[number, number, AssetMapping]>[aIdx, 1]).concat(<AssetMapping[]>aAssetMappings))
                    }
                }
            });

            return flatChangeList;
        }

        private static mutateAttributeValue(aEl: Cheerio, aAttrName: string): AssetMapping {
            let oldValue: AssetOriginalSource = aEl.attr(aAttrName),
                newValue: AssetReMappedSource,
                mapping:AssetMapping;

            if (oldValue) {
                newValue = this.getNewAttributeValue(oldValue);
                aEl.attr(aAttrName, newValue);
                mapping = [oldValue, newValue];
            }

            return mapping;
        }

        private static mutateElementContent(aEl: Cheerio): AssetMapping[] {
            let originalContent = aEl.html(),
                mapping: AssetMapping[] = [];

            //TODO: find all urls in a string and replace them

            return mapping;
        }

        private static getNewAttributeValue(aOldValue: string): string {
            //TODO: resolve url, get last part of path and make relative path for the local content
            return aOldValue;
        }
    }

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
                    if (aErr) {
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
            let transformedSource: string,
                sourceMappings: AssetMapping[];
            //TODO: We need to parse the source using cheerio and then return the parsed string
            //Parsing will mutate all resource string in the code to point to local assets
            [transformedSource, sourceMappings] = NodeAssetPathResovler.transformSource(aSource);

            return transformedSource;
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
