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


    export type JourneyResolveCB = PromiseResolveCB<Journey, void>;
    export type JourneyRejectCB = PromiseRejectCB<any>;

    export class Journey extends LinkTask<Journey> {
        private static MSG_FAILED_TO_LOAD: string = "Failed to load:";
        private static MSG_STEP_PROMISE_EARLY_RESOLUTION: string = 'The Step promise appears to have resolved early, while it still has a next Step';

        private static MEMBERS_KEYS: string[] = ['startURL'];

        constructor(aJourney: JourneyConfig, private nav: NavigatorAdaptor, private saver: AssetAdaptor, private errorFunc: BasicErrorHandler) {
            super(aJourney);

            this.build(aJourney)
        }

        public get complete(): boolean {
            return this.isComplete;
        }

        public get succeeded(): boolean {
            return this.hasSuceeded;
        }

        public begin(): Promise<Journey> {
            super.begin();

            return new Promise<Journey>((aOnResolve : JourneyResolveCB, aOnReject: JourneyRejectCB) => {
                let queryAsync: Promise<DeferredQuery> = this.nav.goTo(this.startURL),
                    stepResolve: StepResolveCB = this.makeStepResolveHandler(aOnResolve, aOnReject),
                    stepReject: StepRejectCB = this.makeStepRejectHandler(aOnReject);

                queryAsync.then((aQuery: DeferredQuery) => {
                    this.currentStep.begin(aQuery).then(stepResolve, stepReject);
                }, (aErr: any) => {
                    this.errorFunc(`${Journey.MSG_FAILED_TO_LOAD} ${this.startURL} - ${aErr}`)
                });
            });
        }

        public getDTO(): JourneyDTO {
            return {
                id: this.idVal,
                title: this.titleVal,
                description: this.descVal,
                started: this.hasStarted,
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
                this.steps.push(new Step(aStep, this.idVal, this.nav, this.saver, this.errorFunc));
            });
        }

        private makeStepResolveHandler(aOnResolve : JourneyResolveCB, aOnReject: JourneyRejectCB): StepResolveCB {
            return (aValue: Step) => {
                let nextStep = <Step>aValue.next;

                if (nextStep === null) {
                    this.processScreenShotData().then((aPathsSaved: string[]) => {
                        console.log('we saved some screenshots');
                        this.finish(aOnResolve, aOnReject);
                    },
                    (aError: any) => {
                        console.log('There was an error saving screenshots: ', aError);
                        this.finish(aOnResolve, aOnReject);
                    }
                    );
                } else {
                    this.setCompletion(false);
                    //If the step isn't the last one then something went wrong,
                    //we should probably interrogate the instance and report a failed journey
                    aOnReject(`${Journey.MSG_STEP_PROMISE_EARLY_RESOLUTION}: ${this.id} - ${aValue.id} -> ${nextStep.id}`);
                }
            }
        }

        private finish(aOnResolve : JourneyResolveCB, aOnReject: JourneyRejectCB): void {
            let nextStep:Journey = <Journey>this.next;

            this.setCompletion(true);

            if (nextStep === null) {
                //TODO
                //We've completed all the step
                //Need to mark as complete
                aOnResolve(this);
            } else {
                nextStep.begin().then(aOnResolve, aOnReject)
            }
        }

        private makeStepRejectHandler(aOnReject: JourneyRejectCB): StepRejectCB {
            return (aError: any) => {
                aOnReject(aError); //TODO: Add context here? Journey id?
            }
        }

        private processScreenShotData(): Promise<string[]> {
            return this.saver.saveScreenShots(this)
        }
    }
}

export = jm.core;