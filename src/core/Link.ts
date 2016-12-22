module jm.core {
    export abstract class Link {

        public static chain(...aLinks: Link[]): Link {
            let linkCount: number;

            function getLinkCount(): number {
                linkCount = aLinks.length;
                return linkCount;
            }

            if (aLinks && getLinkCount()) {
                if (linkCount > 1) {
                    Link.break(aLinks[0], aLinks[linkCount - 1]);
                } else {
                    Link.break(aLinks[0]);
                }

                return aLinks.reduce((aPrev: Link, aNext: Link) => {
                    aPrev.next = aNext;
                    return aNext;
                })
            }
        }

        public static break(...aLinks: Link[]): void {
            return aLinks.forEach((aLink: Link) => {
                aLink.prev = null;
                aLink.next = null;
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