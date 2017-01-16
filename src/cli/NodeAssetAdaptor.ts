///<reference path="../interfaces/core.d.ts" />
///<reference path="../../custom/definitions/selenium-query.d.ts" />
///<reference path="../../typings/index.d.ts" />

import { Journey } from '../core/Journey'


module jm.cli {
    export class NodeAssetAdaptor implements AssetAdaptor<Journey> {
        private static TEMP_ASSET_PATH: string = process.cwd() + '/_temp';
        private static TEMP_SHARED_ASSET_PATH: string = NodeAssetAdaptor.TEMP_ASSET_PATH + '/assets';
        private static TEMP_SCREEN_SHOTS_PATH: string = NodeAssetAdaptor.TEMP_SHARED_ASSET_PATH + '/screenshots';

        constructor() {
        }

        public saveScreenShots(aJourney: Journey): Promise<void> {
            let journeyData: JourneyDTO = aJourney.getDTO();
            let steps: StepDTO[] = journeyData.steps;
            return Promise.resolve(undefined);
        }

    }
}


export default jm.cli.NodeAssetAdaptor;
