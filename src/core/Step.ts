import { LinkItem } from './LinkItem'
import {unescape} from "querystring";

module jm.core {
    type ScreenshotCue_onLoad = "on_load";
    type ScreenshotCue_onInteract = "on_interaction";
    type ScreenshotCue = ScreenshotCue_onLoad | ScreenshotCue_onInteract;

    interface ScreenshotCueDictionary {
        onLoad: ScreenshotCue_onLoad;
        onInteract: ScreenshotCue_onInteract;
    }

    interface ScreenShotMap {
        on_load?: string;
        on_interact?: string;
    }

    export interface StepConfig extends Item {
        screenShots?: ScreenshotCue[];
        actions?:string;
        validator?:string;
    }

    export class Step extends LinkItem {
        private static MSG_INCORRECT_STATE: string = "Current state did not match expected state";
        private static SCREENSHOT_CUES: ScreenshotCueDictionary  = {
            onLoad: "on_load",
            onInteract: "on_interaction"
        };

        constructor(aStep: StepConfig, private nav: NavigatorAdaptor, private errorHandler:BasicErrorHandler) {
            super(aStep);

            this.build(aStep);
        }

        public begin(aCurrentState: SQuery| JQuery) : void {
            let onLoadCue: ScreenshotCue = Step.SCREENSHOT_CUES.onLoad;

            //Check for screenshot requirement
            if ((<ModernArray<ScreenshotCue>>this.screenShotCues).includes(onLoadCue)) {
                this.nav.takeScreenshot().then(this.makeScreenshotSaver(onLoadCue));
            }

            this.isExpectedState(aCurrentState).then((aExpected: boolean) => {
                this.interact(aCurrentState);
            },
            (aErr: string) => {
                this.errorHandler(Step.MSG_INCORRECT_STATE);
            });
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

        private interact(aState: SQuery| JQuery) : void {
            this.interactor(this, aState, this.errorHandler);
        }

        private makeScreenshotSaver(aCueName: ScreenshotCue): (aData: string) => void {
            return (aData: string) => {
                this.screenShots[aCueName] = aData;
            }
        }

        private screenShotCues: ScreenshotCue[];
        private screenShots: ScreenShotMap = {};
        private interactor: (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aErrHandler: BasicErrorHandler) => void;
        private validator?: (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aErrHandler: BasicErrorHandler) => boolean | Promise<boolean>;
    }
}
export = jm.core;