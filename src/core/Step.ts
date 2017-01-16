import { LinkTask } from './LinkTask'

module jm.core {

    type ScreenshotCue_onLoad = "on_load";
    type ScreenshotCue_onInteract = "on_interaction";
    type ScreenshotCue = ScreenshotCue_onLoad | ScreenshotCue_onInteract;

    interface ScreenshotCueDictionary {
        onLoad: ScreenshotCue_onLoad;
        onInteract: ScreenshotCue_onInteract;
    }

    export interface ScreenShotMap {
        on_load?: string;
        on_interact?: string;
    }

    export interface StepConfig extends ItemConfig {
        screenShots?: ScreenshotCue[];
        actions?:string;
        validator?:string;
    }

    export interface StepResolveCB {
        (aValue?: Step): void;
    }
    export interface StepRejectCB {
        (aError?: any): void;
    }

    export class Step extends LinkTask<Step> {
        private static MSG_INCORRECT_STATE: string = "Current state did not match expected state";
        private static MSG_INTERACTION_FAILED: string = "Interaction for this Step failed";
        private static MSG_INTERACTION_UNSUCCESSFUL: string = "Interaction for this Step occured but the outcome was unsuccessful";
        private static SCREENSHOT_CUES: ScreenshotCueDictionary  = {
            onLoad: "on_load",
            onInteract: "on_interaction"
        };

        constructor(aStep: StepConfig, private nav: NavigatorAdaptor, private errorHandler:BasicErrorHandler) {
            super(aStep);

            this.build(aStep);
        }

        public begin(aCurrentState: SQuery| JQuery) : Promise<Step> {
            return new Promise<Step>((aOnResolve : StepResolveCB, aOnReject: StepRejectCB) => {
                this.takeScreenShotIfCueExists(Step.SCREENSHOT_CUES.onLoad);

                this.isExpectedState(aCurrentState).then((aExpected: boolean) => {
                        let interaction: Promise<DeferredQuery>;

                        this.setValidation(true, true);

                        if (this.canInteract()) {
                            this.interact(aOnResolve, aOnReject);
                        } else {
                            this.finish(aOnResolve, aOnReject);
                            //aOnResolve(this);
                        }

                    },
                    (aErr: string) => {
                        this.setValidation(true, false);
                        this.errorHandler(Step.MSG_INCORRECT_STATE);
                        aOnReject(Step.MSG_INCORRECT_STATE)
                    });
            })
        }

        public getDTO(): StepDTO {
            let screenShots:ImageDTO[] = this.screenShots.slice();

            return {
                id: this.idVal,
                title: this.titleVal,
                description: this.descVal,
                complete: this.isComplete,
                succeeded: this.hasSuceeded,
                screenShots: screenShots
            }
        }

        private build(aStep: StepConfig): void {
            let path:string = aStep.actions;

            if (path) {
                this.interactor = require(path);
            }

            //Assign validator
            path = aStep.validator;
            this.validator = path ? require(path) : (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aNavigator: NavigatorAdaptor) => true;

            //Add screenshot cues
            this.screenShotCues = aStep.screenShots || [];
        }

        private isExpectedState(aCurrentState: SQuery| JQuery) : Promise<boolean> {
            return new Promise<boolean>((resolve : (value?: boolean) => void, reject: (error?: any) => void) => {
                let res = this.validator(this, aCurrentState, this.errorHandler);

                if (res !== undefined && !(res instanceof Promise)) {
                    if (res) {
                        resolve(res);
                    } else {
                        reject(res);
                    }
                } else {
                    (<Promise<boolean>>res).then(resolve, reject);
                }
            });
        }

        private canInteract(): boolean {
            return !!this.interactor;
        }

        private interact(aOnResolve : StepResolveCB, aOnReject: StepRejectCB) : void {
            this.interactor(this, this.nav.query, this.errorHandler).then((aInteractionSuccess: boolean) => {
                console.log('interact.then(): ' + aInteractionSuccess);
                this.takeScreenShotIfCueExists(Step.SCREENSHOT_CUES.onInteract);

                if (aInteractionSuccess) {
                    //aOnResolve(this);
                    this.finish(aOnResolve, aOnReject);
                } else {
                    aOnReject(Step.MSG_INTERACTION_UNSUCCESSFUL);
                }
            },
            (aErr: any) => {
                console.log('interact.reject(): ' + aErr);
                this.takeScreenShotIfCueExists(Step.SCREENSHOT_CUES.onInteract);
                aOnReject(Step.MSG_INTERACTION_FAILED)
            });
        }

        private takeScreenShotIfCueExists(aCueName: ScreenshotCue): void {
            //Check for screen-shot requirement
            if ((<ModernArray<ScreenshotCue>>this.screenShotCues).includes(aCueName)) {
                this.nav.takeScreenShot().then(this.makeScreenShotSaver(aCueName));
            }
        }

        private makeScreenShotSaver(aCueName: ScreenshotCue): (aData: string) => void {
            return (aData: string) => {
                this.screenShots.push({ name: aCueName, value: aData });
            }
        }

        private setValidation(aValidationAttempt:boolean, aPassed: boolean): void {
            this.hasBeenValidated = aValidationAttempt;
            this.isValid = aPassed;
        }

        private setCompletion(aSuccess: boolean): void {
            this.isComplete = true;
            this.hasSuceeded = aSuccess;
        }

        private finish(aOnResolve : StepResolveCB, aOnReject: StepRejectCB): void {
            let nextStep:Step = <Step>this.next;

            if (nextStep === null) {
                //TODO
                //We've completed all the step
                //Need to mark as complete
                aOnResolve(this);
            } else {
                nextStep.begin(this.nav.query).then(aOnResolve, aOnReject)
            }
        }

        private screenShotCues: ScreenshotCue[];

        private screenShots: ImageDTO[] = [];

        private interactor: (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aErrHandler: BasicErrorHandler) => Promise<boolean>;

        private validator?: (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aErrHandler: BasicErrorHandler) => boolean | Promise<boolean>;

        private hasBeenValidated: boolean = false;

        private isValid: boolean;
    }
}
export = jm.core;