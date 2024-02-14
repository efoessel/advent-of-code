import { flow, identity, pipe } from 'fp-ts/function';
import { Objects } from './objects';
import { TypeGuard, isDefined } from './types';
import { Matrices } from './grids';

export namespace Arrays {
    type mapFn<T, U> = (elem: T, key: number, array: readonly T[]) => U;
    type predicateFn<T> = mapFn<T, boolean>;
    type reducerStopFn<T, U> = (acc: U, elem: T, key: number, array: readonly T[]) => boolean;
    type reducerFn<T, U> = (acc: U, elem: T, key: number, array: readonly T[]) => U;

    export const at = <T>(pos: number) => {
        return (arr: readonly T[]): T|undefined => arr.at(pos);
    };

    export const atUnsafe = <T>(pos: number) => {
        return (arr: readonly T[]): T => arr[(pos + arr.length) % arr.length];
    };

    export const map = <T, U>(fn: mapFn<T, U>) => {
        return (arr: readonly T[]): U[] => arr.map(fn);
    };

    export const flatMap = <T, U>(fn: mapFn<T, U[]>) => {
        return (arr: readonly T[]): U[] => arr.flatMap(fn);
    };

    export const mapToObject = <T, U>(fn: mapFn<T, U>, key: mapFn<T, string>) => (a: readonly T[]) => pipe(
        a,
        Arrays.map((el, i) => ([key(el, i, a), fn(el, i, a)] as const)),
        Objects.fromEntries
    );

    export function filter<T, U extends T>(fn: TypeGuard<T, U>): (arr: readonly T[]) => U[];
    export function filter<T>(fn: predicateFn<T>): (arr: readonly T[]) => T[];
    export function filter<T>(fn: predicateFn<T>) {
        return (arr: readonly T[]): T[] => arr.filter(fn);
    }

    export const slice = <T>(start?: number, end?: number) => {
        return (arr: readonly T[]): T[] => arr.slice(start, end);
    };

    export const reverse = <T>(arr: readonly T[]): T[] => [...arr].reverse();

    /**
     * Filter items, but keep their initial position in the array instead of the item
     */
    export const filterIdx = <T>(fn: predicateFn<T>) => {
        return (arr: readonly T[]): number[] => arr.map((e, i, a) => fn(e, i, a) ? i : -1).filter(x => x>=0);
    };

    export const filterGuard = <T, U extends T>(guard: (elem: T, key: number, array: readonly T[]) => elem is U) => {
        return (arr: readonly T[]): U[] => arr.filter(guard);
    }

    export const filterNullable = filterGuard(isDefined);

    export const sum = (tab: readonly number[]) => {
        return tab.reduce((s, v) => s + v, 0);
    };

    export const avg = (tab: readonly number[]) => {
        return tab.reduce((s, v) => s + v, 0) / tab.length;
    };

    export const median = (tab: readonly number[]) => {
        const input = Arrays.sortNumbers<number>('ASC', identity)(tab);
        if(input.length % 2 === 1) {
            return input[(input.length - 1)/2];
        } else {
            //this is not, in general, the only solution, anything between input[input.length/2 - 1] and input[input.length/2] would be valid
            return input[input.length/2];
        }
    };

    export const min = (tab: readonly number[]) => {
        return tab.reduce((s, v) => Math.min(s, v), Infinity);
    };

    export const withMin = <T>(getSortValue: mapFn<T, number>) => (tab: readonly T[]) => {
        return tab.reduce<{max: number, item: T | undefined}>((acc, v, i, a) => {
            const s = getSortValue(v, i, a);
            return s < acc.max ? {max: s, item: v} : acc;
        }, {max: Infinity, item: undefined}).item;
    };

    /**
     * Find the minimum value using a comparator
     * compare must return a negative value if the first argument is less than the second argument,
     * zero if they're equal, and a positive value otherwise
     */
    export const withMinC = <T>(compare: (a: T, b: T) => number) => (tab: readonly T[]) => {
        return tab.reduce((acc, v) => {
            const s = compare(acc, v);
            return s <= 0 ? acc : v;
        });
    };

    export const max = (tab: readonly number[]) => {
        return tab.reduce((s, v) => Math.max(s, v), -Infinity);
    };

    export const withMax = <T>(getSortValue: mapFn<T, number>) => (tab: readonly T[]) => {
        return tab.reduce<{max: number, item: T | undefined}>((acc, v, i, a) => {
            const s = getSortValue(v, i, a);
            return s > acc.max ? {max: s, item: v} : acc;
        }, {max: -Infinity, item: undefined}).item;
    };

    /**
     * Find the maximum value using a comparator
     * compare must return a negative value if the first argument is less than the second argument,
     * zero if they're equal, and a positive value otherwise
     */
    export const withMaxC = <T>(compare: (a: T, b: T) => number) => (tab: readonly T[]) => {
        return tab.reduce((acc, v) => {
            const s = compare(acc, v);
            return s >= 0 ? acc : v;
        });
    };

    export const prod = (tab: readonly number[]) => {
        return tab.reduce((s, v) => s * v, 1);
    };

    export const sort = <T>(dir: 'ASC'|'DESC', compare: (a: T, b: T) => number) => {
        return (tab: readonly T[]) => dir === 'DESC'
            ? [...tab].sort((a, b) => compare(b, a))
            : [...tab].sort((a, b) => compare(a, b));
    };

    export const sortNumbers = <T>(dir: 'ASC'|'DESC', getSortValue: (v: T) => number) => {
        return (tab: readonly T[]) => dir === 'DESC'
            ? [...tab].sort((a, b) => getSortValue(b)-getSortValue(a))
            : [...tab].sort((a, b) => getSortValue(a)-getSortValue(b));
    };

    export const count = <T>(fn: predicateFn<T>) => {
        return (arr: readonly T[]) => arr.filter(fn).length;
    };

    export const length = (array: readonly unknown[]) => {
        return array.length;
    };

    export const reduce = <T, U>(fn: (acc: U, elem: T, index: number, array: readonly T[]) => U, initialValue: U) => {
        return (arr: readonly T[]) => arr.reduce(fn, initialValue);
    };

    export const reduceUntil = <T, U>(
        stop: (acc: U, elem:T, index:number, array: readonly T[]) => boolean,
        fn: reducerFn<T, U>,
        initialValue: U,
    ) => {
        return (array: readonly T[]) => {
            let acc = initialValue;
            for(let i = 0 ; i < array.length ; i++) {
                if(stop(acc, array[i], i, array)) return acc;
                else acc = fn(acc, array[i], i, array);
            }
            return acc;
        }
    };

    export const reduceAndRememberUntil = <T, U>(
        stop: reducerStopFn<T, U>,
        fn: reducerFn<T, U>,
        initialValue: U
    ) => {
        return (array: readonly T[]) => {
            const all: U[] = [initialValue];
            let acc = initialValue;
            for(let i = 0 ; i < array.length ; i++) {
                if(stop(acc, array[i], i, array)) return all;
                acc = fn(acc, array[i], i, array);
                all.push(acc)
            }
            return all;
        }
    };

    export const reduceAndRemember = <T, U> (
        fn: reducerFn<T, U>,
        initialValue: U
    ) => {
        return reduceAndRememberUntil(() => false, fn, initialValue);
    };

    export const some = <T>(fn: predicateFn<T>) => {
        return (arr: readonly T[]) => arr.some(fn);
    };

    export const every = <T>(fn: predicateFn<T>) => {
        return (arr: readonly T[]) => arr.every(fn);
    };

    /**
     * For each item of the array, build a key then return a map
     * key => [all items with this key]
     * Method may return several keys. In this case, the original item will appear in multiple groups.
     */
    export const groupByAsMap = <K, V>(getKeys: mapFn<V, K | readonly K[]>) => {
        return (arr: readonly V[]) => {
            const map = new Map<K, V[]>();
            arr.forEach((v, i) => {
                const keys0 = getKeys(v, i, arr);
                const keys = Array.isArray(keys0) ? keys0 : [keys0];
                keys.forEach((k) => {
                    const group = map.get(k) ?? [];
                    group.push(v);
                    map.set(k, group);
                });
            })
            return map;
        }
    };

    export const groupByAsObject = <K extends string, V>(getKey: mapFn<V, K | readonly K[]>) => {
        return flow(
            groupByAsMap(getKey),
            Objects.fromMap
        );
    };

    export const groupByAsArray = <K, V>(getKey: mapFn<V, K | readonly K[]>) => {
        return flow(
            Arrays.groupByAsMap(getKey),
            map => Array.from(map.values())
        )
    };

    /**
     * For each item of the array, build a key then return a map
     * key => [count of items with this key]
     * Method may return several keys. In this case, the original item will be counted in multiple groups.
     */
    export const countUniqueAsMap = <K, V>(getKeys: mapFn<V, K | readonly K[]>) => {
        return (arr: readonly V[]) => {
            const map = new Map<K, number>();
            arr.forEach((v, i) => {
                const keys0 = getKeys(v, i, arr);
                const keys = Array.isArray(keys0) ? keys0 : [keys0];
                keys.forEach((k) => {
                    const cnt = map.get(k) ?? 0;
                    map.set(k, cnt + 1);
                });
            })
            return map;
        }
    };

    export const window = <T>(start: number, size: number) => {
        return (arr: readonly T[]) => arr.map(
            (_, index, array) => array.slice(Math.max(0, index + start), Math.max(0, index + start + size))
        );
    };

    export const windowStrict = <T>(size: number) => {
        return flow(
            Arrays.window<T>(0, size),
            Arrays.filter(it => it.length === size),
        );
    };

    /**
     * Zip multiple arrays, based on the length of the longest input array
     * If not inputs have the same length, missing values are padded with undefined.
     */
    export const zipW = <const T extends unknown[][]>(params: T): { [K in keyof T]: T[K] extends (infer V)[] ? V|undefined : never }[] => {
        const base = pipe(params, Arrays.withMax(Arrays.length));
        if(!base || params.length === 0) return [];
        // @ts-expect-error shh... let the magic happen
        return base.map((_, i) => params.map(p => p[i]));
    };

    export const zip = <const T extends (readonly unknown[])[]>(params: T): { [K in keyof T]: T[K] extends (infer V)[] ? V : never }[] => {
        if(params.length === 0) return [];
        if(params.some(p => p.length !== params[0].length)) {
            throw new Error('Used zip on arrays of unequal lengths')
        }
        // @ts-expect-error shh... let the magic happen
        return Arrays.zipW(params);
    };


    export const isSetWithCustomEqual = <T>(equals: (a:T, b:T) => boolean) => (array: readonly T[]) => {
        return array.every((elem, i) => array.every((x, j) => j<=i || !equals(elem, x)));
    };

    export const isSetUsing = <T>(hash: (a:T) => unknown) => (array: readonly T[]) => {
        const s = new Set<unknown>();
        return array.every(i => {
            const h = hash(i);
            if(s.has(h)) return false;
            s.add(h);
            return true;
        });
    };

    export const isSet = <T>(array: readonly T[]) => {
        const s = new Set<unknown>();
        return array.every(i => {
            if(s.has(i)) return false;
            s.add(i);
            return true;
        });
    };

    export const asSetWithCustomEqual = <T>(equals: (a:T, b:T) => boolean) => (array: readonly T[], ) => {
        return array.filter((elem, i) => array.every((x, j) => j<=i || !equals(elem, x)));
    };

    export const asSetUsing = <T>(hash: (a:T) => unknown) => (array: readonly T[]) => {
        const s = new Set<unknown>();
        return array.filter(i => {
            const h = hash(i);
            if(s.has(h)) return false;
            s.add(h);
            return true;
        });
    };

    export const asSet = <T>(array: readonly T[]) => Array.from(new Set(array));

    // only returns a set if first array is a set
    export const intersectionWithCustomEqual = <T>(equals: (a:T, b:T) => boolean) => (arrays: readonly T[][]) => {
        if(arrays.length === 0) return [];
        const [first, ...rest] = arrays;
        return first.filter(elem => rest.every(x => x.some(y => equals(elem, y))));
    };

    /**
     * Find the common elements of all arrays, using a hash method as equality tester
     * Result of hashing is used as native map key -> doesn't have to be a string, but should work with ===
     * Always return a set (eg also deduplicate if inputs contain duplicates)
     */
    export const intersectionUsing = <T>(hash: (a:T) => unknown) => (arrays: readonly T[][]) => {
        const counts = new Map<unknown, {value: T, count: number}>();
        arrays.forEach(array => {
            const seen = new Set<unknown>();
            array.forEach(e => {
                const h = hash(e);
                if(seen.has(h)) return;
                seen.add(h);
                const count = counts.get(h);
                if(!count) counts.set(h, {value: e, count: 1});
                else count.count++;
            })
        });
        return Array.from(counts.values())
            .filter(({count}) => count === arrays.length)
            .map(({value}) => value);
    };

    // always returns a set
    export const unionWithCustomEqual = <T>(equals: (a:T, b:T) => boolean) => (arrays: readonly T[][]) => {
        const union = [] as T[];
        arrays.forEach(array => array.forEach(elem => {
            if(!union.some(x => equals(elem, x))) {
                union.push(elem);
            }
        }))
        return union;
    };

    export const unionUsing = <T>(hash: (a:T) => unknown) => (arrays: readonly T[][]) => {
        const seen = new Set<unknown>();
        const res: T[] = [];
        Matrices.map<T, void>(e => {
            const h = hash(e);
            if(!seen.has(h)) {
                res.push(e);
                seen.add(h);
            }
        })(arrays);
        return res;
    };

    export const range = (from: number, to: number, step: number = from > to ? -1 : 1) => {
        return Array.from({length: Math.floor((to - from)/step)}, (v, i) => from + i * step);
    }

    export const rangeI = (from: number, to: number, step: number = from > to ? -1 : 1) => {
        return Array.from({length: Math.floor((to - from)/step)+1}, (v, i) => from + i * step);
    }

    /**
     * Get all possible combinations of the table elements
     */
    export const crossProduct = <T, U>([t, u]: readonly [readonly T[], readonly U[]]) => t.flatMap(ti => u.map(ui => ([ti, ui] as const)));

    /**
     * Get all possible pairs of elements in the array.
     * Does not care about order (eg will not return both [a, b] and [b, a]), does not consider [a, a] as a valid pair.
     */
    export const getPairs = <T>(array: readonly T[]) => array.flatMap((e, i) => array.filter((_, j) => j > i).map(f => ([e, f] as const)));

    /**
     * Split the array in two smaller ones, according the predicate method
     * @param test 
     * @returns 
     */
    export const partition = <T>(test: predicateFn<T>) => (array: readonly T[]) => {
        const forTrue: T[] = [], forFalse: T[] = [];
        array.forEach((e, i) => (test(e, i, array) ? forTrue : forFalse).push(e));
        return [forTrue, forFalse] as [T[], T[]];
    };

    export const find = <T>(test: predicateFn<T>) => (a: readonly T[]) => a.find(test);
    export const findUnsafe = <T>(test: predicateFn<T>) => (a: readonly T[]) => a.find(test)!;

    /**
     * A random element, assuming the array is not empty
     */
    export const randomElement = <T>(array: readonly T[]) => array[Math.floor(Math.random() * array.length)];


    export const join = <T> (sep: string) => (array: readonly T[]) => array.join(sep);

    export const repeat = <T>(n: number) => (arr: readonly T[]) => Arrays.range(0, n).reduce(acc => acc.concat(arr), [] as T[]);

    export const split = <T>(splitter: predicateFn<T>) => (array: readonly T[]) => {
        const res = [[]] as T[][];
        array.forEach((e, i, a) => {
            const split = splitter(e, i, a);
            if(split) {
                res.push([]);
            } else {
                res[res.length-1].push(e);
            }
        });
        return res;
    }

    /**
     * Merge arrays by picking one value from each in turn
     * Beware, if arrays are of uneven sizes, the end ot the merged array will not sources be evenly from each inputs arrays
     */
    export const mergeAlternating = <T>(...arrays: readonly (readonly T[])[]) => {
        const maxLength = arrays.reduce((max, a) => Math.max(max, a.length), -Infinity);
        const res: T[] = [];
        for(let i = 0 ; i < maxLength ; i++) {
            for(const a of arrays) {
                if(a.length > i) {
                    res.push(a[i]);
                }
            }
        }
        return res;
    }
}

// declare global {
//     interface Array<T> {
//         min(this: Array<number>): number
//     }
// }
// Array.prototype.min = () => 2;
