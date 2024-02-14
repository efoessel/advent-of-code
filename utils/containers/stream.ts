type Mapper<T, U> = (elem: T, idx: number) => U;
type Consumer<T> = (elem: T, idx: number) => void;
type Predicate<T> = Mapper<T, boolean>;
type TypeGuard<T, U extends T> = (elem: T, idx: number) => elem is U;
type Reducer<T, U> = (acc: U, elem: T, idx: number) => U;
type ReducerStopFn<T, U> = (acc: U, elem: T, idx: number) => boolean;

type ArraysOf<T extends unknown[]> = {[i in keyof T]: readonly T[i][]}

export class Stream<T> implements Iterable<T> {
    constructor(private generator: Generator<T, undefined | void, void>) {}

    private of<U>(fn: (g: Generator<T, undefined | void, void>) => Generator<U, void | undefined, void>): Stream<U> {
        return new Stream(fn(this.generator));
    }

    /** Native iterable stuff */
    public [Symbol.iterator]() {
        return this.generator;
    }

    /** Static constructors */

    /**
     * Build a stream from an iterable.
     * May be an array, an other stream, a generator...
     */
    public static fromIterable<T>(arr: Iterable<T>): Stream<T> {
        function* fromIterable<T>(input: Iterable<T>) : Generator<T, undefined, void> {
            for(const e of input) {
                yield e;
            }
        }
        return new Stream(fromIterable(arr))
    }

    /**
     * Stream all possible cross-product of the input arrays
     * In case order matters, it preserve the order of the arrays, and goes through the last arrays first
     * [1, 2, 3], [a, b, c] => [1, a], [1, b], [1, c], [2, a] ...
     */
    public static fromCrossProduct<T extends unknown[]>(...arr: ArraysOf<T>) {
        function* fromCrossProduct<T extends unknown[]>(arr: ArraysOf<T>): Generator<T, undefined, void> {
            const [head, ...tail] = arr;
            for(const v of head) {
                if(tail.length === 0) {
                    yield [v] as T;
                } else {
                    for(const rest of fromCrossProduct(tail)) {
                        yield [v, ...rest] as T;
                    }
                }
            }
        }
        return new Stream(fromCrossProduct(arr))
    }

    /**
     * Stream of all possible permutations for this input iterable
     * Complexity grows very fast, do not use on big inputs.
     * Uses B. R. Heap's algorithm
     */
    public static fromPermutations<T>(input: Iterable<T>) {
        const copy = new Array(...input);

        const swap = (i: number, j: number) => [copy[i], copy[j]] = [copy[j], copy[i]];
        function* generator(n: number): Generator<T[], void, void> {
            if(n === copy.length) {
                yield copy;
            }
            if(n>2) {
                yield* generator(n-1)
            }
            for(let i = 0 ; i < n-1 ; i++) {
                swap(n-1, n%2 === 0 ? i : 0);
                yield copy;
                if(n>2) {
                    yield* generator(n-1);
                }
            }
        }
        return new Stream(generator(copy.length));
    }

    public static fromRange(from: number, to: number, step = Math.sign(to - from)) {
        function* range(from: number, to: number, step = Math.sign(to - from)): Generator<number, undefined, void> {
            if(from === to) return;
            while(from * Math.sign(step) < to * Math.sign(step)) {
                yield from;
                from += step;
            }
        }
        return new Stream(range(from, to, step))
    }

    public static fromRangeI(from: number, to: number, step = Math.sign(to - from)) {
        function* rangeI(from: number, to: number, step = Math.sign(to - from)): Generator<number, undefined, void> {
            if(from === to) {
                yield from;
                return;
            }
            while(from * Math.sign(step) <= to * Math.sign(step)) {
                yield from;
                from += step;
            }
        }
        return new Stream(rangeI(from, to, step))
    }

    public static fromSubsets<T>(input: Iterable<T>) {
        const values = new Array(...input);
        const selected = values.map(() => false);

        function* subsets(pos: number): Generator<T[], void, void> {
            if(pos === -1) {
                yield values.filter((_, i) => selected[i]);
            } else {
                selected[pos] = false;
                yield* subsets(pos-1);
                selected[pos] = true;
                yield* subsets(pos-1);
            }
        }

        return new Stream(subsets(values.length - 1));
    }

    /**
     * Stream all the ways to pick k elements of the array
     * If order matters, it picks the first elements as first choices, but last choice go through all elements pretty fast.
     * More precisely, the array of choice indices (sorted asc) will always grow considering the lexicographic order.
     * [1, 2, 3, 4, 5] => [1, 2], [1, 3], [1, 4], [1, 5], [2, 3]
     */
    public static fromArrayChooseK<T>(values: T[], k: number) {
        function* fromArrayChooseK(selected: T[], pos: number): Generator<T[], void, void> {
            if (selected.length === k) {
                yield selected;
            } else if(pos === values.length) {
                return;
            } else {
                yield* fromArrayChooseK(selected.concat([values[pos]]), pos + 1);
                yield* fromArrayChooseK(selected, pos + 1);
            }
        }
        return new Stream(fromArrayChooseK([], 0))
    }

    public static loop() {
        return new Stream<void>((function* loop() {
            while(true) yield;
        })());
    }

    /** Transformations */
    public static map = <T, U>(mapFn: Mapper<T, U>) => (s: Stream<T>): Stream<U> => s.map(mapFn);
    public map<U>(mapFn: Mapper<T, U>): Stream<U> {
        return this.of(function* mapped(g) {
            let i = 0;
            for(const v of g) {
                yield mapFn(v, i++);
            }
        });
    }

    public static mapWithState = <S, T, U>(mapFn: (state: S, elem: T, idx: number) => [S, U], initialState: S) =>
        (s: Stream<T>): Stream<U> => s.mapWithState(mapFn, initialState);
    public mapWithState<S, U>(mapFn: (state: S, elem: T, idx: number) => [S, U], initialState: S): Stream<U> {
        return this.map((elem, idx) => {
            const res = mapFn(initialState, elem, idx);
            initialState = res[0];
            return res[1];
        });
    }

    public static flatMap = <T, U>(flatMapFn: Mapper<T, Iterable<U>>) => (s: Stream<T>): Stream<U> => s.flatMap(flatMapFn);
    flatMap<U>(flatMapFn: Mapper<T, Iterable<U>>): Stream<U> {
        return this.of(function* flatMap(g) {
            let i = 0;
            for(const v of g) {
                yield* flatMapFn(v, i++);
            }
        })
    }

    /** Side-effects */
    public static tap = <T>(action: Consumer<T>) => (s: Stream<T>): Stream<T> => s.tap(action);
    public tap(action: Consumer<T>) {
        return this.map((t, i) => {
            action(t, i);
            return t;
        });
    }

    public static log = <T>(prefix: string = '') => (s: Stream<T>): Stream<T> => s.log(prefix);
    public log(prefix: string = '') {
        return this.map((t, i) => {
            console.log(prefix, t, i);
            return t;
        });
    }

    /** Filters */
    public static limit = <T>(n: number) => (s: Stream<T>): Stream<T> => s.limit(n);
    public limit(n: number): Stream<T> {
        return this.of(function* limit(s) {
            let i = 0;
            for(const v of s) {
                if(i++ < n) {
                    yield v;
                } else {
                    return;
                }
            }
        })
    }

    /**
     * Accept all items of the steam until the stop condition is met.
     * Item having met the stop condition is not rejected.
     */
    public static takeUntil = <T>(stop: Predicate<T>) => (s: Stream<T>): Stream<T> => s.takeUntil(stop);
    public takeUntil(stop: Predicate<T>): Stream<T> {
        return this.of(function* takeUntil(s) {
            let i = 0;
            for(const v of s) {
                if(stop(v, i++)) {
                    return;
                }
                yield v;
            }
        })
    }

    public static filter<T, U extends T>(filter: TypeGuard<T, U>): (s:Stream<T>) => Stream<U>;
    public static filter<T>(filter: Predicate<T>): (s:Stream<T>) => Stream<T>;
    public static filter<T>(filter: Predicate<T>) {
        return (s:Stream<T>) => s.filter(filter)
    }

    filter<U extends T>(filter: TypeGuard<T, U>): Stream<U>;
    filter(filter: Predicate<T>): Stream<T>;
    filter(filter: Predicate<T>) {
        return this.of(function*(s) {
            let i = 0;
            for(const v of s) {
                if(filter(v, i++)) {
                    yield v;
                }
            }
        })
    }


    /** Collectors */
    public static toArray = <T>(s: Stream<T>) => s.toArray();
    public toArray(): T[] {
        const arr: T[] = [];
        for(const v of this.generator) {
            arr.push(v)
        }
        return arr;
    }

    public static first = <T>(ok: Predicate<T> = () => true) => (s: Stream<T>): T|undefined => s.first(ok);
    public first(ok: Predicate<T> = () => true): T | undefined {
        let i = 0;
        for(const v of this.generator) {
            if(ok(v, i++)) {
                return v;
            }
        }
        return undefined;
    }

    public static last = <T>(ok: Predicate<T> = () => true) => (s: Stream<T>): T|undefined => s.last(ok);
    public last(ok: Predicate<T> = () => true): T | undefined {
        let i = 0, last: T | undefined = undefined;
        for(const v of this.generator) {
            if(ok(v, i++)) {
                last = v;
            }
        }
        return last;
    }

    public static some = <T>(filter: Predicate<T>) => (s: Stream<T>): boolean => s.some(filter);
    public some(filter: Predicate<T>): boolean {
        let i = 0;
        for(const v of this.generator) {
            if(filter(v, i++)) {
                return true;
            }
        }
        return false;
    }

    public static every = <T>(filter: Predicate<T>) => (s: Stream<T>): boolean => s.every(filter);
    public every(filter: Predicate<T>): boolean {
        let i = 0;
        for(const v of this.generator) {
            if(!filter(v, i++)) {
                return false;
            }
        }
        return true;
    }


    public static size = <T>(s: Stream<T>): number => s.size();
    public size() {
        return this.reduce((x) => x+1, 0);
    }

    /**
     * Count the number of elements in the steam satisfying the condition.
     * Exhausts the stream
     */
    public static count = <T>(f: Predicate<T>) => (s: Stream<T>): number => s.count(f);
    public count(f: Predicate<T>) {
        return this.filter(f).size();
    }

    /**
     * Count the number of each unique elements in the stream.
     * Exhausts the stream
     * @returns Map<elem, count>
     */
    public static countElements = <T>(s: Stream<T>): Map<T, number> => s.countElements();
    public countElements(): Map<T, number> {
        const res = new Map<T, number>();
        for(const v of this.generator) {
            res.set(v, (res.get(v) ?? 0)+1);
        }
        return res;
    }

    /** Reducers */

    public static reduce = <T, U>(reducer: Reducer<T, U>, initialValue: U) => (s: Stream<T>): U => s.reduce(reducer, initialValue);
    public reduce<U>(reducer: Reducer<T, U>, initialValue: U): U {
        let i = 0, acc = initialValue;
        for (const v of this.generator) {
            acc = reducer(acc, v, i++);
        }
        return acc;
    }

    public static reduceUntil = <T, U>(stop: ReducerStopFn<T, U>, reducer: Reducer<T, U>, initialValue: U) => (s: Stream<T>): U =>
        s.reduceUntil(stop, reducer, initialValue);
    public reduceUntil<U>(stop: ReducerStopFn<T, U>, reducer: Reducer<T, U>, initialValue: U): U {
        let i = 0, acc = initialValue;
        for (const v of this.generator) {
            if(stop(acc, v, i)) return acc;
            acc = reducer(acc, v, i++);
        }
        return acc;
    }

    public static reduceUntilStable = <T, U, M>(hash: Mapper<U, M>, reducer: Reducer<T, U>, initialValue: U) => (s: Stream<T>): U =>
        s.reduceUntilStable(hash, reducer, initialValue);
    public reduceUntilStable<U, M>(hash: Mapper<U, M>, reducer: Reducer<T, U>, initialValue: U): U {
        let lastValue: M | object = {};
        return this.reduceUntil(
            (acc: U, _, i) => {
                const val = hash(acc, i);
                const res = val === lastValue;
                lastValue = val;
                return res;
            },
            reducer, initialValue
        );
    }

    public static loopUntil<T>(stop: Predicate<T>, reducer: Mapper<T, T>, initialValue: T) {
        return Stream.loop().reduceUntil((acc, _, idx) => stop(acc, idx), (acc, _, idx) => reducer(acc, idx), initialValue);
    }

    public static loopUntilStable<T, M>(hash: Mapper<T, M>, reducer: Mapper<T, T>, initialValue: T) {
        return Stream.loop().reduceUntilStable(hash, (acc, _, idx) => reducer(acc, idx), initialValue);
    }

    public static withMin = <T>(extractNumber: Mapper<T, number>) => (s: Stream<T>) => s.withMin(extractNumber)
    public withMin(extractNumber: Mapper<T, number>): T | undefined {
        return this.reduce<[T|undefined, number]>(([item, min], curr, idx) => {
            const num = extractNumber(curr, idx);
            if(num < min) return [curr, num];
            else return [item, min];
        }, [undefined, Infinity])[0]
    }

    public static withMax = <T>(extractNumber: Mapper<T, number>) => (s: Stream<T>) => s.withMin(extractNumber)
    public withMax(extractNumber: Mapper<T, number>): T | undefined {
        return this.reduce<[T|undefined, number]>(([item, min], curr, idx) => {
            const num = extractNumber(curr, idx);
            if(num < min) return [curr, num];
            else return [item, min];
        }, [undefined, -Infinity])[0]
    }

    public min(this: Stream<number>): number {
        return this.reduce((min, elem) => Math.min(min, elem), Infinity);
    }

    public max(this: Stream<number>): number {
        return this.reduce((max, elem) => Math.max(max, elem), -Infinity);
    }
}
