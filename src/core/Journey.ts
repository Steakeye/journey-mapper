///<reference path="../interfaces/core.d.ts" />

import { LinkTask } from './LinkTask'
import { Step, StepConfig, StepResolveCB, StepRejectCB } from './Step'
import { applyPropertiesFromSourceToTarget } from '../core_utils/Obj'

module jm.core {
    export interface JourneyConfig extends ItemConfig {
        id: string;
        title: string;
        description?: string;
        startURL: string;
        steps: StepConfig[];
    }

    export class Journey extends LinkTask<Journey> implements Task {
        private static MSG_FAILED_TO_LOAD: string = "Failed to load:";

        private static MEMBERS_KEYS: string[] = ['startURL'];

        constructor(aJourney: JourneyConfig, private nav: NavigatorAdaptor, private saver: AssetAdaptor<Journey>, private errorFunc: BasicErrorHandler) {
            super(aJourney);

            this.build(aJourney)
        }

        public get complete(): boolean {
            return this.isComplete;
        }

        public get succeeded(): boolean {
            return this.hasSuceeded;
        }

        public begin(): void {
            let queryAsync: Promise<DeferredQuery> = this.nav.goTo(this.startURL),
                stepResolve: StepResolveCB = this.makeStepResolveHandler(),
                stepReject: StepRejectCB = this.makeStepResolveHandler();

            queryAsync.then((aQuery:DeferredQuery) => {
                this.currentStep.begin(aQuery).then(stepResolve, stepReject);
            }, (aErr: any) => {
                this.errorFunc(`${Journey.MSG_FAILED_TO_LOAD} ${this.startURL} - ${aErr}`)
            });

        }

        public getDTO(): JourneyDTO {
            return {
                id: this.idVal,
                title: this.titleVal,
                description: this.descVal,
                complete: this.isComplete,
                succeeded: this.hasSuceeded,
                steps: <StepDTO[]>this.steps.map((aStep: Step) => aStep.getDTO())
            }
        }

        private startURL: string;
        private steps: Step[] = [];
        private currentStep: Step;

        private build(aJourney: JourneyConfig): void {
            this.assignMembers(aJourney);
            this.buildSteps(aJourney.steps);

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

        private makeStepResolveHandler(): StepResolveCB {
            return (aValue: Step) => {
                let nextStep = <Step>aValue.next;

                if (nextStep === null) {
                    //TODO
                    //We've completed all the step
                    //Need to mark as complete
                    this.processScreenShotData()
                } else {
                    nextStep
                }
            }
        }

        private makeStepRejectHandler(): StepRejectCB {
            return (aError: any) => {
                //TODO!
            }
        }

        private processScreenShotData(): Promise<string[]> {
            return this.saver.saveScreenShots(this)
        }
    }
}

export = jm.core;