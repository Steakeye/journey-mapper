///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
///<reference path="../../custom/definitions/get-urls/get-urls.d.ts" />
///<reference path="../../typings/index.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as getUrls from 'get-urls';
import * as prettifier from 'js-beautify';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as cheerio from 'cheerio';
import * as scrape from 'website-scraper';
import { Journey } from '../core/Journey'
import {Cheerio} from "cheerio";
import {ParsedPath} from "path";


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
    const FILE_PATH_FRAG_FOLDER: string = '/';

    class NodeAssetPathResovler {
        private static KEY_ATTR_STYLE: string = 'style';
        private static NAME_TAG_SCRIPT: string = 'script';

        private static readonly SELECTOR_SET: NodeAssetSelector[] =  [
            { selector: NodeAssetPathResovler.KEY_ATTR_STYLE },
            { selector: `[${NodeAssetPathResovler.KEY_ATTR_STYLE}]`, attr: NodeAssetPathResovler.KEY_ATTR_STYLE },
            { selector: 'img[src]', attr: 'src' },
            { selector: 'img[srcset]', attr: 'srcset' },
            { selector: 'input[src]', attr: 'src' },
            { selector: 'object[data]', attr: 'data' },
            { selector: 'embed[src]', attr: 'src' },
            { selector: 'param[name="movie"]', attr: 'value' },
            { selector: `${NodeAssetPathResovler.NAME_TAG_SCRIPT}[src]`, attr: 'src' },
            { selector: `${NodeAssetPathResovler.NAME_TAG_SCRIPT}:not([src])` },
            { selector: 'link[rel="stylesheet"][href]', attr: 'href' },
            { selector: 'link[rel*="icon"][href]', attr: 'href' },
            { selector: 'svg *[xlink\\:href]', attr: 'xlink:href' },
            { selector: 'svg *[href]', attr: 'href' }
        ];
        private static readonly ASSET_STORE_DEFINITIONS: NodeAssetStoreDefinition[] = [
            { directory: 'images', extensions: ['.png', '.jpg', '.jpeg', '.gif'] },
            { directory: 'js', extensions: ['.js'] },
            { directory: 'css', extensions: ['.css'] },
            { directory: 'fonts', extensions: ['.ttf', '.woff', '.woff2', '.eot', '.svg'] }
        ];

        public static transformSource(aSource: string): [string, AssetMapping[]] {
            let cheerioDOM:cheerio.Static = cheerio.load(aSource),
                assetsToMutate: [Cheerio, NodeAssetAttribute][] = this.findElementsToMutate(cheerioDOM),
                assetMapping: AssetMapping[] = this.mutateElements(assetsToMutate, cheerioDOM);

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

        private static prettifyJS(aInnerHTML: string): string  {
            return prettifier(aInnerHTML);
        }

        private static prettifyCSS(aInnerHTML: string): string  {
            return prettifier.css(aInnerHTML);
        }

        private static tweakCSSURL(aURL: AssetOriginalSource): AssetOriginalSource {
            let tweakedURL:AssetOriginalSource,
                //urlSize: number = aURL.length,
                lastPos: number;

            function findTrimPosition(aPath: string): number {
                let bracketChar: string = ')',
                    colonChar: string = ';',
                    //bracketColon: string = `${bracketChar}${colonChar}`,
                    urlSize: number = aPath.length,
                    lastChar: string,
                    trimAmount: number,
                    trimPos: number;

                if(urlSize) {
                    lastChar = aPath[urlSize - 1];

                    switch (lastChar) {
                        case bracketChar: {
                            trimAmount = 1;
                            break;
                            }
                        case colonChar: {
                            trimAmount = 2;
                            break;
                        }
                    }

                    trimPos = trimAmount ? urlSize - trimAmount: undefined;
                }

                return trimPos;
            }

            if ((lastPos = findTrimPosition(aURL))) {
                tweakedURL = aURL.substr(0, lastPos);
            } else {
                tweakedURL = aURL;
            }

            return tweakedURL;
        }

        private static getContentPreModifier(aElements: Cheerio): (aInnerHTML: string) => string  {
            let tagName: string = aElements.get(0).tagName,
                modifier:(aInnerHTML: string) => string;

            switch (tagName) {
                case this.KEY_ATTR_STYLE: {
                    modifier = this.prettifyCSS;
                    break;
                }
                case this.NAME_TAG_SCRIPT: {
                    modifier = this.prettifyJS;
                    break;
                }
                default:
            }

            return modifier;
        }

        private static getContentFragmentPostModifier(aElements: Cheerio): (aInnerHTML: string) => string  {
            let tagName: string = aElements.get(0).tagName,
                modifier:(aInnerHTML: string) => string;

            switch (tagName) {
                case this.KEY_ATTR_STYLE: {
                    modifier = this.tweakCSSURL;
                    break;
                }
                /*case this.NAME_TAG_SCRIPT: {
                    modifier = this.prettifyJS;
                    break;
                }*/
                default:
            }

            return modifier;
        }

        private static mutateElements(aElementsAndAtributes: [Cheerio, NodeAssetAttribute][], aDOM: cheerio.Static): AssetMapping[]  {
            let changeList: (AssetMapping | AssetMapping[])[] = aElementsAndAtributes.map((aElAndAttr:[Cheerio, NodeAssetAttribute]):AssetMapping | AssetMapping[] => {
                let attr: NodeAssetAttribute = aElAndAttr[1],
                    elements: Cheerio = aElAndAttr[0], //This is a collection!
                    oldAndNewMapping: AssetMapping | AssetMapping[],
                    modifier:(aInnerHTML: string) => string;

                if (!attr || attr === this.KEY_ATTR_STYLE) {
                    modifier = this.getContentPreModifier(elements);
                    oldAndNewMapping = this.mutateElementsContents(elements, aDOM, modifier, this.getContentFragmentPostModifier(elements))
                } else {
                    oldAndNewMapping = this.mutateElementAttributeValues(elements, aElAndAttr[1], aDOM)
                }

                return oldAndNewMapping;
            }),
                flatChangeList: AssetMapping[] = [],
                originalSourceList: AssetReMappedSource[] = [];

            changeList.forEach((aAssetMappings: AssetMapping | AssetMapping[], aIdx: number) => {
                if (aAssetMappings && aAssetMappings.length) {
                    if (aAssetMappings.length === 2 &&
                        typeof aAssetMappings[0] === 'string' &&
                        typeof aAssetMappings[1] === 'string') {
                        flatChangeList.push(<AssetMapping>aAssetMappings);
                    } else {
                        //We now assume its a list of asset mappings
                        flatChangeList.push.apply(flatChangeList, aAssetMappings);
                        //changeList.splice.apply(changeList, (<[number, number, AssetMapping]>[aIdx, 1]).concat(<AssetMapping[]>aAssetMappings))
                    }
                }
            });

            //Make changelist free from duplicates
            flatChangeList = flatChangeList.filter((aAssetMapping: AssetMapping) => {
                let origin: AssetOriginalSource = aAssetMapping[0],
                    isUnique: boolean = false;

                if (!(<ModernArray<AssetOriginalSource>>originalSourceList).includes(origin)) {
                    originalSourceList.push(origin);
                    isUnique = true;
                }
                return isUnique;
            });

            return flatChangeList;
        }

        private static mutateElementAttributeValues(aElements: Cheerio, aAttrName: string, aDOM: cheerio.Static): AssetMapping[] {
            let mappings:AssetMapping[] = [];

            aElements.each((aIdx: number, aEl: cheerio.Element) => {
                mappings.push(this.mutateAttributeValue(aDOM(aEl), aAttrName));
            });

            return mappings;
        }

        private static mutateAttributeValue(aDomEl: Cheerio, aAttrName: string): AssetMapping {
            let oldValue: AssetOriginalSource = aDomEl.attr(aAttrName),
                localizedValue: AssetReMappedSource,
                mapping:AssetMapping;

            if (oldValue) {
                localizedValue = this.getLocalizedValue(oldValue);
                aDomEl.attr(aAttrName, localizedValue);
                mapping = [oldValue, localizedValue];
            }

            return mapping;
        }

        private static mutateContent(aDomEl: Cheerio, aPreModifier?: (aUrl: string) => string, aPostModifier?: (aUrl: string) => string): AssetMapping[] {
            let mappings:AssetMapping[],
                originalInnerHTML: string = ((aInnerContent:string) => aPreModifier ? aPreModifier(aInnerContent): aInnerContent)(aDomEl.html()),
                localizedInnerHTML: string = originalInnerHTML,
                urlsToReplace: Set<AssetOriginalSource> = getUrls(localizedInnerHTML);

            mappings = (<ModernArrayConstructor>Array).from(urlsToReplace).map((aUrl: string): AssetMapping => {
                let originalValue: AssetOriginalSource = aPostModifier ? aPostModifier(aUrl): aUrl,
                    localizedValue: AssetReMappedSource = this.getLocalizedValue(originalValue);

                localizedInnerHTML = localizedInnerHTML.replace(originalValue, localizedValue);

                return [originalValue, localizedValue];
            });

            if (localizedInnerHTML !== originalInnerHTML) {
                aDomEl.html(localizedInnerHTML);
            }

            return mappings;
        }

        private static mutateElementsContents(aElements: Cheerio, aDOM: cheerio.Static, aPreModifier?: (aUrl: string) => string, aPostModifier?: (aUrl: string) => string): AssetMapping[] {
            let mappings: AssetMapping[] = [];

            aElements.each((aIdx: number, aEl: cheerio.Element) => {
                mappings.push.apply(this.mutateContent(aDOM(aEl), aPreModifier, aPostModifier));
            });

            return mappings;
        }

        private static getLocalizedValue(aOldValue: AssetOriginalSource): AssetReMappedSource {
            let pathInfo: ParsedPath = path.parse(aOldValue),
                //urlInfo: url.Url = url.parse(aOldValue),
                //assetFolderPath: string,
                storeDefintion: NodeAssetStoreDefinition;

            function getAssetFolderPath(aAssetExtention: string): string {
                let folderPath: string = '';

                if (aAssetExtention) {
                    storeDefintion = (<ModernArray<NodeAssetStoreDefinition>>NodeAssetPathResovler.ASSET_STORE_DEFINITIONS).find((aStoreDef: NodeAssetStoreDefinition) => {
                        return (<ModernArray<string>>aStoreDef.extensions).includes(aAssetExtention);
                    });

                    if(storeDefintion) {
                        folderPath = `${FILE_PATH_FRAG_FOLDER}${storeDefintion.directory}${FILE_PATH_FRAG_FOLDER}`;
                    }
                }

                return folderPath;
            }
            //TODO: resolve url, get last part of path and make relative path for the local content
            //return aOldValue + '_new';
            return `${getAssetFolderPath(pathInfo.ext)}${pathInfo.base}`;
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
