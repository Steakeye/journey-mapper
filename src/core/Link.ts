module jm.core {
    export abstract class Link {

        public static chain(aLinks: Link[]): Link {
            return aLinks.reduce((aPrev: Link, aNext: Link) => {
                aPrev.next = aNext;
                return aNext;
            })
        }

        public get prev() : Link {
            return this.nextLink;
        }

        public set prev(aNextLink: Link) {
            this.nextLink = aNextLink;
        }

        public get next() : Link {
            return this.nextLink;
        }

        public set next(aNextLink: Link) {
            this.nextLink = aNextLink;
        }

        private nextLink: Link = null;
        private prevLink: Link = null;
    }
}

export = jm.core;