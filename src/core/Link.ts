module jm.core {
    export abstract class Link<T> {

        private static MSG_ERR_LINKS_TO_CHAIN_NOT_UNIQUE: string = "Links to chain must be unique";
        private static MSG_ERR_LINK_TO_SELF: string = "Link cannot be linked to itself";

        public static chain<T>(...aLinks: Link<T>[]): Link<T> {
            let linkCount: number;

            function getLinkCount(): number {
                linkCount = aLinks.length;
                return linkCount;
            }

            if (aLinks && getLinkCount()) {
                aLinks.forEach((aLink: Link<T>, aCurrentIndex) => {
                    if (aLinks.indexOf(aLink, aCurrentIndex + 1) > -1) {
                        throw new Error(Link.MSG_ERR_LINKS_TO_CHAIN_NOT_UNIQUE);
                    }
                });

                if (linkCount > 1) {
                    Link.break(aLinks[0], aLinks[linkCount - 1]);
                } else {
                    Link.break(aLinks[0]);
                }

                return aLinks.reduceRight((aLast: Link<T>, aPrev: Link<T>) => {
                    //aLast.prev = aPrev;

                    aLast.prevLink = aPrev;
                    aPrev.nextLink = aLast;
                    return aPrev;
                })
            }
        }

        public static break<T>(...aLinks: Link<T>[]): void {
            return aLinks.forEach((aLink: Link<T>) => {
                // aLink.prev = null;
                // aLink.next = null;
                aLink.prevLink = null;
                aLink.nextLink = null;
            })
        }

        public static head<T>(aLink: Link<T>): Link<T> {
            let linkToReturn: Link<T> = aLink,
                prevLink: Link<T> = aLink.prevLink;

            while (prevLink !== null) {
                linkToReturn = prevLink;
                prevLink = prevLink.prevLink;
            }

            return linkToReturn;
        }

        public static tail<T>(aLink: Link<T>): Link<T> {
            let linkToReturn: Link<T> = aLink,
                nextLink: Link<T> = aLink.nextLink;

            while (nextLink !== null) {
                linkToReturn = nextLink;
                nextLink = nextLink.nextLink;
            }

            return linkToReturn;
        }

        public get prev() : Link<T> {
            return this.nextLink;
        }

        public set prev(aPrevLink: Link<T>) {
            if (aPrevLink === this.prevLink) {
                return;
            }

            if (this.linkToSetNotSelf(aPrevLink)) {
                let earlierLink = this.nextLink;
                if (earlierLink) {
                    earlierLink.next = null;
                }
                this.prevLink = aPrevLink;
            }

            if (aPrevLink !== null) {
                aPrevLink.next = this;
            }
        }

        public get next() : Link<T> {
            return this.nextLink;
        }

        public set next(aNextLink: Link<T>) {
            if (aNextLink === this.nextLink) {
                return;
            }

            if (this.linkToSetNotSelf(aNextLink)) {
                let earlierLink = this.prevLink;
                if (earlierLink) {
                    earlierLink.prev = null;
                }
                this.nextLink = aNextLink;
            }

            if (aNextLink !== null) {
                aNextLink.prev = this;
            }
        }

        private linkToSetNotSelf(aLinkToAttach: Link<T>): boolean {
            if (aLinkToAttach === this) {
                throw new Error(Link.MSG_ERR_LINK_TO_SELF);
            } else {
                return true;
            }
        }

        private nextLink: Link<T> = null;
        private prevLink: Link<T> = null;
    }
}

export = jm.core;