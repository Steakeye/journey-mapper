///<reference path="../interfaces/core.d.ts" />

import { IJourney } from '../interfaces/IJourney';
import { Link } from './Link'
import { Step, StepConfig } from './Step'

module jm.core {
    export interface JourneyConfig {
        //[index: string]: any;
        id: string;
        title: string;
        description?: string;
        //archive: string;
        //thumbnails: string[];
        steps: StepConfig[];
        //modules: string[];
    }

    export class Journey extends Link {
        private static STEPS_KEY: string = 'steps';

        constructor(aJourney: JourneyConfig, private nav: NavigatorAdaptor) {
            super();

            for (let prop in aJourney) {
                let journeyProperty = aJourney[prop];

                if (prop === Journey.STEPS_KEY) {
                    for (let step in aJourney.steps) {
                        this.steps.push(new Step(<StepConfig>aJourney.steps[step]));
                    }

                } else {
                    this[prop] = journeyProperty;
                }
            }
        }

        public begin(): void {

        }

        private id: string;
        private title: string;
        private description: string;
        private steps: Step[];
        private : Step[];

        private assignMembers(): void {

        }

        private buildSteps(): void {

        }
    }
}

export = jm.core;