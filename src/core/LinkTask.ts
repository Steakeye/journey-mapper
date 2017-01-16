///<reference path="../interfaces/core.d.ts" />

import { LinkItem } from './LinkItem'

module jm.core {
    export abstract class LinkTask<T> extends LinkItem<T> implements Task {
        public get complete(): boolean {
            return this.isComplete;
        }

        public get succeeded(): boolean {
            return this.hasSuceeded;
        }

        protected isComplete : boolean = false;
        protected hasSuceeded: boolean = false;
    }
}

export = jm.core;