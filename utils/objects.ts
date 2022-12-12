import { pipe } from 'fp-ts/function';
import { Arrays } from './arrays';

export const objects = {
    keys: <O extends object>(obj: O) => Object.keys(obj) as (keyof O)[],
    values: <O extends object>(obj: O) => Object.values(obj) as (O[keyof O])[],
    entries: <O extends object>(obj: O) => Object.entries(obj) as [keyof O, O[keyof O]][],
    map<O extends object, U>(fn: (elem: O[keyof O], key: keyof O, object: O) => U) {
        return (obj: O) => Object.fromEntries(Object.entries(obj).map(([k, v]) => ([k, fn(v, k as keyof O, obj)]))) as {[key in keyof O]: U};
    },
    mapKeys<O extends object, U extends string|number|symbol>(fn: (elem: O[keyof O], key: keyof O, object: O) => U) {
        return (obj: O) => Object.fromEntries(Object.entries(obj).map(([k, v]) => ([fn(v, k as keyof O, obj), v]))) as {[key in U]: O[keyof O]};
    },
    filter<O extends object>(fn: (elem: O[keyof O], key: keyof O, object: O) => boolean) {
        return (obj: O) => Object.fromEntries(Object.entries(obj).filter(([k, v]) => fn(v, k as keyof O, obj)));
    },
    reduce<O extends object, U>(fn: (acc: U, elem: O[keyof O], key: keyof O, object: O) => U, initialValue: U) {
        return (obj: O) => Object.entries(obj).reduce((acc, [k, v]) => fn(acc, v, k as keyof O, obj), initialValue);
    },
    pluck<O extends object, K extends keyof O>(k: K) {
        return (obj: O) => obj[k];
    },
    groupBy<K, O extends object>(fn: (elem: O[keyof O], key: keyof O, object: O) => K) {
        return (obj: O) => {
            const map = new Map<K, (O[keyof O])[]>();
            objects.map((v, k) => {
                const newK = fn(v, k, obj);
                const group = map.get(newK) ?? [];
                group.push(v);
                map.set(newK, group);
            })(obj);
            return map;
        }
    },
    pivotToMap<K, O extends object, U, D extends boolean>(
        pivotedKeys: (elem: O[keyof O], index: keyof O, object: O) => K[],
        pivotedValue: (pivotedKeys: K, elem: O[keyof O], index: keyof O, object: O) => U,
        discardUndefined: D
    ) {
        return (obj: O) => pipe(obj,
            objects.entries,
            Arrays.pivotToMap(
                ([k, v]) => pivotedKeys(v, k, obj),
                (newKey, [k, v]) => pivotedValue(newKey, v, k, obj),
                discardUndefined
            )
        );
    },
    pivot<K extends string|number, O extends object, U, D extends boolean>(
        pivotedKeys: (elem: O[keyof O], index: keyof O, object: O) => K[],
        pivotedValue: (pivotedKeys: K, elem: O[keyof O], index: keyof O, object: O) => U,
        discardUndefined: D
    ) {
        return (obj: O) => {
            return pipe(obj,
            objects.entries,
            Arrays.pivot(
                ([k, v]) => pivotedKeys(v, k, obj),
                (newKey, [k, v]) => pivotedValue(newKey, v, k, obj),
                discardUndefined
            )
            );
        }
    },
    exploreDeep<T>(getNext: (curr: T) => T | undefined) {
        function res(base: T | undefined) : T[] {
            return base === undefined ? [] : [base, ...res(getNext(base))]
        }
        return res;
    }
}
