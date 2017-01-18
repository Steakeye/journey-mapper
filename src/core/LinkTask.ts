///<reference path="../interfaces/core.d.ts" />

import { LinkItem } from './LinkItem'

module jm.core {
    export abstract class LinkTask<T> extends LinkItem<T> implements TaskProto {
        public begin(...aArgs:any[]): Promise<LinkTask<T>> {
            /*Override me (can call as super too)*/
            this.hasStarted = true;
            return undefined;
        }

        public get started(): boolean {
            return this.isComplete;
        }

        public get complete(): boolean {
            return this.isComplete;
        }

        public get succeeded(): boolean {
            return this.hasSuceeded;
        }

        protected hasStarted: boolean = false;
        protected isComplete : boolean = false;
        protected hasSuceeded: boolean = false;
    }
}

export = jm.core;