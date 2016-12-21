import { Journey, JourneyConfig } from './Journey';


module jm.core {
    interface JourneysConfig {
        journeys: JourneyConfig[]
    }

    export class Journeys {
        public buildJourneys(aJourneysConfig: JourneysConfig): Promise<Journeys> {
            //Making this idempotent
            if (!this.journeys) {
                this.journeys = aJourneysConfig.journeys.map((aJourneyConf: JourneyConfig) => {
                    return new Journey(aJourneyConf)
                });
            }

            return Promise.resolve(this);
        }

        private journeys: Journey[];
    }
}

export default jm.core.Journeys