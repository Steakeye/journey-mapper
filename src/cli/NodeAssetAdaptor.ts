///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
///<reference path="../../typings/index.d.ts" />

import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
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
        private static TEMP_SHARED_ASSET_PATH: string = NodeAssetAdaptor.TEMP_ASSET_PATH + '/assets';
        private static TEMP_SHARED_IMAGE_PATH: string = NodeAssetAdaptor.TEMP_SHARED_ASSET_PATH + '/img';
        private static TEMP_SCREEN_SHOTS_PATH: string = NodeAssetAdaptor.TEMP_SHARED_IMAGE_PATH + '/screenshots';
        private static FILE_PATH_FRAG_FOLDER: string = '/';
        private static FILENAME_FRAG_SUCCESS: string = 'success';
        private static FILENAME_FRAG_FAIL: string = 'fail';
        private static FILE_EXT_SCREEN_SHOT: string = 'png';

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

            //TODO: Make temp if doesn't exist; Clean up temp directory if need be

        }

        private screenShotFolderCreated:boolean = false;

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
            return Promise.reject(false);
        }


    }
}


export default jm.cli.NodeAssetAdaptor;
