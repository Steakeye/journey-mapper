import { Journey, JourneyConfig } from './Journey';

module jm.core {
    export interface JourneysConfig {
        journeys: JourneyConfig[]
    }

    export class Journeys {

        private static MSG_ERROR_BEGIN_NO_JOURNEYS: string = "Cannot begin journeys without any journeys!";

        constructor(private errorFunc: (aMessage: string | Error) => any) {
        }

        public build(aJourneysConfig: JourneysConfig): Promise<Journeys> {
            //Making this idempotent
            if (!this.journeys) {
                this.journeys = aJourneysConfig.journeys.map((aJourneyConf: JourneyConfig) => {
                    return new Journey(aJourneyConf)
                });
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

        private journeys: Journey[];

        private setupJourneyTraversal(): (aOnComplete : (aJourneys: Journeys) => void, aOnFail: (aError: any) => void) => void {

            return (aOnComplete : (aJourneys: Journeys) => void, aOnFail: (aError: any) => void) => {
                //TODO
            }
        }
        //private errorFunc: (aMessage: string | Error) => any;
    }
}

export = jm.core