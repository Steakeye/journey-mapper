module jm.core {
    export abstract class Link<T> {

        public static chain<T>(...aLinks: Link<T>[]): Link<T> {
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

                return aLinks.reduceRight((aLast: Link<T>, aPrev: Link<T>) => {
                    aLast.prev = aPrev;
                    return aPrev;
                })
            }
        }

        public static break<T>(...aLinks: Link<T>[]): void {
            return aLinks.forEach((aLink: Link<T>) => {
                aLink.prev = null;
                aLink.next = null;
            })
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
                throw new Error("Link cannot be linked to itself");
            } else {
                return true;
            }
        }

        private nextLink: Link<T> = null;
        private prevLink: Link<T> = null;
    }
}

export = jm.core;