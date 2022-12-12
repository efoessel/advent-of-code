import { pipe } from 'fp-ts/function';
import { Arrays } from './arrays';

export namespace Objects {
    type O<T> = Readonly<Record<string, T>>;
    type mapFn<T, U> = (elem: T, key: string, object: O<T>) => U;

    export const keys = <T>(obj: O<T>) => Object.keys(obj);
    export const values = <T>(obj: O<T>) => Object.values(obj);
    export const entries = <T>(obj: O<T>) => Object.entries(obj);
    export const fromEntries = <T>(entries: readonly (readonly [string, T])[]) => Object.fromEntries(entries);
    export const fromArray = <T>(array: T[]) => pipe(
        array,
        Arrays.map((e, i) => ([''+i, e] as const)),
        Objects.fromEntries
    )

    export const map = <T, U>(fn: mapFn<T, U>) => (o: O<T>) => pipe(
        o,
        Objects.entries,
        Arrays.map((entry) => ([entry[0], fn(entry[1], entry[0], o)] as const)),
        Objects.fromEntries
    );

    export const mapKeys = <T>(fn: mapFn<T, string>) => (o: O<T>) => pipe(
        o,
        Objects.entries,
        Arrays.map((entry) => ([fn(entry[1], entry[0], o), entry[1]] as const)),
        Objects.fromEntries
    );

    export const filter = <T>(fn: mapFn<T, boolean>) => (o: O<T>) => pipe(
        o,
        Objects.entries,
        Arrays.filter((entry) => fn(entry[1], entry[0], o)),
        Objects.fromEntries
    );

    export const reduce = <T, U>(fn: (prev: U, elem: T, key: string, object: O<T>) => U, initialValue: U) => (o: O<T>) => pipe(
        o,
        Objects.entries,
        Arrays.reduce((prev, entry) => fn(prev, entry[1], entry[0], o), initialValue),
    );

    export const groupBy = <T>(fn: mapFn<T, string>) => (obj: O<T>) => {
        const output = {} as Record<string, T[]>;
        Objects.map<T, void>((v, k) => {
            const newK = fn(v, k, obj);
            output[newK] = (output[newK] ?? []).concat([v]);
        })(obj);
        return output as O<T[]>;
    }

    export const pivot = <T, U, D extends boolean>(
        pivotedKeys: mapFn<T, readonly string[]>,
        pivotedValue: (pivotedKey: string, elem: T, originalKey: string, object: O<T>) => U,
        discardUndefined: D
    ) => {
        return (obj: O<T>) => pipe(obj,
            Objects.entries,
            Arrays.pivot(
                ([k, v]) => pivotedKeys(v, k, obj),
                (newKey, [k, v]) => pivotedValue(newKey, v, k, obj),
                discardUndefined
            )
        );
    }

    export const exploreDeep = <T>(getNext: (curr: T) => T | undefined) => {
        function res(base: T | undefined) : T[] {
            return base === undefined ? [] : [base, ...res(getNext(base))]
        }
        return res;
    }
    
    export const pluck = <O extends object, K extends keyof O>(k: K) => (obj: O) => obj[k];
}
