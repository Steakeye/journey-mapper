///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
///<reference path="../../typings/index.d.ts" />

import { Journey } from '../core/Journey'


module jm.cli {
    interface PathValuePair {
        path: string;
        value: any;
    }

    export class NodeAssetAdaptor implements AssetAdaptor<Journey> {
        private static TEMP_ASSET_PATH: string = process.cwd() + '/_temp';
        private static TEMP_SHARED_ASSET_PATH: string = NodeAssetAdaptor.TEMP_ASSET_PATH + '/assets';
        private static TEMP_SHARED_IMAGE_PATH: string = NodeAssetAdaptor.TEMP_SHARED_ASSET_PATH + '/img';
        private static TEMP_SCREEN_SHOTS_PATH: string = NodeAssetAdaptor.TEMP_SHARED_IMAGE_PATH + '/screenshots';
        private static FILENAME_FRAG_SUCCESS: string = 'success';
        private static FILENAME_FRAG_FAIL: string = 'fail';
        private static FILE_EXT_SCREEN_SHOT: string = 'png';

        constructor() {

            //TODO: Make temp if doesn't exist; Clean up temp directory if need be

        }

        public saveScreenShots(aJourney: Journey): Promise<string[]> {
            let journeyData: JourneyDTO = aJourney.getDTO();
            let steps: StepDTO[] = journeyData.steps;
            let screenShotPathMappings: PathValuePair[] = this.resolveScreenshotPathMappings(journeyData);
            return Promise.resolve([]);
        }

        private resolveScreenshotPathMappings(aJourney: JourneyDTO): PathValuePair[] {
            let pathMappings: PathValuePair[],
                steps: StepDTO[] = aJourney.steps;

            pathMappings = steps.map((aStep: StepDTO) => {
                //return aStep.map({ path: "", value: aStep}
                return aStep.screenShots.map((aImage: ImageDTO) => {
                    return { path: this.getresolvedPath(aJourney, aStep, aImage), value: aImage.value }
                });
            }).reduce((aLeft: PathValuePair[], aRight: PathValuePair[]) => aLeft.concat(aRight));

            return pathMappings;
        }

        private getresolvedPath(aJourney: JourneyDTO, aStep: StepDTO, aImage: ImageDTO): string {
            let successOrFailFragment: string = aStep.succeeded ? NodeAssetAdaptor.FILENAME_FRAG_SUCCESS: NodeAssetAdaptor.FILENAME_FRAG_FAIL;

            return [aJourney.id, aStep.id, aImage.name, successOrFailFragment, NodeAssetAdaptor.FILE_EXT_SCREEN_SHOT].join('.')
        }
    }
}


export default jm.cli.NodeAssetAdaptor;
