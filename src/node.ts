export class Node<T> {
    constructor(
        public value: T,
        public key: number,
        public parent: Node<T> | undefined = undefined,
        public left: Node<T> | undefined = undefined,
        public right: Node<T> | undefined = undefined,
    ) {}

    public isRightChild(): boolean {
        return this.parent ? this.parent.right === this : false;
    }

    public isLeftChild(): boolean {
        return this.parent ? this.parent.left === this : false;
    }

    public isRoot(): boolean {
        return this.parent === undefined;
    }

    public getGrandparent(): Node<T> | undefined {
        return this.parent && this.parent.parent;
    }

    public getUncle(): Node<T> | undefined {
        return this.getGrandparent()
            ? this.parent?.isRightChild ? this.getGrandparent()?.left : this.getGrandparent()?.right
            : undefined;
    }

    public getSibling(): Node<T> | undefined {
        return this.parent
            ? this.isRightChild ? this.parent?.left : this.parent?.right
            : undefined;
    }

    public getIsLeaf(): boolean {
        return this.left === undefined && this.right === undefined;
    }

    public hasOneChild(): boolean {
        return this.left !== undefined && this.right === undefined
            || this.left === undefined && this.right !== undefined;
    }

    public hasTwoChildren(): boolean {
        return this.left !== undefined && this.right !== undefined;
    }
}