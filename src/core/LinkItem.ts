///<reference path="../interfaces/core.d.ts" />

import { Link } from './Link'

module jm.core {
    export abstract class LinkItem extends Link implements ItemConfig {
        private static NO_CONSTRUCTOR_CONFIG: string = "No config provided for LinkItem"

        constructor(aItemInfo: ItemConfig) {
            super();

            if (!aItemInfo) {
                throw new Error(LinkItem.NO_CONSTRUCTOR_CONFIG);
            } else {
                this.idVal = aItemInfo.id;
                this.titleVal = aItemInfo.title;
                this.descVal = aItemInfo.description;
            }
        }

        public get id(): string {
            return this.idVal;
        }

        public get title(): string {
            return this.titleVal;
        }

        public get desc(): string {
            return this.descVal;
        }

        protected idVal: string;
        protected titleVal: string;
        protected descVal: string;
    }
}

export = jm.core;