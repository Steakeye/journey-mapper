///<reference path="../interfaces/core.d.ts" />

import { Journey, JourneyConfig } from './Journey';

module jm.core {
    export interface JourneysConfig {
        id: string;
        title: string;
        journeys: JourneyConfig[],
        package?: boolean;
    }

    export class Journeys {

        private static MSG_ERROR_BEGIN_NO_JOURNEYS: string = "Cannot begin journeys without any journeys!";

        constructor(private errorFunc: BasicErrorHandler, private navigator: NavigatorAdaptor, private assetManager: AssetAdaptor<Journey>) {
        }

        public build(aJourneysConfig: JourneysConfig): Promise<Journeys> {
            //Making this idempotent
            if (!this.journeys) {
                this.journeys = aJourneysConfig.journeys.map((aJourneyConf: JourneyConfig) => {
                    return new Journey(aJourneyConf, this.navigator, this.assetManager, this.errorFunc)
                });

                //Link journeys
                this.currentJourney = <Journey>Journey.chain<Journey>(...this.journeys);

                this.id = aJourneysConfig.id;
                this.title = aJourneysConfig.title;
            }

            return Promise.resolve(this);
        }

        public begin(): Promise<Journeys> {
            if (!this.journeys) {
                this.errorFunc(Journeys.MSG_ERROR_BEGIN_NO_JOURNEYS);
            } else {
                return new Promise<Journeys>(this.setupJourneyTraversal());
            }
        }

        private id: string;
        private title: string;
        private journeys: Journey[];
        private currentJourney: Journey;

        private setupJourneyTraversal(): (aOnComplete : (aJourneys: Journeys) => void, aOnFail: (aError: any) => void) => void {
            this.currentJourney.begin();

            return (aOnComplete : (aJourneys: Journeys) => void, aOnFail: (aError: any) => void) => {
                //TODO
            }
        }
        //private errorFunc: (aMessage: string | Error) => any;
    }
}

export = jm.core