import { pipe } from 'fp-ts/function';
import { Arrays } from './arrays';

export namespace Objects {
    type O<T> = Readonly<Record<string, T>>;
    type mapFn<T, U> = (elem: T, key: string, object: O<T>) => U;
    type reducerFn<T, U> = (acc: U, elem: T, key: string, array: O<T>) => U;

    export const keys = <T>(obj: O<T>) => Object.keys(obj);
    export const values = <T>(obj: O<T>) => Object.values(obj);
    export const entries = <T>(obj: O<T>) => Object.entries(obj);
    export const fromEntries = <T>(entries: readonly (readonly [string, T])[]) => Object.fromEntries(entries);

    /**
     * Same as fromEntries, but works with entries that are not statically guaranteed to have 2 items
     */
    export const fromEntriesUnsafe = (entries: readonly (readonly string[])[]): Record<string, string> => Object.fromEntries(entries);

    export const fromMap = <T>(map: Map<string, T>) => Object.fromEntries(map.entries());

    export const fromArray = <T>(array: readonly T[]) => pipe(
        array,
        Arrays.map((e, i) => ([''+i, e] as const)),
        Objects.fromEntries
    )

    export const map = <T, U>(fn: mapFn<T, U>) => (o: O<T>): { -readonly [k in keyof typeof o]: U} => pipe(
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

    export const reduce = <T, U>(fn: reducerFn<T, U>, initialValue: U) => (o: O<T>) => pipe(
        o,
        Objects.entries,
        Arrays.reduce((prev, entry) => fn(prev, entry[1], entry[0], o), initialValue),
    );

    export const groupBy = <T>(keys: mapFn<T, string | string[]>) => (obj: O<T>) => {
        const output = {} as Record<string, T[]>;
        Objects.entries(obj).forEach(([k, v]) => {
            const newK = keys(v, k, obj);
            const newKs = Array.isArray(newK) ? newK : [newK];
            newKs.forEach(k => output[k] = (output[k] ?? []).concat([v]));
        });
        return output;
    }

    export const exploreDeep = <T>(getNext: (curr: T) => T | undefined) => {
        function res(base: T | undefined) : T[] {
            return base === undefined ? [] : [base, ...res(getNext(base))]
        }
        return res;
    }
    
    export const pluck = <O extends object, K extends keyof O>(k: K) => (obj: O) => obj[k];

    /**
     * For an object of function, returns a method that will produce an object with each key being the function from the same key applied to the input
     * apply({a: fna, b: fnb}) := (input) => {a: fna(input), b: fnb(input) }
     */
    export const apply = <I, T extends O<(i: I) => unknown>>(obj: T) =>
        (input: I) => pipe(obj, map(fn => fn(input))) as {[k in keyof T]: ReturnType<T[k]>};
}
