import { LinkTask } from './LinkTask'
import { applyPropertiesFromSourceToTarget } from '../core_utils/Obj'

module jm.core {

    type ScreenshotCue_onLoad = "on_load";
    type ScreenshotCue_onInteract = "on_interact";
    type ScreenshotCue = ScreenshotCue_onLoad | ScreenshotCue_onInteract;

    type ImportedMemberKey_Validator = 'validator';
    type ImportedMemberKey_Interactor = 'interactor';
    type ImportedMemberKey = ImportedMemberKey_Validator | ImportedMemberKey_Interactor;

    type NoSave = false;

    interface ScreenshotCueDictionary {
        onLoad: ScreenshotCue_onLoad;
        onInteract: ScreenshotCue_onInteract;
    }

    export interface ScreenShotMap {
        on_load?: string;
        on_interact?: string;
    }

    export interface StepConfig extends ItemConfig {
        saveContent?: boolean;
        screenShots?: ScreenshotCue[];
        actions?:string;
        validator?:string;
    }

    export type StepResolveCB = PromiseResolveCB<Step, void>;
    export type StepRejectCB = PromiseRejectCB<any>;

    export class Step extends LinkTask<Step> {
        private static KEY_VALIDATOR: ImportedMemberKey_Validator = 'validator';
        private static KEY_INTERACTOR: ImportedMemberKey_Interactor = 'interactor';
        private static MSG_MEMBER_NOT_RESOLVED: string = "Imported Step method could not be resolved";
        private static MSG_ASSET_SAVE_FAILED: string = "Assets for this step were unable to be saved";
        private static MSG_INCORRECT_STATE: string = "Current state did not match expected state";
        private static MSG_INTERACTION_FAILED: string = "Interaction for this Step failed";
        private static MSG_INTERACTION_UNSUCCESSFUL: string = "Interaction for this Step occured but the outcome was unsuccessful";

        private static MEMBERS_KEYS: string[] = ['saveContent'];

        private static SCREENSHOT_CUES: ScreenshotCueDictionary  = {
            onLoad: "on_load",
            onInteract: "on_interact"
        };

        constructor(aStep: StepConfig, private parentIDVal: string, private nav: NavigatorAdaptor, private saver: AssetAdaptor, private errorHandler:BasicErrorHandler) {
            super(aStep);

            this.build(aStep);
        }

        public begin(aCurrentState: SQuery| JQuery) : Promise<Step> {
            super.begin();
            return new Promise<Step>((aOnResolve : StepResolveCB, aOnReject: StepRejectCB) => {
                let assetSave: boolean | Promise<boolean>;
                this.takeScreenShotIfCueExists(Step.SCREENSHOT_CUES.onLoad);

                assetSave = this.saveAssetsIfRequired();

                if (!assetSave) {
                    this.checkStateAndContinue(aCurrentState, aOnResolve, aOnReject);
                } else {
                    this.deferStateCheckAfterAssetSave(assetSave, aCurrentState, aOnResolve, aOnReject);
                }

                this.isExpectedState(aCurrentState).then((aExpected: boolean) => {
                        this.interactOrFinish(aOnResolve, aOnReject);
                    },
                    (aErr: string) => {
                        this.setValidation(true, false);
                        this.setCompletion(false);
                        //TODO: We should allow the journey to end early depending on a flag instead of exiting the whole process
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
                parentID: this.parentIDVal,
                started: this.hasStarted,
                complete: this.isComplete,
                succeeded: this.hasSuceeded,
                screenShots: screenShots
            }
        }

        private build(aStep: StepConfig): void {
            applyPropertiesFromSourceToTarget(Step.MEMBERS_KEYS, aStep, this);

            let validatorPath:string = aStep.validator;

            if (validatorPath) {
                this.tryToAssignImportedMember(Step.KEY_VALIDATOR, validatorPath);
            } else {
                this[Step.KEY_VALIDATOR] = (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aErrHandler: BasicErrorHandler) => true;
            }

            this.tryToAssignImportedMember(Step.KEY_INTERACTOR, aStep.actions);

            //Add screenshot cues
            this.screenShotCues = aStep.screenShots || [];
        }

        private tryToAssignImportedMember(aMember: ImportedMemberKey, aPathToResolve: string): void {
            if (aPathToResolve) {
                try {
                    this[aMember] = require(aPathToResolve);
                } catch (aErr) {
                    this.errorHandler(`${Step.MSG_MEMBER_NOT_RESOLVED}: ${aMember} - ${aErr}`);
                }
            }
        }

        private deferStateCheckAfterAssetSave(assetSave: Promise<boolean>, aCurrentState: DeferredQuery, aOnResolve: StepResolveCB, aOnReject: StepRejectCB): void {
            const unknownsAssetErrorMessage: string = `${Step.MSG_ASSET_SAVE_FAILED}: ${this.id}`;

            assetSave.then((aSaved:boolean) => {
                if (aSaved) {
                    this.checkStateAndContinue(aCurrentState, aOnResolve, aOnReject);
                } else {
                    aOnReject(unknownsAssetErrorMessage);
                }
            }, (aError: any) => {
                let errorMessage: string = `${unknownsAssetErrorMessage} - ${aError}`;

                this.errorHandler(errorMessage);
                aOnReject(errorMessage)
            });
        }

        private checkStateAndContinue(aCurrentState: DeferredQuery, aOnResolve: StepResolveCB, aOnReject: StepRejectCB): void {
            this.isExpectedState(aCurrentState).then((aExpected: boolean) => {
                    this.interactOrFinish(aOnResolve, aOnReject);
                },
                (aErr: any) => {
                    let errorMessage: string = `${Step.MSG_INCORRECT_STATE}: ${this.id} - ${aErr}`;
                    this.setValidation(true, false);
                    this.setCompletion(false);
                    //TODO: We should allow the journey to end early depending on a flag instead of exiting the whole process
                    this.errorHandler(errorMessage);
                    aOnReject(errorMessage)
                });
        }

        private isExpectedState(aCurrentState: DeferredQuery) : Promise<boolean> {
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

        private interactOrFinish(aOnResolve: StepResolveCB, aOnReject: StepRejectCB): void {
            this.setValidation(true, true);

            if (this.canInteract()) {
                this.interact(aOnResolve, aOnReject);
            } else {
                this.finish(aOnResolve, aOnReject);
            }
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

        private saveAssetsIfRequired(): NoSave | Promise<boolean> {
            let savingAssets: NoSave | Promise<boolean> = false;

            //TODO

            if (this.saveContent) {
                savingAssets = this.saver.saveCurrentAssets(this.getDTO(), this.nav);
            }

            return savingAssets;
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

        private finish(aOnResolve : StepResolveCB, aOnReject: StepRejectCB): void {
            let nextStep:Step = <Step>this.next;

            this.setCompletion(true);

            if (nextStep === null) {
                aOnResolve(this);
            } else {
                nextStep.begin(this.nav.query).then(aOnResolve, aOnReject)
            }
        }

        private screenShotCues: ScreenshotCue[];

        private saveContent: boolean;

        private screenShots: ImageDTO[] = [];

        private interactor?: (aCurrentStep: Step, aCurrentState: DeferredQuery, aErrHandler: BasicErrorHandler) => Promise<boolean>;

        private validator?: (aCurrentStep: Step, aCurrentState: DeferredQuery, aErrHandler: BasicErrorHandler) => boolean | Promise<boolean>;

        private hasBeenValidated: boolean = false;

        private isValid: boolean;
    }
}
export = jm.core;