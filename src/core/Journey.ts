///<reference path="../interfaces/core.d.ts" />

import { IJourney } from '../interfaces/IJourney';
import { LinkItem } from './LinkItem'
import { Step, StepConfig } from './Step'
import { applyPropertiesFromSourceToTarget } from '../core_utils/Obj'

module jm.core {
    export interface JourneyConfig extends Item {
        //[index: string]: any;
        id: string;
        title: string;
        description?: string;
        startURL: string;
        //archive: string;
        //thumbnails: string[];
        steps: StepConfig[];
        //modules: string[];
    }

    export class Journey extends LinkItem {
        private static STEPS_KEY: string = 'steps';

        private static MEMBERS_KEYS: string[] = ['startURL'];

        constructor(aJourney: JourneyConfig, private nav: NavigatorAdaptor) {
            super(aJourney);

            this.assignMembers(aJourney)

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
            this.nav.goTo(this.startURL)
        }

        /*private id: string;
        private title: string;
        private description: string;*/
        private startURL: string;
        private steps: Step[] = [];

        private assignMembers(aJourney: JourneyConfig): void {
            applyPropertiesFromSourceToTarget(Journey.MEMBERS_KEYS, aJourney, this);

            this.buildSteps(aJourney.steps)
        }

        private buildSteps(aStepsConfigs: StepConfig[]): void {
            aStepsConfigs.forEach((aStep: StepConfig) => {
                this.steps.push(new Step(aStep));
            });
        }
    }
}

export = jm.core;