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

                return aLinks.reduceRight((aLast: Link, aPrev: Link) => {
                    aLast.prev = aPrev;
                    return aPrev;
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

        public set prev(aPrevLink: Link) {
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

        public get next() : Link {
            return this.nextLink;
        }

        public set next(aNextLink: Link) {
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

        private linkToSetNotSelf(aLinkToAttach: Link): boolean {
            if (aLinkToAttach === this) {
                throw new Error("Link cannot be linked to itself");
            } else {
                return true;
            }
        }

        private nextLink: Link = null;
        private prevLink: Link = null;
    }
}

export = jm.core;