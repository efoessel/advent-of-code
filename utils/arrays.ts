import { flow } from 'fp-ts/function';

export const Arrays = {
    tapLog: <T>(e: T) => (console.log(e), e),
    map<T, U>(fn: (elem: T, index: number, array: Readonly<T[]>) => U) {
        return (arr: Readonly<T[]>) => arr.map(fn);
    },
    flatMap<T, U>(fn: (elem: T, index: number, array: Readonly<T[]>) => U[]) {
        return (arr: Readonly<T[]>) => arr.flatMap(fn);
    },
    filter<T>(fn: (elem: T, index: number, array: Readonly<T[]>) => boolean) {
        return (arr: Readonly<T[]>) => arr.filter(fn);
    },
    sum(tab: Readonly<number[]>) {
        return tab.reduce((s, v) => s + v, 0);
    },
    min(tab: Readonly<number[]>) {
        return tab.reduce((s, v) => Math.min(s + v), Infinity);
    },
    max(tab: Readonly<number[]>) {
        return tab.reduce((s, v) => Math.max(s + v), -Infinity);
    },
    prod(tab: Readonly<number[]>) {
        return tab.reduce((s, v) => s * v, 1);
    },
    sortNumbers<T>(dir: 'ASC'|'DESC', getSortValue: (v: T) => number) {
        return (tab: Readonly<T[]>) => [...tab].sort((a, b) => dir === 'DESC' ? getSortValue(b)-getSortValue(a) : getSortValue(a)-getSortValue(b));
    },
    count<T>(fn: (elem: T, index: number, array: Readonly<T[]>) => boolean) {
        return (arr: Readonly<T[]>) => arr.filter(fn).length;
    },
    length<T>(array: Readonly<T[]>) {
        return array.length;
    },
    reduce<T, U>(fn: (acc: U, elem: T, index: number, array: Readonly<T[]>) => U, initialValue: U) {
        return (arr: Readonly<T[]>) => arr.reduce(fn, initialValue);
    },
    reduceAndRemember<T, U>(fn: (acc: U, elem: T, index: number, array: Readonly<T[]>) => U, initialValue: U) {
        return (arr: Readonly<T[]>) => arr.reduce(({last, all}, curr, i) => {
            const newVal = fn(last, curr, i, arr);
            return {
                last: newVal,
                all: [...all, newVal],
            }
        }, {last: initialValue, all: [initialValue] as U[]});
    },
    groupBy<K, V>(fn: (elem: V, index: number, array: Readonly<V[]>) => K) {
        return (arr: Readonly<V[]>) => {
            const map = new Map<K, V[]>();
            arr.forEach((v, i) => {
                const k = fn(v, i, arr);
                const group = map.get(k) ?? [];
                group.push(v);
                map.set(k, group);
            })
            return map;
        }
    },
    some<T>(fn: (elem: T, index: number, array: Readonly<T[]>) => boolean) {
        return (arr: Readonly<T[]>) => arr.some(fn);
    },
    every<T>(fn: (elem: T, index: number, array: Readonly<T[]>) => boolean) {
        return (arr: Readonly<T[]>) => arr.every(fn);
    },
    groupByAsArray<K, V>(fn: (elem: V, index: number, array: Readonly<V[]>) => K) {
        return flow(
            Arrays.groupBy(fn),
            map => Array.from(map.values())
        )
    },
    pivotToMap<K, V, U, D extends boolean>(pivotedKeys: (elem: V, index: number, array: Readonly<V[]>) => K[], pivotedValue: (pivotedKeys: K, elem: V, index: number, array: Readonly<V[]>) => U, discardUndefined: D) {
        type CoercedU = D extends true ? NonNullable<U> : U;
        return (arr: Readonly<V[]>) => {
            const map = new Map<K, CoercedU[]>();
            arr.forEach((v, i) => {
                pivotedKeys(v, i, arr).forEach((k) => {
                    const group = map.get(k) ?? [];
                    const value = pivotedValue(k, v, i, arr);
                    if(value !== undefined || !discardUndefined) {
                        group.push(value as CoercedU);
                    }
                    if(group.length > 0) {
                        map.set(k, group);
                    }
                });
            })
            return map as Map<K, CoercedU>;
        }
    },
    pivot<K extends string|number, V, U, D extends boolean>(pivotedKeys: (elem: V, index: number, array: Readonly<V[]>) => K[], pivotedValue: (pivotedKeys: K, elem: V, index: number, array: Readonly<V[]>) => U, discardUndefined: D) {
        return flow(
            Arrays.pivotToMap(pivotedKeys, pivotedValue, discardUndefined),
            map => Object.fromEntries(map.entries()) as unknown as Record<K, (D extends true ? NonNullable<U> : U)[]>,
        );
    },
    window(start: number, size: number) {
        return Arrays.map((_, index, array) => array.slice(Math.max(0, index + start), Math.max(0, index + start + size)));
    },
    windowStrict(start: number, size: number) {
        return flow(
            Arrays.window(start, size),
            Arrays.filter(it => it.length === size),
        )
    },

    zipW<T extends unknown[][]>(...params: T): { [K in keyof T]: T[K] extends (infer V)[] ? V|undefined : never }[] {
        if(params.length === 0) return [];
        // @ts-expect-error shh... let the magic happen
        return params[0].map((_, i) => params.map(p => p[i]));
    },
    zip<T extends unknown[][]>(...params: T): { [K in keyof T]: T[K] extends (infer V)[] ? V : never }[] {
        if(params.length === 0) return [];
        if(params.some(p => p.length !== params[0].length)) {
            throw new Error('Used zip on arrays of unequal lengths')
        }
        // @ts-expect-error shh... let the magic happen
        return Arrays.zipW(...params);
    },
    isSet<T>(array: Readonly<T[]>, equals: (a:T, b:T) => boolean = (a, b) => a===b) {
        return array.every((elem, i) => array.every((x, j) => j<=i || !equals(elem, x)));
    },

    
    // only returns a set if first array is a set
    intersection<T>(arrays: T[][], equals: (a:T, b:T) => boolean = (a, b) => a===b) {
        const [first, ...rest] = arrays;
        return first.filter(elem => rest.every(x => x.some(y => equals(elem, y))));
    },
    // always returns a set
    union<T>(arrays: T[][], equals: (a:T, b:T) => boolean = (a, b) => a===b) {
        const union = [] as T[];
        arrays.forEach(array => array.forEach(elem => {
            if(!union.some(x => equals(elem, x))) {
                union.push(elem);
            }
        }))
        return union;
    },
    range(from: number, to: number, step: number = from > to ? -1 : 1) {
        return Array.from({length: Math.floor((to - from)/step)}, (v, i) => from + i * step);
    },
}
