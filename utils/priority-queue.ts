const TOP = 0;
const parent = (i: number) => ((i + 1) >>> 1) - 1;
const left = (i: number) => (i << 1) + 1;
const right = (i: number) => (i + 1) << 1;

type Comparator<T> = (a:T, b:T) => boolean;

export class PriorityQueue<T> {
    private heap: T[] = [];

    constructor(
        private comparator : Comparator<T>
    ) {
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.size() == 0;
    }

    peek() {
        return this.heap[TOP];
    }

    push(...values: T[]) {
        values.forEach(value => {
            this.heap.push(value);
            this.siftUp();
        });
        return this.size();
    }

    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > TOP) {
            this.swap(TOP, bottom);
        }
        this.heap.pop();
        this.siftDown();
        return poppedValue;
    }

    private greater(i: number, j: number) {
        return this.comparator(this.heap[i], this.heap[j]);
    }

    private swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private siftUp() {
        let node = this.size() - 1;
        while (node > TOP && this.greater(node, parent(node))) {
            this.swap(node, parent(node));
            node = parent(node);
        }
    }

    private siftDown() {
        let node = TOP;
        while (
            (left(node) < this.size() && this.greater(left(node), node)) ||
            (right(node) < this.size() && this.greater(right(node), node))
        ) {
            const maxChild = (right(node) < this.size() && this.greater(right(node), left(node))) ? right(node) : left(node);
            this.swap(node, maxChild);
            node = maxChild;
        }
    }
}