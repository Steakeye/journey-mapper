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

        constructor(aJourney: JourneyConfig, private nav: NavigatorAdaptor, private errorFunc: BasicErrorHandler) {
            super(aJourney);

            this.build(aJourney)
        }

        public begin(): void {
            let queryObj = this.nav.goTo(this.startURL);
            this.currentStep.begin(queryObj);
        }

        /*private id: string;
        private title: string;
        private description: string;*/
        private startURL: string;
        private steps: Step[] = [];
        private currentStep: Step;

        private build(aJourney: JourneyConfig): void {
            this.assignMembers(aJourney);
            this.buildSteps(aJourney.steps)

            //Link steps
            this.currentStep = <Step>Step.chain(...this.steps);
        }

        private assignMembers(aJourney: JourneyConfig): void {
            applyPropertiesFromSourceToTarget(Journey.MEMBERS_KEYS, aJourney, this);
        }

        private buildSteps(aStepsConfigs: StepConfig[]): void {
            aStepsConfigs.forEach((aStep: StepConfig) => {
                this.steps.push(new Step(aStep, this.nav, this.errorFunc));
            });
        }
    }
}

export = jm.core;