enum Dir {
    LEFT,
    RIGHT,
}

const opDir = (dir: Dir) => dir === Dir.LEFT ? Dir.RIGHT : Dir.LEFT;
const child = <T>(node: Node<T> | undefined, dir: Dir) => dir === Dir.LEFT ? node?.left : node?.right;

export class Node<T> {
    constructor(
        public value: T | undefined,
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

    public isLeaf(): boolean {
        return this.left === undefined && this.right === undefined;
    }

    public hasOneChild(): boolean {
        return this.left !== undefined && this.right === undefined
            || this.left === undefined && this.right !== undefined;
    }

    public hasTwoChildren(): boolean {
        return this.left !== undefined && this.right !== undefined;
    }

    public insert(key: number, value: T): Node<T> {
        if (!this.value) {
            this.value = value;
            return this;
        }

        if (key > this.key) {
            if (!this.right) {
                const newNode = new Node<T>(value, key);
                newNode.parent = this;
                this.right = newNode;
                return newNode;
            }

            return this.right.insert(key, value);
        } else {
            if (!this.left) {
                const newNode = new Node<T>(value, key);
                newNode.parent = this;
                this.left = newNode;
                return newNode;
            }

            return this.left.insert(key, value);
        }
    }

    public remove(key: number): void {
        if (this.key === key) {
            if (this.isLeaf()) {
                if (this.isRoot()) {
                    this.value = undefined;
                } else if (this.isRightChild() && this.parent) {
                    this.parent.right = undefined
                } else if (this.isLeftChild() && this.parent) {
                    this.parent.left = undefined
                }
            } else if (this.hasOneChild()) {
                this.right ? this.rotateLeft() : this.rotateRight;
                this.right ? this.left = undefined : this.right = undefined;
            } else if (this.hasTwoChildren()) {
                this.value = this.right?.minimumChild().value;
                this.right?.remove(this.right?.minimumChild().key);
            }
        } else {
            if (this.key < key) {
                if (this.right) {
                    this.right.remove(key);
                }
            } else {
                if (this.left) {
                    this.left.remove(key);
                }
            }
        }
    }

    public find(key: number): Node<T> | undefined {
        if (this.key === key) {
            return this;
        }

        if (this.key < key) {
            if (this.right) {
                return this.right.find(key);
            }

            return undefined;
        } else {
            if (this.left) {
                return this.left.find(key);
            }

            return undefined;
        }
    }

    public contains(key: number): boolean {
        return !!this.find(key);
    }

    public minimum(): Node<T> {
        return this.minimumChild();
    }

    public maximum(): Node<T> {
        return this.minimumChild();
    }

    protected minimumChild(): Node<T> {
        let current: Node<T> = this;
        while (current.left) {
            current = current.left;
        }

        return current;
    }

    protected maximumChild(): Node<T> {
        let current: Node<T> = this;
        while (current.right) {
            current = current.right;
        }

        return current;
    }

    protected rotateLeft(): void {
        this.rotate(Dir.LEFT);
        this.swapWithParent();
    }

    protected rotateRight(): void {
        this.rotate(Dir.RIGHT);
        this.swapWithParent();
    }

    private swapWithParent(): void {
        // Create new node and replace old
        let replacement = new Node<T>(this.value, this.key);
        replacement.parent = this.parent;
        replacement.left = this.left;
        replacement.right = this.right;

        if (this.parent) {
            if (this.isRightChild()) {
                this.parent.right = replacement;
            }

            if (this.isLeftChild()) {
                this.parent.left = replacement;
            }
        }

        if (replacement.parent) {
            this.value = replacement.parent.value;
            this.left = replacement.parent.left;
            this.right = replacement.parent.right;
            this.parent = replacement.parent.parent;
        }

        // Update reference to this for child
        if (this.left) {
            this.left.parent = this;

            if (this.left.left) {
                this.left.left.parent = this.left;
            }
    
            if (this.left.right) {
                this.left.right.parent = this.left;
            }
        }

        if (this.right) {
            this.right.parent = this;

            if (this.right.left) {
                this.right.left.parent = this.right;
            }
    
            if (this.right.right) {
                this.right.right.parent = this.right;
            }
        }
    }

    private rotate(dir: Dir): void {
        const pivot = child(this, opDir(dir));
        
        if (opDir(dir) === Dir.LEFT) {
            this.left = child(pivot, dir)
        } else {
            this.right = child(pivot, dir)
        }

        if (pivot) {
            if (dir === Dir.LEFT) {
                pivot.left = this;
            } else {
                pivot.right = this;
            }

            pivot.parent = this.parent;

            if (pivot.left) {
                pivot.left.parent = pivot;
            }

            if (pivot.right) {
                pivot.right.parent = pivot;
            }
        }

        if (this.left) {
            this.left.parent = this;
        }

        if (this.right) {
            this.right.parent = this;
        }
    }
}